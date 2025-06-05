#!/bin/bash

# ioBroker MCP-Server Adapter Installation from GitHub
# Usage: ./install-from-github.sh [host]

HOST=${1:-iobroker2024}
REPO_URL="https://github.com/passuff/iobroker_mcp"
ADAPTER_NAME="mcp-server"
TEMP_DIR="/tmp/iobroker-mcp-install"

echo "Installing ioBroker MCP-Server Adapter from GitHub..."
echo "Host: $HOST"
echo "Repository: $REPO_URL"

# Create temp directory
mkdir -p $TEMP_DIR
cd $TEMP_DIR

# Download repository
echo "Downloading repository..."
wget -q "${REPO_URL}/archive/refs/heads/main.zip" -O main.zip
if [ $? -ne 0 ]; then
    echo "Error: Failed to download repository"
    exit 1
fi

# Extract
echo "Extracting files..."
unzip -q main.zip

# Copy adapter to ioBroker
echo "Installing adapter..."
ADAPTER_DIR="/opt/iobroker/node_modules/iobroker.${ADAPTER_NAME}"
rm -rf "$ADAPTER_DIR"
cp -r iobroker_mcp-main/iobroker.mcp-server "$ADAPTER_DIR"

# Install dependencies
echo "Installing dependencies..."
cd "$ADAPTER_DIR"
npm install --production

# Add adapter to ioBroker
echo "Adding adapter to ioBroker..."
cd /opt/iobroker
iobroker add $ADAPTER_NAME --host $HOST

# Create instance
echo "Creating adapter instance..."
iobroker add ${ADAPTER_NAME}.0 --host $HOST

# Cleanup
rm -rf $TEMP_DIR

echo "Installation complete!"
echo "You can now configure the adapter in the ioBroker admin interface." 