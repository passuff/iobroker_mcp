# ioBroker MCP-Server Konfigurationsanleitung

## Voraussetzungen

### 1. ioBroker System
- ioBroker muss installiert und erreichbar sein (z.B. auf 192.168.1.19:8081)
- Die REST API muss aktiviert sein
- Optional: Simple API Adapter für erweiterte REST-Funktionen

### 2. Node.js
- Node.js Version 18 oder höher
- npm oder yarn Paketmanager

### 3. MCP-Proxy (für Windows-Clients)
```bash
pip install mcp-proxy
```

## Installation

### 1. Adapter in ioBroker installieren

**Option A: Aus lokalem Verzeichnis**
```bash
cd /opt/iobroker
npm install /pfad/zum/iobroker.mcp-server
iobroker add mcp-server
```

**Option B: Aus npm (wenn veröffentlicht)**
```bash
cd /opt/iobroker
npm install iobroker.mcp-server
iobroker add mcp-server
```

### 2. Adapter konfigurieren

Öffne die ioBroker Admin-Oberfläche und navigiere zu den Adapter-Einstellungen:

#### Server-Konfiguration
- **Server-Port**: 8932 (Standard)
- **Proxy aktivieren**: ✓ (für Remote-Zugriff)
- **Proxy-Port**: 8933 (Standard)

#### Sicherheit
- **Authentifizierung aktivieren**: Optional
- **API-Schlüssel**: Generiere einen sicheren Schlüssel

#### Tool-Kategorien
- **States**: ✓ (State-Management)
- **Objects**: ✓ (Object-Management)
- **Adapters**: ✓ (Adapter-Kontrolle)
- **System**: ✓ (System-Informationen)

#### Filter (Optional)
- **State-Filter**: Regex für erlaubte States (z.B. `^hm-rpc\..*`)
- **Object-Filter**: Regex für erlaubte Objekte

## Cursor Konfiguration

### 1. Öffne Cursor-Einstellungen
- Drücke `Ctrl+,` (Windows/Linux) oder `Cmd+,` (Mac)
- Suche nach "MCP" oder "Model Context Protocol"

### 2. MCP-Server hinzufügen

#### Direkte Verbindung (Linux/Mac auf ioBroker-Host)

Füge folgende Konfiguration zu deiner Cursor-Konfiguration hinzu:

```json
{
  "mcpServers": {
    "iobroker": {
      "command": "node",
      "args": ["/opt/iobroker/node_modules/iobroker.mcp-server/build/lib/mcp-server.js"],
      "env": {
        "IOBROKER_HOST": "localhost",
        "IOBROKER_PORT": "8081"
      }
    }
  }
}
```

#### Remote-Verbindung über MCP-Proxy (Windows)

**Schritt 1: MCP-Proxy installieren**
```bash
pip install mcp-proxy
```

**Schritt 2: Cursor konfigurieren**
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

#### Mit Authentifizierung

Wenn die Authentifizierung aktiviert ist:

```json
{
  "mcpServers": {
    "iobroker": {
      "command": "node",
      "args": ["/opt/iobroker/node_modules/iobroker.mcp-server/build/lib/mcp-server.js"],
      "env": {
        "IOBROKER_HOST": "192.168.1.19",
        "IOBROKER_PORT": "8081",
        "MCP_API_KEY": "dein-api-schluessel",
        "MCP_ENABLE_AUTH": "true"
      }
    }
  }
}
```

## Verwendung in Cursor

Nach erfolgreicher Konfiguration kannst du die ioBroker-Tools in Cursor verwenden:

### Beispiele

**State lesen:**
```
Lies den Wert von system.adapter.admin.0.alive
```

**State setzen:**
```
Setze hm-rpc.0.MEQ1234567.1.STATE auf true
```

**Adapter neustarten:**
```
Starte den Adapter hm-rpc.0 neu
```

**System-Informationen:**
```
Zeige mir die System-Statistiken von ioBroker
```

## Fehlerbehebung

### 1. Verbindungsprobleme

**Symptom**: "Failed to connect to ioBroker"

**Lösungen**:
- Prüfe, ob ioBroker läuft: `http://192.168.1.19:8081`
- Stelle sicher, dass die REST API aktiviert ist
- Prüfe Firewall-Einstellungen

### 2. MCP-Proxy startet nicht

**Symptom**: "mcp-proxy not found"

**Lösungen**:
```bash
# Python und pip prüfen
python --version
pip --version

# MCP-Proxy installieren
pip install mcp-proxy

# Installation prüfen
mcp-proxy --version
```

### 3. Authentifizierungsfehler

**Symptom**: "Authentication failed"

**Lösungen**:
- Prüfe den API-Schlüssel in der Adapter-Konfiguration
- Stelle sicher, dass `MCP_ENABLE_AUTH` und `MCP_API_KEY` korrekt gesetzt sind

### 4. Tool nicht verfügbar

**Symptom**: "Tool iobroker_xxx not found"

**Lösungen**:
- Prüfe, ob die Tool-Kategorie in der Adapter-Konfiguration aktiviert ist
- Starte den Adapter neu

## Erweiterte Konfiguration

### Umgebungsvariablen

Der MCP-Server unterstützt folgende Umgebungsvariablen:

- `IOBROKER_NAMESPACE`: Adapter-Namespace (Standard: mcp-server.0)
- `IOBROKER_HOST`: ioBroker Host (Standard: localhost)
- `IOBROKER_PORT`: ioBroker Port (Standard: 8081)
- `MCP_API_KEY`: API-Schlüssel für Authentifizierung
- `MCP_ENABLE_AUTH`: Authentifizierung aktivieren (true/false)

### Logging

Aktiviere Debug-Logging für detaillierte Informationen:

1. In ioBroker Admin → Instanzen
2. Klicke auf das Experten-Symbol
3. Setze Log-Level auf "debug"

### Performance-Optimierung

Für bessere Performance bei vielen Anfragen:

1. Erhöhe `maxConcurrentRequests` in der Adapter-Konfiguration
2. Reduziere `requestTimeout` für schnellere Fehlerbehandlung
3. Verwende spezifische Filter statt Wildcards

## Sicherheitshinweise

1. **Netzwerk**: Beschränke den Zugriff auf den MCP-Proxy durch Firewall-Regeln
2. **API-Schlüssel**: Verwende starke, zufällig generierte Schlüssel
3. **Filter**: Nutze restriktive Filter für produktive Umgebungen
4. **Updates**: Halte alle Komponenten aktuell

## Support

Bei Problemen:
1. Prüfe die Logs in ioBroker
2. Aktiviere Debug-Logging
3. Erstelle ein Issue auf GitHub mit:
   - ioBroker Version
   - Adapter Version
   - Fehlermeldungen
   - Konfiguration (ohne sensible Daten) 