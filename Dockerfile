FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run Next.js dev server with host binding for Docker
CMD ["npm", "run", "dev"]
