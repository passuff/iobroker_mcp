# Konzept: ioBroker MCP-Server Adapter

## Übersicht
Der ioBroker MCP-Server Adapter ermöglicht es, ioBroker über das Model Context Protocol (MCP) zu steuern. Dies erlaubt die Integration von ioBroker in KI-gestützte Entwicklungsumgebungen wie Cursor.

## Architektur

### Komponenten
1. **ioBroker Adapter** (`iobroker.mcp-server`)
   - Verwaltet den MCP-Server-Prozess
   - Konfiguration über Admin-Interface
   - Überwacht Verbindungsstatus

2. **MCP-Server** (`lib/mcp-server.ts`)
   - Eigenständiger Node.js-Prozess
   - Kommuniziert über stdio mit MCP-Clients
   - Verbindet sich über REST API mit ioBroker

3. **MCP-Proxy** (optional)
   - Ermöglicht Remote-Zugriff von Windows-Clients
   - Wandelt stdio in HTTP/WebSocket um

### Datenfluss
```
Cursor (Windows) 
    ↓ (MCP Protocol)
MCP-Proxy (HTTP/WS)
    ↓ (stdio)
MCP-Server 
    ↓ (REST API)
ioBroker System (192.168.1.19:8081)
```

## Implementierung

### Verbindung zu ioBroker
Der MCP-Server nutzt die ioBroker REST API für die Kommunikation:
- **Host/Port**: Aus Umgebungsvariablen oder Konfiguration
- **Authentifizierung**: Optional über API-Key
- **Protokoll**: HTTP/REST für maximale Kompatibilität

### MCP Tools

#### State Management
- `iobroker_getState`: Liest einen State-Wert
- `iobroker_setState`: Setzt einen State-Wert
- `iobroker_getStates`: Liest mehrere States per Pattern
- `iobroker_subscribeState`: Abonniert State-Änderungen
- `iobroker_getStateHistory`: Liest historische Werte
- `iobroker_getStateInfo`: Detaillierte State-Informationen

#### Object Management
- `iobroker_getObject`: Liest ein Objekt
- `iobroker_getObjectList`: Listet Objekte per Pattern
- `iobroker_createObject`: Erstellt ein neues Objekt
- `iobroker_updateObject`: Aktualisiert ein Objekt
- `iobroker_deleteObject`: Löscht ein Objekt

#### Adapter Control
- `iobroker_getAdapterInstances`: Listet Adapter-Instanzen
- `iobroker_controlAdapter`: Start/Stop/Restart von Adaptern
- `iobroker_getAdapterConfig`: Liest Adapter-Konfiguration
- `iobroker_updateAdapterConfig`: Aktualisiert Konfiguration
- `iobroker_getAdapterLogs`: Liest Adapter-Logs

#### System Information
- `iobroker_getSystemInfo`: System-Informationen
- `iobroker_getSystemStats`: CPU/Memory/Disk Statistiken
- `iobroker_getInstalledAdapters`: Installierte Adapter
- `iobroker_getSystemHosts`: Multi-Host Informationen
- `iobroker_executeCommand`: Führt System-Befehle aus

## Konfiguration

### Adapter-Einstellungen
- **Server-Port**: Port für MCP-Server (Standard: 8932)
- **Proxy aktivieren**: MCP-Proxy für Remote-Zugriff
- **Proxy-Port**: Port für MCP-Proxy (Standard: 8933)
- **Authentifizierung**: API-Key für Zugriffskontrolle
- **Tool-Kategorien**: Aktivierung/Deaktivierung von Tool-Gruppen
- **Filter**: Regex-Filter für States/Objekte

### Umgebungsvariablen
- `IOBROKER_NAMESPACE`: Adapter-Namespace
- `IOBROKER_HOST`: ioBroker Host
- `IOBROKER_PORT`: ioBroker Port
- `MCP_API_KEY`: API-Schlüssel
- `MCP_ENABLE_AUTH`: Authentifizierung aktiviert

## Installation & Nutzung

### Installation in ioBroker
```bash
cd /opt/iobroker
npm install iobroker.mcp-server
iobroker add mcp-server
```

### Konfiguration in Cursor
1. Öffne Cursor-Einstellungen
2. Navigiere zu MCP-Konfiguration
3. Füge Server hinzu:

**Direkte Verbindung (Linux/Mac):**
```json
{
  "mcpServers": {
    "iobroker": {
      "command": "node",
      "args": ["/opt/iobroker/node_modules/iobroker.mcp-server/lib/mcp-server.js"],
      "env": {
        "IOBROKER_HOST": "192.168.1.19",
        "IOBROKER_PORT": "8081"
      }
    }
  }
}
```

**Über MCP-Proxy (Windows):**
```json
{
  "mcpServers": {
    "iobroker": {
      "command": "mcp-proxy-client",
      "args": ["http://192.168.1.19:8933"]
    }
  }
}
```

## Sicherheit

### Zugriffskontrolle
- API-Key-Authentifizierung für MCP-Zugriff
- Regex-Filter für erlaubte States/Objekte
- Separate Berechtigungen für Tool-Kategorien

### Netzwerk
- MCP-Proxy nur bei Bedarf aktivieren
- Firewall-Regeln für Proxy-Port
- HTTPS/WSS für verschlüsselte Verbindungen (zukünftig)

## Entwicklung

### Build-Prozess
```bash
npm install
npm run build
```

### Projekt-Struktur
```
iobroker.mcp-server/
├── src/
│   └── main.ts          # Haupt-Adapter
├── lib/
│   ├── mcp-server.ts    # MCP-Server Implementation
│   └── tools/           # MCP-Tool Definitionen
│       ├── states.ts
│       ├── objects.ts
│       ├── adapters.ts
│       └── system.ts
├── admin/
│   ├── index.html       # Admin-Interface
│   └── words.js         # Übersetzungen
├── package.json
├── io-package.json
└── README.md
```

### Erweiterung
Neue Tools können in `lib/tools/` hinzugefügt werden:
1. Erstelle neue Tool-Datei
2. Implementiere Tool-Funktionen
3. Registriere Tools in `mcp-server.ts`

## Roadmap

### Version 0.2.0
- [ ] WebSocket-Unterstützung für Echtzeit-Updates
- [ ] Erweiterte Authentifizierung (OAuth2)
- [ ] Tool-spezifische Berechtigungen

### Version 0.3.0
- [ ] Grafische Tool-Konfiguration
- [ ] Batch-Operationen
- [ ] Performance-Optimierungen

### Version 1.0.0
- [ ] Stabile API
- [ ] Vollständige Dokumentation
- [ ] Beispiel-Integrationen 