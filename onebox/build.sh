#!/bin/bash
set -e

echo "Node version:"
node --version

echo "Installing backend dependencies..."
cd backend
npm install --no-optional --legacy-peer-deps

echo "Building backend..."
npm run build

echo "Installing frontend dependencies..."
cd ../frontend
npm install --no-optional --legacy-peer-deps

echo "Building frontend..."
CI=false npm run build