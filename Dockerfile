# ------------------------------
# Base Image
# ------------------------------
FROM node:10-alpine

# ------------------------------
# Metadata
# ------------------------------
LABEL maintainer="Your Name"
LABEL description="Dockerized Node.js authentication sample application"

# ------------------------------
# Environment Variables
# ------------------------------
ENV NODE_ENV=production
ENV PORT=3000

# ------------------------------
# Create App Directory
# ------------------------------
RUN mkdir -p /app

# ------------------------------
# Set Working Directory
# ------------------------------
WORKDIR /app

# ------------------------------
# Install Dependencies
# ------------------------------
COPY package*.json ./

RUN npm install --production && \
    npm cache clean --force

# ------------------------------
# Copy Application Source
# ------------------------------
COPY . .

# ------------------------------
# Security: Use Non-Root User
# ------------------------------
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# ------------------------------
# Expose Application Port
# ------------------------------
EXPOSE 3000

# ------------------------------
# Health Check
# ------------------------------
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# ------------------------------
# Start Application
# ------------------------------
CMD ["node", "bin/www"]
