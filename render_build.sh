#!/usr/bin/env bash
# EcoGuard Render Build Script
# Ensures a clean build without cache-related hash mismatches

set -o errexit

echo "--- EcoGuard: Starting Build Process ---"

# 1. Update pip to latest
python -m pip install --upgrade pip

# 2. Install dependencies with no-cache-dir
# Renamed to prod_requirements.txt to force a fresh pull from Render
echo "--- EcoGuard: Installing Dependencies from prod_requirements.txt ---"
pip install --no-cache-dir -r "EcoGuard Vision Engine/prod_requirements.txt"

echo "--- EcoGuard: Build Complete ---"
