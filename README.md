# ioBroker MCP Server

Ein umfassender MCP (Model Context Protocol) Server für die Integration von ioBroker mit KI-Assistenten wie Claude/Cursor.

## Überblick

Dieses Projekt stellt einen eigenständigen MCP-Server bereit, der über die REST-API mit ioBroker kommuniziert. Der Server ermöglicht es KI-Assistenten, vollständigen Zugriff auf ioBroker-Funktionalitäten zu erhalten.

## Hauptkomponenten

- **`/standalone-mcp-server/`** - Der funktionierende MCP-Server
  - Eigenständige Node.js-Anwendung
  - Kommuniziert über REST-API mit ioBroker
  - Keine Installation als ioBroker-Adapter erforderlich
  - Intelligente Zeitzonen-Behandlung
  - Robuste Fehlerbehandlung

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

## MCP-Tools Status

### ✅ **Funktionierende Tools (9/13)**

#### **Core State Operations**
- **`getState`** ✅ - Einzelnen State lesen
- **`setState`** ✅ - State-Wert schreiben mit Acknowledgment
- **`getStates`** ✅ - Mehrere States mit Pattern-Matching lesen

#### **Object Management**
- **`getObject`** ✅ - Detaillierte Objekt-Informationen abrufen
- **`getObjects`** ✅ - Mehrere Objekte mit Pattern und Type-Filtering abrufen

#### **Historical Data**
- **`getHistory`** ✅ - Historische Daten mit intelligenter Zeitzonen-Behandlung
  - Unterstützt relative Zeitformate: "5m", "2h", "3d", "1w"
  - Unterstützt ISO-Datumsstrings: "2025-08-16T10:00:00"
  - Automatische lokale Zeitzonen-Erkennung und Konvertierung
  - Flexible Aggregationsoptionen (min, max, avg, sum, count, onchange)

#### **Adapter Control**
- **`sendTo`** ✅ - Befehle an Adapter senden
  - Adapter-Restart/Start/Stop-Funktionalität
  - Allgemeine Nachrichtenversendung an Adapter-Instanzen
- **`startScript`** ✅ - JavaScript-Skripte mit Adapter-Status-Prüfung starten

#### **File Operations**
- **`writeFile`** ✅ - Dateien in ioBroker-Adapter mit Base64-Kodierung schreiben

#### **System Operations**
- **`logMessage`** ✅ - Log-Einträge zu ioBroker hinzufügen

### ❌ **Nicht funktionierende Tools (4/13)**

#### **File Operations**
- **`readFile`** ❌ - "Not exists" (Status: 500)
  - **Problem:** Datei existiert nicht oder Pfad ist falsch
  - **Lösung:** Gültige Dateipfade verwenden oder bessere Fehlerbehandlung

#### **System Operations**
- **`readLogs`** ❌ - "no file loggers" (Status: 500)
  - **Problem:** ioBroker ist nicht für File-Logging konfiguriert
  - **Lösung:** ioBroker-Konfiguration anpassen oder Tool deaktivieren

#### **Adapter Control**
- **`sendTo` (für andere Commands)** ❌ - Timeout (30s) für bestimmte Commands
  - **Problem:** Bestimmte Commands (wie `getScripts`) timeouten
  - **Lösung:** Timeout erhöhen oder Command-spezifische Behandlung

#### **Script Management**
- **`startScript`** ❌ - "javascript.0 adapter is not running"
  - **Problem:** JavaScript-Adapter läuft nicht
  - **Lösung:** Adapter starten oder Tool für nicht-laufende Adapter anpassen

## Besondere Features

### **Intelligente Zeitzonen-Behandlung**
- Automatische Erkennung der lokalen Zeitzone
- Flexible Eingabeformate (relative Zeiten, ISO-Daten)
- Konsistente Ausgabe in lokaler Zeitzone
- UTC-Konvertierung für API-Aufrufe

### **Robuste Fehlerbehandlung**
- Umfassende Fehlerberichterstattung
- Fallback-Mechanismen für kritische Operationen
- Benutzerfreundliche Fehlermeldungen

### **Performance-Optimierungen**
- Optimierte Adapter-Restart-Logik
- Effiziente History-Abfragen
- Reduzierte API-Latenz

## Voraussetzungen

- Node.js 18 oder höher
- ioBroker mit aktivierter REST-API
- ioBroker History-Adapter (für historische Datenabfragen)
- Netzwerkzugriff auf die ioBroker-Instanz

## Bekannte Probleme & Lösungen

### **Adapter-Restarts dauern 1-2 Minuten**
- **Ursache:** Komplexe Adapter mit vielen verbundenen Geräten
- **Lösung:** Normales Verhalten für Netzwerk-Adapter (Shelly, etc.)

### **"no file loggers" Fehler**
- **Ursache:** ioBroker nicht für File-Logging konfiguriert
- **Lösung:** ioBroker-Konfiguration anpassen oder Tool deaktivieren

### **"Not exists" bei readFile**
- **Ursache:** Datei existiert nicht oder Adapter nicht zugänglich
- **Lösung:** Gültige Adapter-Instanzen verwenden (z.B. `admin.0`)

## Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details. 