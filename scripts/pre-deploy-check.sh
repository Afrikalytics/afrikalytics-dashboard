#!/usr/bin/env bash
###############################################################################
# pre-deploy-check.sh — Pre-deployment validation for Afrikalytics
#
# Validates frontend/backend coherence and deployment readiness.
#
# Checks:
#   0. Git working tree is clean
#   1. Required environment variables are set
#   2. No hardcoded secrets in source code
#   3. Dashboard build passes (npm run build)
#   4. API syntax check (python AST parse)
#   5. Frontend/backend endpoint coherence
#   6. Hardcoded API URLs
#   7. RBAC roles consistency between frontend and backend
#
# Usage:
#   ./scripts/pre-deploy-check.sh [dashboard|api|all] [--skip-build] [--ci]
#
# Flags:
#   --skip-build   Skip the npm run build step (faster for quick checks)
#   --ci           Machine-readable output (no colors, suitable for CI logs)
#
# Exit codes: 0 = all checks passed, 1 = at least one check failed
###############################################################################
set -euo pipefail

# ---------------------------------------------------------------------------
# Parse flags
# ---------------------------------------------------------------------------
SKIP_BUILD=false
CI_MODE=false
POSITIONAL_TARGET=""

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --ci)         CI_MODE=true ;;
    -*)           echo "Unknown flag: $arg"; exit 2 ;;
    *)            POSITIONAL_TARGET="$arg" ;;
  esac
done

# ---------------------------------------------------------------------------
# Colors and logging
# ---------------------------------------------------------------------------
if $CI_MODE; then
  RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' NC=''
else
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  NC='\033[0m'
fi

log_info()    { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${CYAN}INFO${NC}  $*"; }
log_success() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${GREEN}PASS${NC}  $*"; }
log_warn()    { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${YELLOW}WARN${NC}  $*"; }
log_error()   { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${RED}FAIL${NC}  $*"; }

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DASHBOARD_DIR="${ROOT_DIR}/afrikalytics-dashboard"
API_DIR="${ROOT_DIR}/afrikalytics-api"

TARGET="${POSITIONAL_TARGET:-all}"
FAILURES=0
WARNINGS=0

# ---------------------------------------------------------------------------
# Check 1: Required environment variables
# ---------------------------------------------------------------------------
check_env_vars_api() {
    log_info "Checking API environment variables..."

    local required_vars=(
        "DATABASE_URL"
        "SECRET_KEY"
        "RESEND_API_KEY"
    )

    local optional_vars=(
        "PAYDUNYA_MASTER_KEY"
        "PAYDUNYA_PRIVATE_KEY"
        "PAYDUNYA_TOKEN"
        "PAYDUNYA_MODE"
        "SENTRY_DSN"
        "FRONTEND_URL"
        "ENVIRONMENT"
    )

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_warn "Required env var ${var} is not set (will use Railway secrets in production)"
            ((WARNINGS++))
        else
            log_success "Env var ${var} is set"
        fi
    done

    for var in "${optional_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_info "Optional env var ${var} is not set"
        fi
    done
}

check_env_vars_dashboard() {
    log_info "Checking Dashboard environment variables..."

    if [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
        log_warn "NEXT_PUBLIC_API_URL is not set (will use Vercel env vars in production)"
        ((WARNINGS++))
    else
        log_success "NEXT_PUBLIC_API_URL is set: ${NEXT_PUBLIC_API_URL}"
    fi
}

# ---------------------------------------------------------------------------
# Check 2: No hardcoded secrets
# ---------------------------------------------------------------------------
check_no_hardcoded_secrets() {
    log_info "Scanning for hardcoded secrets..."

    local patterns=(
        'SECRET_KEY\s*=\s*"[^"]{8,}"'
        'password\s*=\s*"[^"]{4,}"'
        'api_key\s*=\s*"re_[a-zA-Z0-9]+'
        'PAYDUNYA.*=\s*"[a-zA-Z0-9_-]{10,}"'
        'postgresql://[^$][^{].*@.*:.*/'
    )

    local scan_dirs=()
    if [[ "$TARGET" == "all" || "$TARGET" == "dashboard" ]]; then
        scan_dirs+=("$DASHBOARD_DIR")
    fi
    if [[ "$TARGET" == "all" || "$TARGET" == "api" ]]; then
        scan_dirs+=("$API_DIR")
    fi

    local found_secrets=false

    for dir in "${scan_dirs[@]}"; do
        for pattern in "${patterns[@]}"; do
            local results
            results=$(grep -rn --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" \
                -E "$pattern" "$dir" \
                --exclude-dir=node_modules \
                --exclude-dir=.next \
                --exclude-dir=venv \
                --exclude-dir=__pycache__ \
                --exclude="*.example" \
                --exclude="*.md" \
                2>/dev/null || true)

            if [[ -n "$results" ]]; then
                # Filter out false positives (env var references, comments, examples)
                local filtered
                filtered=$(echo "$results" | grep -v 'os\.getenv\|os\.environ\|process\.env\|\.env\.\|# \|// \|\.example\|fallback\|default\|change.in.production\|your-' || true)
                if [[ -n "$filtered" ]]; then
                    log_error "Potential hardcoded secret found:"
                    echo "$filtered" | head -5
                    found_secrets=true
                fi
            fi
        done
    done

    if [[ "$found_secrets" == "true" ]]; then
        ((FAILURES++))
    else
        log_success "No hardcoded secrets detected"
    fi
}

# ---------------------------------------------------------------------------
# Check 3: Dashboard build check
# ---------------------------------------------------------------------------
check_dashboard_build() {
    log_info "Checking Dashboard build..."

    if [[ ! -d "$DASHBOARD_DIR" ]]; then
        log_error "Dashboard directory not found: ${DASHBOARD_DIR}"
        ((FAILURES++))
        return
    fi

    if [[ ! -f "$DASHBOARD_DIR/package.json" ]]; then
        log_error "package.json not found in dashboard"
        ((FAILURES++))
        return
    fi

    # Check lint first (faster)
    log_info "Running ESLint..."
    if (cd "$DASHBOARD_DIR" && npm run lint -- --quiet 2>&1); then
        log_success "ESLint passed"
    else
        log_warn "ESLint reported issues (non-blocking)"
        ((WARNINGS++))
    fi

    # Run production build (unless --skip-build)
    if $SKIP_BUILD; then
        log_info "Skipping production build (--skip-build flag)"
    else
        log_info "Running production build (npm run build)..."
        if (cd "$DASHBOARD_DIR" && npm run build 2>&1); then
            log_success "Dashboard build succeeded"
        else
            log_error "Dashboard build FAILED"
            ((FAILURES++))
        fi
    fi
}

# ---------------------------------------------------------------------------
# Check 4: API syntax check
# ---------------------------------------------------------------------------
check_api_syntax() {
    log_info "Checking API syntax..."

    if [[ ! -d "$API_DIR" ]]; then
        log_error "API directory not found: ${API_DIR}"
        ((FAILURES++))
        return
    fi

    if [[ ! -f "$API_DIR/main.py" ]]; then
        log_error "main.py not found in API"
        ((FAILURES++))
        return
    fi

    # Check Python syntax for all .py files
    local syntax_errors=0
    while IFS= read -r -d '' pyfile; do
        if ! python -c "import ast; ast.parse(open('${pyfile}').read())" 2>/dev/null; then
            # Fallback: try python3
            if ! python3 -c "import ast; ast.parse(open('${pyfile}').read())" 2>/dev/null; then
                log_error "Syntax error in: ${pyfile}"
                ((syntax_errors++))
            fi
        fi
    done < <(find "$API_DIR" -name "*.py" -not -path "*/venv/*" -not -path "*/__pycache__/*" -print0 2>/dev/null)

    if [[ "$syntax_errors" -eq 0 ]]; then
        log_success "API Python syntax OK"
    else
        log_error "${syntax_errors} file(s) with syntax errors"
        ((FAILURES++))
    fi
}

# ---------------------------------------------------------------------------
# Check 5: Endpoint coherence (frontend uses endpoints that backend exposes)
# ---------------------------------------------------------------------------
check_endpoint_coherence() {
    log_info "Checking frontend/backend endpoint coherence..."

    if [[ ! -d "$DASHBOARD_DIR" || ! -d "$API_DIR" ]]; then
        log_warn "Cannot check coherence: missing directories"
        ((WARNINGS++))
        return
    fi

    # Extract API endpoints from dashboard source (patterns like /api/...)
    local frontend_endpoints
    frontend_endpoints=$(grep -roh --include="*.tsx" --include="*.ts" \
        '/api/[a-zA-Z_/-]*' "$DASHBOARD_DIR/app/" \
        --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null \
        | sort -u || true)

    # Extract API endpoints from backend routers
    local backend_endpoints
    backend_endpoints=$(grep -roh --include="*.py" \
        '"/api/[a-zA-Z_/{}-]*"' "$API_DIR/" \
        --exclude-dir=venv --exclude-dir=__pycache__ 2>/dev/null \
        | tr -d '"' | sort -u || true)

    if [[ -z "$frontend_endpoints" ]]; then
        log_warn "Could not extract frontend API calls"
        ((WARNINGS++))
        return
    fi

    if [[ -z "$backend_endpoints" ]]; then
        log_warn "Could not extract backend endpoints"
        ((WARNINGS++))
        return
    fi

    local missing=0
    while IFS= read -r endpoint; do
        # Skip dynamic segments and normalize
        local normalized
        normalized=$(echo "$endpoint" | sed 's/\${[^}]*}/\{id\}/g' | sed 's/\/$//')

        # Check if a matching route prefix exists in backend
        local base_path
        base_path=$(echo "$normalized" | sed 's/\/[^/]*$//')

        if ! echo "$backend_endpoints" | grep -q "^${base_path}"; then
            log_warn "Frontend uses ${endpoint} but no matching backend route found"
            ((missing++))
        fi
    done <<< "$frontend_endpoints"

    if [[ "$missing" -eq 0 ]]; then
        log_success "Frontend/backend endpoint coherence OK"
    else
        log_warn "${missing} endpoint(s) may not match (review manually)"
        ((WARNINGS++))
    fi
}

# ---------------------------------------------------------------------------
# Check 0: Git working tree is clean
# ---------------------------------------------------------------------------
check_git_clean() {
    log_info "Checking git working tree..."

    if ! command -v git &>/dev/null; then
        log_warn "git not found, skipping working tree check"
        ((WARNINGS++))
        return
    fi

    if [ ! -d "$ROOT_DIR/.git" ]; then
        log_warn "Not a git repository, skipping working tree check"
        ((WARNINGS++))
        return
    fi

    if git -C "$ROOT_DIR" diff --quiet 2>/dev/null && \
       git -C "$ROOT_DIR" diff --cached --quiet 2>/dev/null; then
        log_success "Git working tree is clean"
    else
        log_error "Git working tree has uncommitted changes — commit or stash before deploying"
        git -C "$ROOT_DIR" status --short 2>/dev/null | head -10
        ((FAILURES++))
    fi
}

# ---------------------------------------------------------------------------
# Check 7: RBAC roles consistency between frontend and backend
# ---------------------------------------------------------------------------
check_rbac_consistency() {
    log_info "Checking RBAC roles consistency..."

    # Frontend roles (from constants.ts)
    local frontend_roles
    frontend_roles=$(grep -oE '(super_admin|admin_content|admin_studies|admin_insights|admin_reports)' \
        "$DASHBOARD_DIR/lib/constants.ts" 2>/dev/null | sort -u || true)

    # Backend roles (from permissions.py and routers)
    local backend_roles
    backend_roles=$(grep -rhoE '(super_admin|admin_content|admin_studies|admin_insights|admin_reports)' \
        "$API_DIR/app/permissions.py" "$API_DIR/app/routers/" \
        2>/dev/null | sort -u || true)

    if [[ -z "$frontend_roles" ]]; then
        log_warn "Could not extract frontend RBAC roles"
        ((WARNINGS++))
        return
    fi

    if [[ -z "$backend_roles" ]]; then
        log_warn "Could not extract backend RBAC roles"
        ((WARNINGS++))
        return
    fi

    local missing_backend
    missing_backend=$(comm -23 <(echo "$frontend_roles") <(echo "$backend_roles") 2>/dev/null || true)

    local missing_frontend
    missing_frontend=$(comm -13 <(echo "$frontend_roles") <(echo "$backend_roles") 2>/dev/null || true)

    if [[ -z "$missing_backend" ]] && [[ -z "$missing_frontend" ]]; then
        log_success "RBAC roles are consistent ($(echo "$frontend_roles" | wc -l) roles matched)"
    else
        if [[ -n "$missing_backend" ]]; then
            log_error "Roles in frontend but NOT in backend: $missing_backend"
            ((FAILURES++))
        fi
        if [[ -n "$missing_frontend" ]]; then
            log_warn "Roles in backend but NOT in frontend: $missing_frontend"
            ((WARNINGS++))
        fi
    fi
}

# ---------------------------------------------------------------------------
# Check 6: Hardcoded API URL in dashboard
# ---------------------------------------------------------------------------
check_hardcoded_api_url() {
    log_info "Checking for hardcoded API URLs in dashboard..."

    local hardcoded
    hardcoded=$(grep -rn --include="*.tsx" --include="*.ts" \
        'web-production-ef657\.up\.railway\.app' "$DASHBOARD_DIR/app/" \
        --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null || true)

    if [[ -n "$hardcoded" ]]; then
        local count
        count=$(echo "$hardcoded" | wc -l)
        log_warn "Found ${count} file(s) with hardcoded Railway API URL (should use NEXT_PUBLIC_API_URL):"
        echo "$hardcoded" | head -5
        ((WARNINGS++))
    else
        log_success "No hardcoded API URLs found"
    fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
echo ""
echo -e "${CYAN}=======================================${NC}"
echo -e "${CYAN}  Afrikalytics Pre-Deploy Checks${NC}"
echo -e "${CYAN}=======================================${NC}"
echo ""
echo -e "${BOLD}Target:${NC} ${TARGET}"
echo -e "${BOLD}Root:${NC}   ${ROOT_DIR}"
echo ""

case "$TARGET" in
    dashboard)
        check_git_clean
        echo ""
        check_env_vars_dashboard
        echo ""
        check_no_hardcoded_secrets
        echo ""
        check_hardcoded_api_url
        echo ""
        check_dashboard_build
        ;;
    api)
        check_git_clean
        echo ""
        check_env_vars_api
        echo ""
        check_no_hardcoded_secrets
        echo ""
        check_api_syntax
        ;;
    all)
        check_git_clean
        echo ""
        check_env_vars_api
        check_env_vars_dashboard
        echo ""
        check_no_hardcoded_secrets
        echo ""
        check_hardcoded_api_url
        echo ""
        check_api_syntax
        echo ""
        check_endpoint_coherence
        echo ""
        check_rbac_consistency
        echo ""
        check_dashboard_build
        ;;
    *)
        log_error "Unknown target: ${TARGET}"
        echo "Usage: $0 [dashboard|api|all] [--skip-build] [--ci]"
        exit 2
        ;;
esac

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo -e "${CYAN}=======================================${NC}"
echo -e "${CYAN}  Summary${NC}"
echo -e "${CYAN}=======================================${NC}"
echo ""

if [[ "$FAILURES" -gt 0 ]]; then
    echo -e "${RED}${FAILURES} check(s) FAILED, ${WARNINGS} warning(s)${NC}"
    echo -e "${RED}Deployment is NOT recommended.${NC}"
    exit 1
elif [[ "$WARNINGS" -gt 0 ]]; then
    echo -e "${YELLOW}All checks passed with ${WARNINGS} warning(s).${NC}"
    echo -e "${YELLOW}Review warnings before deploying.${NC}"
    exit 0
else
    echo -e "${GREEN}All checks passed. Ready to deploy.${NC}"
    exit 0
fi
