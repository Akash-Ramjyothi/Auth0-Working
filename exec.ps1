#!/usr/bin/env bash

set -e

# Configuration
IMAGE_NAME="auth0-javascript-sample-01-login"
CONTAINER_PORT=3000
HOST_PORT=3000

echo "🚀 Building Docker image: ${IMAGE_NAME}"

docker build \
  --rm \
  --tag "${IMAGE_NAME}" \
  .

echo "✅ Docker image built successfully"

echo "📦 Starting container on http://localhost:${HOST_PORT}"

docker run \
  --rm \
  --interactive \
  --tty \
  --publish "${HOST_PORT}:${CONTAINER_PORT}" \
  --name "${IMAGE_NAME}" \
  "${IMAGE_NAME}"

echo "🛑 Container stopped"
