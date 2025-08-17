# Cursor Integration für ioBroker MCP Server

## Voraussetzungen

1. ioBroker läuft und ist erreichbar
2. **ioBroker REST API Adapter installiert und konfiguriert** ⭐ **WICHTIG!**
3. Node.js ist auf deinem Windows-PC installiert
4. Der Standalone MCP Server ist installiert und gebaut

### **REST API Installation:**
```bash
# Im ioBroker Admin-Interface:
# 1. Adapter → REST API installieren
# 2. Instanz erstellen (z.B. rest-api.0)
# 3. Port konfigurieren (Standard: 8087)
# 4. Authentication aktivieren falls gewünscht
# 5. Instanz starten
# 6. Simple API deaktivieren (wichtig!)
```

**Wichtig**: Der MCP Server verwendet ausschließlich die REST API. Die Simple API muss deaktiviert sein!

## Installation des MCP Servers

1. Öffne ein Terminal im `standalone-mcp-server` Verzeichnis
2. Führe aus: `install.bat`
3. Bearbeite die `.env` Datei mit deinen ioBroker-Einstellungen:
   ```env
   IOBROKER_HOST=192.168.1.19
   IOBROKER_PORT=8087
   ```

## Cursor Konfiguration

1. Öffne Cursor
2. Gehe zu: File → Preferences → Settings
3. Suche nach "MCP"
4. Klicke auf "Edit in settings.json"

5. Füge folgende Konfiguration hinzu:

```json
{
  "mcpServers": {
    "iobroker": {
      "command": "node",
      "args": ["C:\\prog\\iobroker_mcp\\standalone-mcp-server\\dist\\index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Wichtig**: Passe den Pfad an deine Installation an!

## Alternative: Mit MCP-Proxy für Remote-Zugriff

Wenn du den MCP-Server nicht lokal laufen lassen möchtest:

1. Installiere den MCP-Proxy auf dem ioBroker-System
2. Konfiguriere Cursor für Remote-Zugriff:

```json
{
  "mcpServers": {
    "iobroker-remote": {
      "transport": {
        "type": "sse",
        "url": "http://192.168.1.19:3000/sse"
      }
    }
  }
}
```

## Verfügbare Befehle in Cursor

Nach der Konfiguration kannst du in Cursor folgende Befehle nutzen:

### States lesen:
```
Zeige mir den Wert von system.adapter.admin.0.alive
```

### States mit Sonderzeichen:
```
Zeige mir den Wert von shelly.0.SHPLG-S#9A3649#1.Relay0.Power
```
**Hinweis**: Sonderzeichen wie `#` werden automatisch URL-encoded.

### States schreiben:
```
Setze den State hm-rpc.0.ABC123.1.STATE auf true
```

### Mehrere States abrufen:
```
Liste alle States die mit hm-rpc.0 beginnen
```

### Objekte abrufen:
```
Zeige mir das Objekt system.adapter.admin.0
```

### Script-Management (NEU):
```
Starte das Script javascript.0.Lüfter_Bad_Anbau
Stoppe das Script javascript.0.Lüfter_Bad_Anbau
```

### Log-Management (NEU):
```
Zeige mir die Log-Dateien für localhost
Füge einen Log-Eintrag hinzu: "Test-Nachricht" mit Level "info"
```

### File-Operationen (NEU):
```
Lies die Datei vis.0/main/vis-views.json
Schreibe in die Datei vis.0/main/test.json den Inhalt: {"test": true}
```

### History-Daten (NEU):
```
Zeige mir die History-Daten für system.adapter.admin.0.memRss der letzten Stunde
Zeige mir die durchschnittlichen Werte für zigbee.0.00158d008b3d3ece.humidity der letzten 24h mit 1h-Schritten
Zeige mir die letzten 10 Werte für shelly.0.SHPLG-S#9A3649#1.Relay0.Power
```

### Nachrichten senden:
```
Sende eine Nachricht an telegram.0 mit dem Text "Hallo von Cursor"
```

## Implementierte REST API Funktionen

### ✅ Bereits implementiert (REST API):
- **States**: `getState()`, `setState()`, `getStates()`
- **Objects**: `getObject()`, `getObjects()`
- **Scripts**: `startScript()`, `stopScript()`
- **Logs**: `readLogs()`, `logMessage()`
- **Files**: `readFile()`, `writeFile()`
- **History**: `getHistory()` ⭐
- **Messages**: `sendTo()` (vollständig)

### ❌ Noch NICHT implementiert:
- **Admin**: `getAdapters()`, `getInstances()`, etc.
- **Binary States**: `getBinaryState()`, `setBinaryState()`
- **Advanced sendTo**: Komplexe Nachrichten mit Payload

## Fehlerbehebung

### "Connection refused"
- Prüfe ob ioBroker läuft
- Prüfe ob die REST API aktiviert ist
- Prüfe die Firewall-Einstellungen

### "Not found: datapoint" bei Sonderzeichen
- **Problem**: Datenpunkte mit `#` werden abgeschnitten
- **Lösung**: Der MCP-Server verwendet jetzt automatisch URL-Encoding
- **Beispiel**: `shelly.0.SHPLG-S#9A3649#1.Relay0.Power` wird korrekt verarbeitet

### URL-Encoding für Sonderzeichen
Der MCP-Server behandelt automatisch folgende Sonderzeichen:
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `@` → `%40`

**Beispiel**:
```
shelly.0.SHPLG-S#9A3649#1.Relay0.Power
```
wird intern zu:
```
shelly.0.SHPLG-S%239A3649%231.Relay0.Power
```

### "Function not supported"
- **Problem**: Einige REST API Funktionen sind über Simple API nicht verfügbar
- **Lösung**: Verwende die vollständige REST API oder Admin-Interface
- **Betroffene Funktionen**: Komplexe `sendTo()`, Admin-Funktionen

### "Cannot GET /get/..." oder "Cannot GET /history"
- **Problem**: REST API Adapter ist nicht installiert oder nicht gestartet
- **Lösung**: 
  1. Im ioBroker Admin-Interface: Adapter → REST API installieren
  2. Instanz erstellen und konfigurieren
  3. Port 8087 freigeben
  4. Instanz starten
  5. **Simple API deaktivieren** (wichtig!)
  6. MCP Server neu starten

### "Function not supported"
- **Problem**: Einige REST API Funktionen sind über Simple API nicht verfügbar
- **Lösung**: Verwende die vollständige REST API oder Admin-Interface
- **Betroffene Funktionen**: Komplexe `sendTo()`, Admin-Funktionen

## History-Funktionen

Die `getHistory`-Funktion unterstützt verschiedene Ausgabeformate für bessere LLM-Lesbarkeit:

### Verfügbare Formate:

1. **`raw`** (Standard): Vollständige ioBroker-Antwort mit allen Metadaten
2. **`simple`**: Vereinfachtes Tabellenformat mit [timestamp, value] Paaren
3. **`csv`**: CSV-ähnliches Format für einfache Verarbeitung
4. **`summary`**: Zusammenfassung mit Statistiken und Trend-Analyse
5. **`hourly`**: Stündliche Durchschnitte
6. **`daily`**: Tägliche Durchschnitte

### Beispiel-Verwendung:

```javascript
// Zusammenfassung der letzten Stunde
getHistory("sensor.id", {start: "1h", end: "now"}, "summary")

// Stündliche Durchschnitte der letzten 24 Stunden
getHistory("sensor.id", {start: "24h", end: "now"}, "hourly")
```

### Format-Beispiele:

**Summary-Format:**
```json
{
  "id": "sensor.id",
  "period": "2025-08-16T12:00:00.000Z to 2025-08-16T13:00:00.000Z",
  "statistics": {
    "total_entries": 120,
    "value_range": {"min": 20.5, "max": 25.3},
    "average": 22.8,
    "trend": "increasing",
    "update_frequency": "every_30_seconds"
  },
  "recent_values": [
    ["2025-08-16T13:00:00.000Z", 25.1],
    ["2025-08-16T12:59:30.000Z", 25.0]
  ]
}
```

**Simple-Format:**
```json
{
  "id": "sensor.id",
  "data": [
    ["2025-08-16T13:00:00.000Z", 25.1],
    ["2025-08-16T12:59:30.000Z", 25.0]
  ],
  "summary": {
    "count": 120,
    "min": 20.5,
    "max": 25.3,
    "avg": 22.8
  }
}
```

## Chart-Viewer Funktion

Die `createChartViewer`-Funktion erstellt interaktive HTML-Charts für mehrere Sensoren:

### Verwendung:

```javascript
createChartViewer({
  title: "Meine Sensoren",
  data: [
    {
      id: "sensor1.id",
      label: "Temperatur",
      color: "#FF0000",
      data: [[timestamp1, value1], [timestamp2, value2], ...]
    },
    {
      id: "sensor2.id", 
      label: "Feuchtigkeit",
      color: "#00FF00",
      data: [[timestamp1, value1], [timestamp2, value2], ...]
    }
  ],
  width: 1200,
  height: 600
})
```

### Features:

- **Interaktive Charts**: Zoom, Pan, Tooltips
- **Mehrere Signale**: Bis zu 10 verschiedene Sensoren gleichzeitig
- **Zeitbasierte X-Achse**: Automatische Zeitformatierung
- **Responsive Design**: Passt sich der Bildschirmgröße an
- **Farbkodierung**: Individuelle Farben pro Sensor

### Workflow:

1. `getHistory()` für jeden Sensor mit `format: "simple"` aufrufen
2. Daten in `createChartViewer()` übergeben
3. Interaktiven Chart anzeigen

## Test der Verbindung

Nach der Konfiguration kannst du testen:

```
Zeige mir den Wert von system.adapter.admin.0.alive
```

Sollte `true` zurückgeben, wenn ioBroker läuft.

## Performance-Tipps

1. **Performance**: Für bessere Performance nutze spezifische State-IDs statt Patterns
2. **Sicherheit**: Nutze HTTPS und Authentifizierung in Produktivumgebungen
3. **Logging**: Prüfe die Cursor Developer Tools (Help → Toggle Developer Tools) für Fehler 