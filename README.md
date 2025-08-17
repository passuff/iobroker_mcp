# ioBroker MCP Server

Ein MCP (Model Context Protocol) Server für die Integration von ioBroker mit KI-Assistenten wie Claude/Cursor.

## Überblick

Dieses Projekt stellt einen eigenständigen MCP-Server bereit, der über die REST-API mit ioBroker kommuniziert. Der Server ermöglicht es KI-Assistenten, auf ioBroker-States und -Objekte zuzugreifen und diese zu manipulieren.

## Hauptkomponenten

- **`/standalone-mcp-server/`** - Der funktionierende MCP-Server
  - Eigenständige Node.js-Anwendung
  - Kommuniziert über REST-API mit ioBroker
  - Keine Installation als ioBroker-Adapter erforderlich

- **`/docs/`** - Projektdokumentation
  - Konzepte und Hintergrundinformationen
  - Konfigurationsanleitungen

## Dokumentation

- **[RULES.md](./RULES.md)** - Nutzungsregeln und Best Practices für den MCP-Server
- **[IOBROKER_SCRIPT_EXAMPLES.md](./IOBROKER_SCRIPT_EXAMPLES.md)** - Praktische Beispiele für ioBroker-Skript-Entwicklung
- **[docs/iobroker_objects.md](./docs/iobroker_objects.md)** - Detaillierte Beschreibung der ioBroker-Objektstruktur
- **[/standalone-mcp-server/README.md](./standalone-mcp-server/README.md)** - Detaillierte Installationsanleitung
- **[/standalone-mcp-server/CURSOR_SETUP.md](./standalone-mcp-server/CURSOR_SETUP.md)** - Cursor-spezifische Einrichtung

## Installation und Verwendung

Die detaillierte Anleitung zur Installation und Konfiguration finden Sie in:
- [`/standalone-mcp-server/README.md`](./standalone-mcp-server/README.md) - Hauptanleitung
- [`/standalone-mcp-server/CURSOR_SETUP.md`](./standalone-mcp-server/CURSOR_SETUP.md) - Cursor-spezifische Einrichtung

## Schnellstart

```bash
cd standalone-mcp-server
npm install
cp .env.example .env
# .env mit Ihren ioBroker-Einstellungen bearbeiten
npm run build
npm start
```

## Verfügbare MCP-Tools

- `getState` - Einzelnen State lesen
- `setState` - State-Wert schreiben  
- `getStates` - Mehrere States mit Pattern lesen
- `getObject` - Objekt-Informationen abrufen
- `getObjects` - Mehrere Objekte mit Pattern abrufen
- `sendTo` - Nachrichten an Adapter senden

## Voraussetzungen

- Node.js 18 oder höher
- ioBroker mit aktivierter REST-API
- Netzwerkzugriff auf die ioBroker-Instanz

## Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details. 