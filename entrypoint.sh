#!/bin/sh
# Docker entrypoint script for CCBot
# Ensures Discord slash commands are deployed before bot startup

set -e

echo "Deploying Discord commands..."
node /app/src/deploy-commands.js

echo "Starting bot..."
node /app/src/index.js
