#include <WiFi.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <rdm6300.h>

// Define constants
#define EEPROM_SIZE 512
#define SSID_MAX_LENGTH 32
#define PASSWORD_MAX_LENGTH 64
#define ENDPOINT_MAX_LENGTH 128
#define TERMINAL_ID_LENGTH 32
#define AUTH_KEY_LENGTH 64

#define RDM6300_RX_PIN 4

// Define LED pins
#define RED_LED 12
#define YELLOW_LED 13
#define GREEN_LED 14
#define BUZZER_PIN 15

// Global variables
char ssid[SSID_MAX_LENGTH] = "";
char password[PASSWORD_MAX_LENGTH] = "";
char endpoint[ENDPOINT_MAX_LENGTH] = "";
char terminalId[TERMINAL_ID_LENGTH] = "";
char authKey[AUTH_KEY_LENGTH] = "";
unsigned long lastPing = 0;
int failedPings = 0;
WebServer server(80);

// Function prototypes
void setupWiFi();
void createHotspot();
void handleRoot();
void handleSave();
bool pingEndpoint();
bool sendUpdateConfirmation();
void loadConfig();
void saveConfig();
void setLED(int red, int yellow, int green);
void sendRFIDScan(uint32_t rfidTag);
void buzz(int duration);

Rdm6300 rdm6300;

void setup() {
  // Initialize LED pins as outputs
  pinMode(RED_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Set initial LED state (red = not active)
  setLED(HIGH, LOW, LOW);
  
  Serial.begin(115200);
  Serial.println("\n--- Terminal Starting ---");
  EEPROM.begin(EEPROM_SIZE);

  Serial.println("Loading configuration from EEPROM...");
  loadConfig();
  Serial.println("Configuration loaded.");
  
  setupWiFi();

  rdm6300.begin(RDM6300_RX_PIN);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {

    // if last ping is zero it means the device is still not pinged once so we keep the yellow LED on// if last ping is zero it means the device is still not pinged once so we keep the yellow LED on
    if (lastPing == 0) {
      setLED(LOW, HIGH, LOW);  // Yellow LED (in connection)
      delay(1000);
    }

    unsigned long currentTime = millis();
    if ((currentTime - lastPing > 60000) || lastPing == 0) {  // Ping every 60 seconds
      if (pingEndpoint()) {
        setLED(LOW, LOW, HIGH);

        failedPings = 0;
        lastPing = currentTime;
      } else {
        setLED(LOW, HIGH, LOW);  // Yellow LED (failed but there is a chance)

        failedPings++;
        if (failedPings >= 3) {
          Serial.println("3 consecutive pings failed. Creating hotspot.");
          setLED(HIGH, LOW, LOW);  // Red LED (failed)
          createHotspot();
          unsigned long hotspotStartTime = millis();
          while (millis() - hotspotStartTime < 120000) {  // Wait for 2 minutes
            server.handleClient();
          }
          setupWiFi();  // Try to reconnect to Wi-Fi
        }
      }
    }
  } else {
    server.handleClient();
  }

  if (WiFi.status() == WL_CONNECTED && lastPing != 0 && millis() - lastPing < 60000) {
    // Green LED for ready state
    setLED(LOW, LOW, HIGH);

    // Check if a new RFID tag is detected
    if (rdm6300.get_new_tag_id()) {
      // Extract the tag ID
      uint32_t rfidTag = rdm6300.get_tag_id();
      Serial.printf("New RFID tag detected: %08X\n", rfidTag);

      // Send the tag info to /terminal/scan endpoint
      sendRFIDScan(rfidTag);
    }
  }
}

void sendRFIDScan(uint32_t rfidTag) {
  // Short buzz when the card is scanned
  buzz(100);

  // set yellow LED on
  setLED(LOW, HIGH, LOW);

  if (strlen(endpoint) == 0 || strlen(authKey) == 0 || strlen(terminalId) == 0) {
    Serial.println("Scan aborted: Endpoint, Auth Key, or Terminal ID is empty.");
    return;
  }

  String fullEndpoint = String(endpoint) + "/terminal/scan";
  Serial.printf("Sending RFID scan to: %s\n", fullEndpoint.c_str());

  HTTPClient http;
  // set timeout to 15 seconds
  http.setTimeout(15000);
  http.begin(fullEndpoint);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["terminalId"] = terminalId;
  doc["authKey"] = authKey;
  doc["rfid"] = doc["rfid"] = String(rfidTag);

  String jsonString;
  serializeJson(doc, jsonString);
  Serial.printf("Sending POST request with payload: %s\n", jsonString.c_str());

  int httpResponseCode = http.POST(jsonString);
  Serial.printf("HTTP Response code: %d\n", httpResponseCode);

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.printf("Response body: %s\n", response.c_str());
      // Two short buzzes for success
      buzz(100);
      delay(100);
      buzz(100);
      delay(100);
      buzz(100);
    } else {
    String response = http.getString();
    Serial.printf("Error: HTTP response code: %d\n", httpResponseCode);
    Serial.printf("Error message: %s\n", response.c_str());

    // Long buzz for failure
    setLED(HIGH, LOW, LOW);
    buzz(1000);
  }

  http.end();
  
  // set yellow LED off
  setLED(LOW, LOW, LOW);
}

void setLED(int red, int yellow, int green) {
  digitalWrite(RED_LED, red);
  digitalWrite(YELLOW_LED, yellow);
  digitalWrite(GREEN_LED, green);
}

void buzz(int duration) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(duration);
  digitalWrite(BUZZER_PIN, LOW);
}

void setupWiFi() {
  Serial.printf("Attempting to connect to Wi-Fi network: %s\n", ssid);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nSuccessfully connected to Wi-Fi network: %s\n", ssid);
    Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    setLED(HIGH, LOW, LOW);  // Red LED (failed to connect)
    Serial.println("\nFailed to connect to Wi-Fi. Creating hotspot.");
    createHotspot();
  }
}

void createHotspot() {
  Serial.println("Creating Wi-Fi hotspot...");
  WiFi.softAP("Terminal Config", "terminator1605");
  IPAddress IP = WiFi.softAPIP();
  Serial.printf("Hotspot created. AP IP address: %s\n", IP.toString().c_str());

  server.on("/", handleRoot);
  server.on("/save", handleSave);
  server.begin();
  Serial.println("Web server started. You can now configure the device.");
}

void handleRoot() {
  String html = R"(
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terminal Configuration</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #121212;
          color: #e0e0e0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          background-color: #1e1e1e;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          width: 300px;
        }
        h1 {
          text-align: center;
          color: #ffffff;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        label {
          margin-top: 1rem;
          color: #b0b0b0;
        }
        input {
          margin-top: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #444;
          border-radius: 4px;
          background-color: #2a2a2a;
          color: #e0e0e0;
        }
        input[type="submit"] {
          margin-top: 1rem;
          background-color: #3498db;
          color: white;
          cursor: pointer;
          border: none;
          padding: 0.75rem;
          font-size: 1rem;
          transition: background-color 0.3s;
        }
        input[type="submit"]:hover {
          background-color: #2980b9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Terminal Configuration</h1>
        <form action='/save' method='post'>
          <label for="ssid">SSID:</label>
          <input type='text' name='ssid' id='ssid' value=')" + String(ssid) + R"(' required>
          
          <label for="password">Password:</label>
          <input type='text' name='password' id='password' value=')" + String(password) + R"(' required>
          
          <label for="endpoint">Endpoint:</label>
          <input type='text' name='endpoint' id='endpoint' value=')" + String(endpoint) + R"(' required>
          
          <label for="terminalId">Terminal ID:</label>
          <input type='text' name='terminalId' id='terminalId' value=')" + String(terminalId) + R"(' required>
          
          <label for="authKey">Auth Key:</label>
          <input type='text' name='authKey' id='authKey' value=')" + String(authKey) + R"(' required>
          
          <input type='submit' value='Save'>
        </form>
      </div>
    </body>
    </html>
  )";
  server.send(200, "text/html", html);
}

void handleSave() {
  Serial.println("Received new configuration:");
  Serial.printf("SSID: %s\n", server.arg("ssid").c_str());
  Serial.println("Password: [hidden]");
  Serial.printf("Endpoint: %s\n", server.arg("endpoint").c_str());
  Serial.printf("Terminal ID: %s\n", server.arg("terminalId").c_str());
  Serial.println("Auth Key: [hidden]");

  strncpy(ssid, server.arg("ssid").c_str(), SSID_MAX_LENGTH);
  strncpy(password, server.arg("password").c_str(), PASSWORD_MAX_LENGTH);
  strncpy(endpoint, server.arg("endpoint").c_str(), ENDPOINT_MAX_LENGTH);
  strncpy(terminalId, server.arg("terminalId").c_str(), TERMINAL_ID_LENGTH);
  strncpy(authKey, server.arg("authKey").c_str(), AUTH_KEY_LENGTH);

  saveConfig();
  Serial.println("New configuration saved to EEPROM.");

  server.send(200, "text/html", "<html><body><h1>Configuration Saved</h1><p>ESP32 will restart now.</p></body></html>");
  Serial.println("Configuration saved. Restarting ESP32...");
  delay(1000);
  ESP.restart();
}

bool pingEndpoint() {
  if (strlen(endpoint) == 0 || strlen(authKey) == 0 || strlen(terminalId) == 0) {
    Serial.println("Ping aborted: Endpoint, Auth Key, or Terminal ID is empty.");
    return false;
  }

  String fullEndpoint = String(endpoint) + "/terminal/ping";
  Serial.printf("Pinging endpoint: %s\n", fullEndpoint.c_str());

  HTTPClient http;
  http.begin(fullEndpoint);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["terminalId"] = terminalId;
  doc["authKey"] = authKey;

  String jsonString;
  serializeJson(doc, jsonString);
  Serial.printf("Sending POST request with payload: %s\n", jsonString.c_str());

  int httpResponseCode = http.POST(jsonString);
  Serial.printf("HTTP Response code: %d\n", httpResponseCode);

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.printf("Response body: %s\n", response.c_str());

    JsonDocument responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (error) {
      Serial.printf("deserializeJson() failed: %s\n", error.c_str());
      http.end();
      return false;
    }

    int updateFlag = responseDoc["updateFlag"];
    Serial.printf("Update flag: %d\n", updateFlag);

    if (updateFlag == 1) {
      // while the update flag is 1, keep the yellow LED on
      setLED(LOW, HIGH, LOW);

      bool configChanged = false;

      if (responseDoc["ssid"].is<const char*>()) {
        const char* newSsid = responseDoc["ssid"];
        if (strcmp(ssid, newSsid) != 0) {
          Serial.printf("New SSID received: %s\n", newSsid);
          strncpy(ssid, newSsid, SSID_MAX_LENGTH);
          configChanged = true;
        }
      }

      if (responseDoc["password"].is<const char*>()) {
        const char* newPassword = responseDoc["password"];
        if (strcmp(password, newPassword) != 0) {
          strncpy(password, newPassword, PASSWORD_MAX_LENGTH);
          configChanged = true;
        }
      }

      if (responseDoc["endpoint"].is<const char*>()) {
        const char* newEndpoint = responseDoc["endpoint"];
        if (strcmp(endpoint, newEndpoint) != 0) {
          strncpy(endpoint, newEndpoint, ENDPOINT_MAX_LENGTH);
          configChanged = true;
        }
      }

      if (responseDoc["terminalId"].is<const char*>()) {
        const char* newTerminalId = responseDoc["terminalId"];
        if (strcmp(terminalId, newTerminalId) != 0) {
          strncpy(terminalId, newTerminalId, TERMINAL_ID_LENGTH);
          configChanged = true;
        }
      }

      if (responseDoc["authKey"].is<const char*>()) {
        const char* newAuthKey = responseDoc["authKey"];
        if (strcmp(authKey, newAuthKey) != 0) {
          strncpy(authKey, newAuthKey, AUTH_KEY_LENGTH);
          configChanged = true;
        }
      }

      if (configChanged) {
        Serial.println("Configuration changed. Saving to EEPROM...");
        saveConfig();
      } else {
        Serial.println("No configuration changes detected.");
      }

      if (sendUpdateConfirmation()) {
        Serial.println("Update confirmed. Restarting...");
        delay(1000);
        ESP.restart();
      } else {
        Serial.println("Update confirmation failed. Will try again on next ping.");
      }
    }

    http.end();
    return true;
  } else {
    Serial.printf("Error: HTTP response code: %d\n", httpResponseCode);
    http.end();
    return false;
  }
}

bool sendUpdateConfirmation() {
  String fullEndpoint = String(endpoint) + "/terminal/update";
  Serial.printf("Sending update confirmation to: %s\n", fullEndpoint.c_str());

  HTTPClient http;
  http.begin(fullEndpoint);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["terminalId"] = terminalId;
  doc["authKey"] = authKey;
  
  JsonObject settings = doc["settings"].to<JsonObject>();
  settings["ssid"] = ssid;
  settings["password"] = password;
  settings["endpoint"] = endpoint;
  
  String jsonString;
  serializeJson(doc, jsonString);
  Serial.printf("Sending POST request with payload: %s\n", jsonString.c_str());

  int httpResponseCode = http.POST(jsonString);
  Serial.printf("HTTP Response code: %d\n", httpResponseCode);

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.printf("Response body: %s\n", response.c_str());

    JsonDocument responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (error) {
      Serial.printf("deserializeJson() failed: %s\n", error.c_str());
      http.end();
      return false;
    }

    int updateFlag = responseDoc["updateFlag"];
    Serial.printf("Update flag: %d\n", updateFlag);

    http.end();
    return updateFlag == 0;
  } else {
    Serial.printf("Error: HTTP response code: %d\n", httpResponseCode);
    http.end();
    return false;
  }
}

void loadConfig() {
  EEPROM.get(0, ssid);
  EEPROM.get(SSID_MAX_LENGTH, password);
  EEPROM.get(SSID_MAX_LENGTH + PASSWORD_MAX_LENGTH, endpoint);
  EEPROM.get(SSID_MAX_LENGTH + PASSWORD_MAX_LENGTH + ENDPOINT_MAX_LENGTH, terminalId);
  EEPROM.get(SSID_MAX_LENGTH + PASSWORD_MAX_LENGTH + ENDPOINT_MAX_LENGTH + TERMINAL_ID_LENGTH, authKey);

  Serial.println("Loaded configuration:");
  Serial.printf("SSID: %s\n", ssid);
  Serial.println("Password: [hidden]");
  Serial.printf("Endpoint: %s\n", endpoint);
  Serial.printf("Terminal ID: %s\n", terminalId);
  Serial.println("Auth Key: [hidden]");
}

void saveConfig() {
  EEPROM.put(0, ssid);
  EEPROM.put(SSID_MAX_LENGTH, password);
  EEPROM.put(SSID_MAX_LENGTH + PASSWORD_MAX_LENGTH, endpoint);
  EEPROM.put(SSID_MAX_LENGTH + PASSWORD_MAX_LENGTH + ENDPOINT_MAX_LENGTH, terminalId);
  EEPROM.put(SSID_MAX_LENGTH + PASSWORD_MAX_LENGTH + ENDPOINT_MAX_LENGTH + TERMINAL_ID_LENGTH, authKey);
  EEPROM.commit();

  Serial.println("Saved configuration:");
  Serial.printf("SSID: %s\n", ssid);
  Serial.println("Password: [hidden]");
  Serial.printf("Endpoint: %s\n", endpoint);
  Serial.printf("Terminal ID: %s\n", terminalId);
  Serial.println("Auth Key: [hidden]");
}
