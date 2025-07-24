#!/bin/bash
# Railway start script
echo "Starting BOOM Card API..."
echo "Working directory: $(pwd)"
echo "Files in directory:"
ls -la
echo "Starting server..."
exec node server-simple.js