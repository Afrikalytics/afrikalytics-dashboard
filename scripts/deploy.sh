#!/usr/bin/env bash
###############################################################################
# deploy.sh — Datatym AI Cross-Project Deployment Orchestrator
#
# Coordinates deployment of the API (Railway) and Dashboard (Vercel) in the
# correct order: API first, then Dashboard. Includes pre-deploy checks,
# health checks, and automatic rollback on failure.
#
# Usage:
#   ./deploy.sh <environment> [options]
#
# Arguments:
#   staging       Deploy to staging environment
#   production    Deploy to production environment
#
# Options:
#   --api-only        Deploy only the API
#   --dashboard-only  Deploy only the Dashboard
#   --skip-checks     Skip pre-deploy validation checks
#   --skip-build      Skip local build verification
#   --dry-run         Show what would be deployed without deploying
#   --force           Skip confirmation prompt for production
#   --rollback        Rollback to previous deployment
#   --help            Show this help message
#
# Prerequisites:
#   - git (clean working tree)
#   - gh CLI (authenticated)
#   - railway CLI (authenticated) — for API deployment
#   - vercel CLI (authenticated) — for Dashboard deployment
#   - curl — for health checks
#
# Environment variables (optional overrides):
#   API_URL_STAGING      Staging API URL
#   API_URL_PRODUCTION   Production API URL
#   DASH_URL_STAGING     Staging Dashboard URL
#   DASH_URL_PRODUCTION  Production Dashboard URL
#
# Exit codes:
#   0 = deployment successful
#   1 = deployment failed (rollback attempted)
#   2 = invalid arguments
#   3 = pre-deploy checks failed
###############################################################################
set -euo pipefail

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
DASHBOARD_DIR="$ROOT_DIR/Datatym AI-dashboard"
API_DIR="$ROOT_DIR/Datatym AI-api"
HEALTH_CHECK_SCRIPT="$ROOT_DIR/scripts/health-check.sh"
PRE_DEPLOY_SCRIPT="$ROOT_DIR/scripts/pre-deploy-check.sh"

# Default URLs per environment
API_URL_STAGING="${API_URL_STAGING:-https://Datatym AI-api-staging.up.railway.app}"
API_URL_PRODUCTION="${API_URL_PRODUCTION:?ERROR: API_URL_PRODUCTION environment variable is required}"
DASH_URL_STAGING="${DASH_URL_STAGING:-https://Datatym AI-staging.vercel.app}"
DASH_URL_PRODUCTION="${DASH_URL_PRODUCTION:-https://Datatym AI.vercel.app}"

# Retry/timeout configuration
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=10
HEALTH_CHECK_TIMEOUT=15
DEPLOY_TIMEOUT=300

# Railway service names per environment
RAILWAY_SERVICE_API_STAGING="${RAILWAY_SERVICE_API_STAGING:-Datatym AI-api-staging}"
RAILWAY_SERVICE_API_PROD="${RAILWAY_SERVICE_API_PROD:-Datatym AI-api}"

# ---------------------------------------------------------------------------
# Colors and logging
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[DEPLOY $(date '+%H:%M:%S')]${NC} ${CYAN}INFO${NC}   $*"; }
log_success() { echo -e "${BLUE}[DEPLOY $(date '+%H:%M:%S')]${NC} ${GREEN}OK${NC}     $*"; }
log_warn()    { echo -e "${BLUE}[DEPLOY $(date '+%H:%M:%S')]${NC} ${YELLOW}WARN${NC}   $*"; }
log_error()   { echo -e "${BLUE}[DEPLOY $(date '+%H:%M:%S')]${NC} ${RED}ERROR${NC}  $*"; }
log_step()    { echo -e "\n${BOLD}${CYAN}>>> $*${NC}\n"; }

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
ENVIRONMENT=""
API_ONLY=false
DASHBOARD_ONLY=false
SKIP_CHECKS=false
SKIP_BUILD=false
DRY_RUN=false
FORCE=false
DO_ROLLBACK=false

show_help() {
    head -42 "${BASH_SOURCE[0]}" | tail -38
    exit 0
}

for arg in "$@"; do
  case "$arg" in
    staging)          ENVIRONMENT="staging" ;;
    production)       ENVIRONMENT="production" ;;
    --api-only)       API_ONLY=true ;;
    --dashboard-only) DASHBOARD_ONLY=true ;;
    --skip-checks)    SKIP_CHECKS=true ;;
    --skip-build)     SKIP_BUILD=true ;;
    --dry-run)        DRY_RUN=true ;;
    --force)          FORCE=true ;;
    --rollback)       DO_ROLLBACK=true ;;
    --help|-h)        show_help ;;
    *)                echo "Unknown argument: $arg"; show_help ;;
  esac
done

if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment is required. Usage: ./deploy.sh <staging|production> [options]"
    exit 2
fi

if $API_ONLY && $DASHBOARD_ONLY; then
    log_error "Cannot use --api-only and --dashboard-only together"
    exit 2
fi

# Set environment-specific variables
if [[ "$ENVIRONMENT" == "production" ]]; then
    API_URL="$API_URL_PRODUCTION"
    DASH_URL="$DASH_URL_PRODUCTION"
    RAILWAY_SERVICE="$RAILWAY_SERVICE_API_PROD"
    VERCEL_FLAG="--prod"
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    API_URL="$API_URL_STAGING"
    DASH_URL="$DASH_URL_STAGING"
    RAILWAY_SERVICE="$RAILWAY_SERVICE_API_STAGING"
    VERCEL_FLAG=""
fi

# Determine what to deploy
DEPLOY_API=true
DEPLOY_DASHBOARD=true
if $API_ONLY; then DEPLOY_DASHBOARD=false; fi
if $DASHBOARD_ONLY; then DEPLOY_API=false; fi

# ---------------------------------------------------------------------------
# State tracking for rollback
# ---------------------------------------------------------------------------
API_DEPLOYED=false
DASHBOARD_DEPLOYED=false
API_PREV_COMMIT=""
DASHBOARD_PREV_DEPLOYMENT=""

save_rollback_state() {
    local state_file="$ROOT_DIR/.deploy-state"
    cat > "$state_file" <<EOF
DEPLOY_TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
ENVIRONMENT=$ENVIRONMENT
API_PREV_COMMIT=$API_PREV_COMMIT
DASHBOARD_PREV_DEPLOYMENT=$DASHBOARD_PREV_DEPLOYMENT
GIT_COMMIT=$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || echo "unknown")
EOF
    log_info "Rollback state saved to .deploy-state"
}

# ---------------------------------------------------------------------------
# Prerequisites check
# ---------------------------------------------------------------------------
check_prerequisites() {
    log_step "Checking prerequisites"

    local missing=()

    if ! command -v git &>/dev/null; then missing+=("git"); fi
    if ! command -v curl &>/dev/null; then missing+=("curl"); fi

    if $DEPLOY_API; then
        if ! command -v railway &>/dev/null; then
            log_warn "railway CLI not found — will use git push deployment"
        fi
    fi

    if $DEPLOY_DASHBOARD; then
        if ! command -v vercel &>/dev/null; then
            log_warn "vercel CLI not found — will use git push deployment via Vercel GitHub integration"
        fi
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing[*]}"
        exit 2
    fi

    log_success "Prerequisites OK"
}

# ---------------------------------------------------------------------------
# Pre-deploy validation
# ---------------------------------------------------------------------------
run_pre_deploy_checks() {
    log_step "Running pre-deploy checks"

    if [[ ! -f "$PRE_DEPLOY_SCRIPT" ]]; then
        log_warn "Pre-deploy script not found at $PRE_DEPLOY_SCRIPT, skipping"
        return
    fi

    local check_target="all"
    if $API_ONLY; then check_target="api"; fi
    if $DASHBOARD_ONLY; then check_target="dashboard"; fi

    local build_flag=""
    if $SKIP_BUILD; then build_flag="--skip-build"; fi

    if bash "$PRE_DEPLOY_SCRIPT" "$check_target" $build_flag; then
        log_success "Pre-deploy checks passed"
    else
        log_error "Pre-deploy checks failed"
        exit 3
    fi
}

# ---------------------------------------------------------------------------
# Health check with retries
# ---------------------------------------------------------------------------
wait_for_health() {
    local name="$1"
    local url="$2"
    local retries="${3:-$HEALTH_CHECK_RETRIES}"
    local interval="${4:-$HEALTH_CHECK_INTERVAL}"

    log_info "Waiting for $name to be healthy ($url/health)..."

    for ((i=1; i<=retries; i++)); do
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time "$HEALTH_CHECK_TIMEOUT" \
            "${url}/health" 2>/dev/null) || true

        if [[ "$http_code" == "200" ]]; then
            # Verify the response body contains "healthy"
            local body
            body=$(curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "${url}/health" 2>/dev/null) || true
            if echo "$body" | grep -qi "healthy"; then
                log_success "$name is healthy (attempt $i/$retries)"
                return 0
            fi
        fi

        if [[ "$i" -lt "$retries" ]]; then
            log_warn "$name not ready (HTTP $http_code), retrying in ${interval}s... ($i/$retries)"
            sleep "$interval"
        fi
    done

    log_error "$name failed health check after $retries attempts"
    return 1
}

# Check if dashboard is responding (no /health endpoint, check HTTP 200 on /)
wait_for_dashboard() {
    local name="$1"
    local url="$2"
    local retries="${3:-$HEALTH_CHECK_RETRIES}"
    local interval="${4:-$HEALTH_CHECK_INTERVAL}"

    log_info "Waiting for $name to respond ($url)..."

    for ((i=1; i<=retries; i++)); do
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time "$HEALTH_CHECK_TIMEOUT" \
            "$url" 2>/dev/null) || true

        # Accept 200 or 307/308 (redirect is expected for / -> /login)
        if [[ "$http_code" =~ ^(200|301|302|307|308)$ ]]; then
            log_success "$name is responding (HTTP $http_code, attempt $i/$retries)"
            return 0
        fi

        if [[ "$i" -lt "$retries" ]]; then
            log_warn "$name not ready (HTTP $http_code), retrying in ${interval}s... ($i/$retries)"
            sleep "$interval"
        fi
    done

    log_error "$name failed to respond after $retries attempts"
    return 1
}

# ---------------------------------------------------------------------------
# Deploy API (Railway)
# ---------------------------------------------------------------------------
deploy_api() {
    log_step "Deploying API to $ENVIRONMENT"

    # Record current deployment for rollback
    if command -v railway &>/dev/null; then
        API_PREV_COMMIT=$(railway status 2>/dev/null | grep -oP 'Commit: \K\w+' || echo "unknown")
    else
        API_PREV_COMMIT=$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")
    fi

    if $DRY_RUN; then
        log_info "[DRY RUN] Would deploy API to $ENVIRONMENT"
        log_info "[DRY RUN] API URL: $API_URL"
        log_info "[DRY RUN] Previous commit: $API_PREV_COMMIT"
        return 0
    fi

    # Strategy 1: Railway CLI (if available)
    if command -v railway &>/dev/null; then
        log_info "Deploying via Railway CLI..."
        (cd "$API_DIR" && railway up --service "$RAILWAY_SERVICE" --detach) || {
            log_error "Railway deploy command failed"
            return 1
        }
    else
        # Strategy 2: Git push (Railway auto-deploys from GitHub)
        log_info "Railway CLI not available. Deploying via git push..."
        local current_branch
        current_branch=$(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || echo "main")

        if [[ "$ENVIRONMENT" == "production" && "$current_branch" != "main" ]]; then
            log_error "Production deploys must be from 'main' branch (current: $current_branch)"
            return 1
        fi

        # Push to trigger Railway auto-deploy
        git -C "$ROOT_DIR" push origin "$current_branch" || {
            log_error "Git push failed"
            return 1
        }
    fi

    # Wait for deployment to be live
    log_info "Waiting for API deployment to propagate (30s)..."
    sleep 30

    # Health check
    if wait_for_health "API" "$API_URL"; then
        API_DEPLOYED=true
        log_success "API deployed successfully to $ENVIRONMENT"
    else
        log_error "API deployment failed health check"
        return 1
    fi
}

# ---------------------------------------------------------------------------
# Deploy Dashboard (Vercel)
# ---------------------------------------------------------------------------
deploy_dashboard() {
    log_step "Deploying Dashboard to $ENVIRONMENT"

    # Record current state for rollback
    if command -v vercel &>/dev/null; then
        DASHBOARD_PREV_DEPLOYMENT=$(vercel ls --limit 1 2>/dev/null | tail -1 | awk '{print $1}' || echo "unknown")
    fi

    if $DRY_RUN; then
        log_info "[DRY RUN] Would deploy Dashboard to $ENVIRONMENT"
        log_info "[DRY RUN] Dashboard URL: $DASH_URL"
        log_info "[DRY RUN] Vercel flag: $VERCEL_FLAG"
        return 0
    fi

    # Strategy 1: Vercel CLI (if available)
    if command -v vercel &>/dev/null; then
        log_info "Deploying via Vercel CLI..."
        local deploy_output
        deploy_output=$(cd "$DASHBOARD_DIR" && vercel deploy $VERCEL_FLAG --yes 2>&1) || {
            log_error "Vercel deploy command failed"
            echo "$deploy_output"
            return 1
        }
        log_info "Vercel output: $deploy_output"
    else
        # Strategy 2: Git push (Vercel auto-deploys from GitHub)
        log_info "Vercel CLI not available. Vercel auto-deploys from GitHub on push."
        log_info "Ensure the push in the API step triggered a Vercel build."

        local current_branch
        current_branch=$(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || echo "main")

        # If API was not deployed (dashboard-only), we need to push
        if ! $DEPLOY_API; then
            git -C "$ROOT_DIR" push origin "$current_branch" || {
                log_error "Git push failed"
                return 1
            }
        fi
    fi

    # Wait for Vercel deployment to propagate
    log_info "Waiting for Dashboard deployment to propagate (45s)..."
    sleep 45

    # Health check
    if wait_for_dashboard "Dashboard" "$DASH_URL"; then
        DASHBOARD_DEPLOYED=true
        log_success "Dashboard deployed successfully to $ENVIRONMENT"
    else
        log_error "Dashboard deployment failed health check"
        return 1
    fi
}

# ---------------------------------------------------------------------------
# Rollback
# ---------------------------------------------------------------------------
rollback() {
    log_step "Rolling back deployment"

    local state_file="$ROOT_DIR/.deploy-state"

    # Load previous state if doing a standalone rollback
    if $DO_ROLLBACK && [[ -f "$state_file" ]]; then
        source "$state_file"
        log_info "Loaded rollback state from $state_file"
        log_info "  Previous API commit: $API_PREV_COMMIT"
        log_info "  Previous Dashboard deployment: $DASHBOARD_PREV_DEPLOYMENT"
    fi

    local rollback_success=true

    # Rollback API
    if $DEPLOY_API && $API_DEPLOYED; then
        log_info "Rolling back API..."
        if command -v railway &>/dev/null && [[ "$API_PREV_COMMIT" != "unknown" ]]; then
            (cd "$API_DIR" && railway rollback 2>/dev/null) || {
                log_warn "Railway rollback command not available, manual rollback required"
                log_warn "Previous commit: $API_PREV_COMMIT"
                rollback_success=false
            }
        else
            log_warn "Automatic API rollback not available"
            log_warn "Manual rollback: git revert HEAD && git push"
            log_warn "Or: railway redeploy --commit $API_PREV_COMMIT"
            rollback_success=false
        fi
    fi

    # Rollback Dashboard
    if $DEPLOY_DASHBOARD && $DASHBOARD_DEPLOYED; then
        log_info "Rolling back Dashboard..."
        if command -v vercel &>/dev/null && [[ "$DASHBOARD_PREV_DEPLOYMENT" != "unknown" && -n "$DASHBOARD_PREV_DEPLOYMENT" ]]; then
            (cd "$DASHBOARD_DIR" && vercel promote "$DASHBOARD_PREV_DEPLOYMENT" --yes 2>/dev/null) || {
                log_warn "Vercel rollback failed, manual rollback required"
                rollback_success=false
            }
        else
            log_warn "Automatic Dashboard rollback not available"
            log_warn "Manual rollback: vercel promote <previous-deployment-url>"
            rollback_success=false
        fi
    fi

    if $rollback_success; then
        log_success "Rollback completed"
    else
        log_warn "Partial rollback — some services may need manual intervention"
    fi
}

# ---------------------------------------------------------------------------
# Production confirmation
# ---------------------------------------------------------------------------
confirm_production() {
    if $FORCE || $DRY_RUN; then return 0; fi

    echo ""
    echo -e "${RED}${BOLD}WARNING: You are about to deploy to PRODUCTION${NC}"
    echo ""
    echo -e "  API:       ${API_URL}"
    echo -e "  Dashboard: ${DASH_URL}"
    echo -e "  Branch:    $(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || echo 'unknown')"
    echo -e "  Commit:    $(git -C "$ROOT_DIR" log --oneline -1 2>/dev/null || echo 'unknown')"
    echo ""
    read -r -p "Type 'deploy' to confirm: " confirmation

    if [[ "$confirmation" != "deploy" ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
echo ""
echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN}  Datatym AI Deployment Orchestrator${NC}"
echo -e "${CYAN}=====================================================${NC}"
echo ""
echo -e "  ${BOLD}Environment:${NC}  $ENVIRONMENT"
echo -e "  ${BOLD}Deploy API:${NC}   $DEPLOY_API"
echo -e "  ${BOLD}Deploy Dash:${NC}  $DEPLOY_DASHBOARD"
echo -e "  ${BOLD}Dry run:${NC}      $DRY_RUN"
echo -e "  ${BOLD}Skip checks:${NC}  $SKIP_CHECKS"
echo ""

DEPLOY_START=$(date +%s)

# Handle standalone rollback
if $DO_ROLLBACK; then
    rollback
    exit $?
fi

# Production safety gate
if [[ "$ENVIRONMENT" == "production" ]]; then
    confirm_production
fi

# Step 1: Check prerequisites
check_prerequisites

# Step 2: Run pre-deploy validation
if ! $SKIP_CHECKS; then
    run_pre_deploy_checks
else
    log_info "Pre-deploy checks skipped (--skip-checks)"
fi

# Save rollback state before deploying
save_rollback_state

# Step 3: Deploy API first (backend must be ready before frontend)
if $DEPLOY_API; then
    if ! deploy_api; then
        log_error "API deployment failed"
        if $API_DEPLOYED; then
            log_info "Attempting rollback..."
            rollback
        fi
        exit 1
    fi
else
    log_info "Skipping API deployment (--dashboard-only)"
fi

# Step 4: Deploy Dashboard (depends on API being healthy)
if $DEPLOY_DASHBOARD; then
    if ! deploy_dashboard; then
        log_error "Dashboard deployment failed"
        log_info "Attempting rollback..."
        rollback
        exit 1
    fi
else
    log_info "Skipping Dashboard deployment (--api-only)"
fi

# Step 5: Final cross-service health check
log_step "Final health verification"

FINAL_OK=true

if $DEPLOY_API; then
    if ! wait_for_health "API (final)" "$API_URL" 3 5; then
        FINAL_OK=false
    fi
fi

if $DEPLOY_DASHBOARD; then
    if ! wait_for_dashboard "Dashboard (final)" "$DASH_URL" 3 5; then
        FINAL_OK=false
    fi
fi

# Step 6: Cross-service connectivity check
if $DEPLOY_API && $DEPLOY_DASHBOARD && ! $DRY_RUN; then
    log_info "Verifying API CORS allows Dashboard origin..."
    cors_check=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: $DASH_URL" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        --max-time 10 \
        "${API_URL}/health" 2>/dev/null) || true

    if [[ "$cors_check" =~ ^(200|204)$ ]]; then
        log_success "CORS preflight OK (Dashboard -> API)"
    else
        log_warn "CORS preflight returned HTTP $cors_check (may need FRONTEND_URL env var update)"
    fi
fi

DEPLOY_END=$(date +%s)
DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN}  Deployment Summary${NC}"
echo -e "${CYAN}=====================================================${NC}"
echo ""
echo -e "  ${BOLD}Environment:${NC}  $ENVIRONMENT"
echo -e "  ${BOLD}Duration:${NC}     ${DEPLOY_DURATION}s"

if $DEPLOY_API; then
    if $API_DEPLOYED || $DRY_RUN; then
        echo -e "  ${BOLD}API:${NC}          ${GREEN}Deployed${NC} -> $API_URL"
    else
        echo -e "  ${BOLD}API:${NC}          ${RED}Failed${NC}"
    fi
fi

if $DEPLOY_DASHBOARD; then
    if $DASHBOARD_DEPLOYED || $DRY_RUN; then
        echo -e "  ${BOLD}Dashboard:${NC}    ${GREEN}Deployed${NC} -> $DASH_URL"
    else
        echo -e "  ${BOLD}Dashboard:${NC}    ${RED}Failed${NC}"
    fi
fi

echo ""

if $FINAL_OK || $DRY_RUN; then
    echo -e "${GREEN}Deployment to $ENVIRONMENT completed successfully.${NC}"
    echo ""
    echo -e "  Rollback state saved to: ${BOLD}.deploy-state${NC}"
    echo -e "  To rollback: ${BOLD}./deploy.sh $ENVIRONMENT --rollback${NC}"
    exit 0
else
    echo -e "${RED}Deployment completed with health check warnings.${NC}"
    echo -e "${YELLOW}Monitor the services and consider rolling back if issues persist.${NC}"
    echo -e "  To rollback: ${BOLD}./deploy.sh $ENVIRONMENT --rollback${NC}"
    exit 1
fi
