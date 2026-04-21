# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy built assets and public folder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
