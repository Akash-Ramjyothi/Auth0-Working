#!/usr/bin/env bash

# ============================================================
# Auth0 JavaScript Sample - Docker Runner
# ============================================================

set -e

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

IMAGE_NAME="auth0-javascript-sample-01-login"
CONTAINER_NAME="auth0-js-login-app"
PORT="3000"

# ------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------

print_header() {
  echo ""
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

# ------------------------------------------------------------
# Build Docker Image
# ------------------------------------------------------------

print_header "Building Docker Image"

docker build \
  --tag "${IMAGE_NAME}" \
  .

echo "Docker image built successfully."

# ------------------------------------------------------------
# Stop Existing Container (If Running)
# ------------------------------------------------------------

if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
  print_header "Removing Existing Container"

  docker rm -f "${CONTAINER_NAME}"

  echo "Old container removed."
fi

# ------------------------------------------------------------
# Run Docker Container
# ------------------------------------------------------------

print_header "Starting Docker Container"

docker run \
  --init \
  --interactive \
  --tty \
  --publish "${PORT}:3000" \
  --name "${CONTAINER_NAME}" \
  "${IMAGE_NAME}"

echo ""
echo "Application is running at:"
echo "http://localhost:${PORT}"
