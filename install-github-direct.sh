#!/bin/bash

# Direct installation script for ioBroker MCP-Server from GitHub

echo "=== ioBroker MCP-Server Installation ==="

# Variables
IOBROKER_DIR="/opt/iobroker"
TEMP_DIR="/tmp/mcp-install-$$"
GITHUB_REPO="https://github.com/passuff/iobroker_mcp"
ADAPTER_DIR_NAME="iobroker.mcp-server"

# Check if running as iobroker user or with sudo
if [ "$USER" != "iobroker" ] && [ "$EUID" -ne 0 ]; then 
    echo "Please run as iobroker user or with sudo"
    exit 1
fi

# Create temp directory
echo "Creating temporary directory..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download repository
echo "Downloading from GitHub..."
wget -q "${GITHUB_REPO}/archive/refs/heads/main.zip" -O repo.zip
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to download repository"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Extract
echo "Extracting files..."
unzip -q repo.zip
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to extract files"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Check if adapter directory exists in download
if [ ! -d "iobroker_mcp-main/${ADAPTER_DIR_NAME}" ]; then
    echo "ERROR: Adapter directory not found in repository"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Remove old installation if exists
if [ -d "${IOBROKER_DIR}/node_modules/${ADAPTER_DIR_NAME}" ]; then
    echo "Removing old installation..."
    rm -rf "${IOBROKER_DIR}/node_modules/${ADAPTER_DIR_NAME}"
fi

# Copy adapter files
echo "Copying adapter files..."
cp -r "iobroker_mcp-main/${ADAPTER_DIR_NAME}" "${IOBROKER_DIR}/node_modules/"

# Change to adapter directory
cd "${IOBROKER_DIR}/node_modules/${ADAPTER_DIR_NAME}"

# Install dependencies
echo "Installing dependencies..."
npm install --production --no-save

# Build TypeScript if needed
if [ -f "tsconfig.json" ] && [ -d "src" ]; then
    echo "Building TypeScript..."
    npm run build || echo "Build step skipped"
fi

# Change ownership
if [ "$EUID" -eq 0 ]; then
    chown -R iobroker:iobroker "${IOBROKER_DIR}/node_modules/${ADAPTER_DIR_NAME}"
fi

# Register adapter with full path
echo "Registering adapter..."
cd "$IOBROKER_DIR"
iobroker add "${IOBROKER_DIR}/node_modules/${ADAPTER_DIR_NAME}"

# Check if registration was successful
sleep 2
if iobroker list instances | grep -q "mcp-server"; then
    echo "✓ Adapter successfully installed!"
else
    echo "Creating instance..."
    iobroker add mcp-server.0
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "=== Installation Complete ==="
echo "Next steps:"
echo "1. Check adapter in admin: http://192.168.1.19:8081"
echo "2. Configure the adapter settings"
echo "3. Start the adapter instance" 