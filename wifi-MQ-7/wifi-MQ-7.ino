#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// --- YOUR CONFIGURATION ---
const char* ssid = "Navale";
const char* password = "qwerty@123";

// REPLACE with your laptop's IPv4 address! Keep the :5000/sensor_data part.
const char* serverName = "http://10.145.17.62:5000/sensor_data"; 

const int mq7Pin = A0;
const long interval = 30000; // 30 seconds (Matching our ML training data)
unsigned long previousMillis = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected!");
  Serial.print("NodeMCU IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // 1. Read Sensor Math
    int rawAdc = analogRead(mq7Pin);
    float pinVoltage = (rawAdc / 1023.0) * 3.3;
    float sensorVoltage = pinVoltage * 1.5;

    // 2. Check Wi-Fi and Send Data
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      
      http.begin(client, serverName);
      http.addHeader("Content-Type", "application/json");
      
      // 3. Construct the JSON payload
      String jsonPayload = "{\"Raw_ADC\":" + String(rawAdc) + 
                           ",\"NodeMCU_Volts\":" + String(pinVoltage, 3) + 
                           ",\"Sensor_Volts\":" + String(sensorVoltage, 3) + "}";
                           
      // 4. Fire the POST request
      int httpResponseCode = http.POST(jsonPayload);
      
      if (httpResponseCode > 0) {
        Serial.print("HTTP Code: ");
        Serial.println(httpResponseCode); // 200 means success!
      } else {
        Serial.print("Error sending POST: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    } else {
      Serial.println("Wi-Fi Disconnected");
    }
  }
}
