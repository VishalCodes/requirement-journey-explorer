#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 [dev|prod]"
    echo "  dev   - Run the development server"
    echo "  prod  - Run the production server"
    exit 1
}

# Check if an argument is provided
if [ $# -eq 0 ]; then
    usage
fi

# Get the mode from argument
MODE=$1

# Function to setup Python environment
setup_python() {
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python -m venv venv
    fi
    
    source venv/bin/activate
    pip install -r backend/requirements.txt
}

case $MODE in
    dev)
        echo "Starting development server..."
        setup_python
        cd backend && python app.py
        ;;
    prod)
        echo "Starting production server..."
        setup_python
        cd backend && gunicorn -w 4 -b 0.0.0.0:5001 app:app
        ;;
    *)
        usage
        ;;
esac 