# GitHub Setup für ioBroker MCP-Server Adapter

## Option 1: Separates Repository (Empfohlen)

1. **Neues Repository erstellen:**
   - Name: `ioBroker.mcp-server` (mit Punkt!)
   - Nur den Adapter-Code hochladen

2. **Struktur:**
   ```
   ioBroker.mcp-server/
   ├── admin/
   ├── lib/
   ├── src/
   ├── package.json
   ├── io-package.json
   ├── README.md
   └── ...
   ```

3. **Installation:**
   ```bash
   iobroker url https://github.com/passuff/ioBroker.mcp-server --host iobroker2024
   ```

## Option 2: Monorepo mit Unterverzeichnis

1. **package.json im Root erstellen:**
   ```json
   {
     "name": "iobroker-mcp-workspace",
     "private": true,
     "workspaces": [
       "iobroker.mcp-server"
     ]
   }
   ```

2. **Installation mit Pfad:**
   ```bash
   # Mit npm direkt
   cd /opt/iobroker
   npm install https://github.com/passuff/iobroker_mcp/tarball/main
   cd node_modules
   mv iobroker_mcp/iobroker.mcp-server ./
   rm -rf iobroker_mcp
   iobroker add mcp-server --host iobroker2024

   # Oder manuell
   cd /opt/iobroker
   git clone https://github.com/passuff/iobroker_mcp.git temp_mcp
   cp -r temp_mcp/iobroker.mcp-server ./node_modules/
   rm -rf temp_mcp
   iobroker add mcp-server --host iobroker2024
   ```

## Option 3: Installation über npm (wenn published)

1. **NPM Package veröffentlichen:**
   ```bash
   npm login
   npm publish
   ```

2. **Installation:**
   ```bash
   iobroker install mcp-server --host iobroker2024
   ```

## Fehlerbehandlung

### SSH Fehler vermeiden:
```bash
# Git config für HTTPS statt SSH
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://
```

### Alternative Installation:
```bash
# Direkt von GitHub ZIP
cd /opt/iobroker
wget https://github.com/passuff/iobroker_mcp/archive/refs/heads/main.zip
unzip main.zip
cp -r iobroker_mcp-main/iobroker.mcp-server ./node_modules/
rm -rf main.zip iobroker_mcp-main
iobroker add mcp-server --host iobroker2024
``` 