#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include "cert.h"

// WiFi and MQTT clients
WiFiClientSecure net;
PubSubClient client(net);

// Callback function for handling incoming MQTT messages
void messageHandler(char* topic, byte* payload, unsigned int length) {
    Serial.print("Incoming topic: ");
    Serial.println(topic);

    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        Serial.print("Deserialization failed: ");
        Serial.println(error.c_str());
        return;
    }

    const char* message = doc["message"];
    Serial.println(message);
}

// Connect to AWS IoT Core
void connectAWS() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.println("Connecting to Wi-Fi...");

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nWi-Fi connected!");

    // Configure the secure client
    net.setCACert(AWS_CERT_CA);
    net.setCertificate(AWS_CERT_CRT);
    net.setPrivateKey(AWS_CERT_PRIVATE);

    // Set MQTT server and callback
    client.setServer(AWS_IOT_ENDPOINT, 8883);
    client.setCallback(messageHandler);

    Serial.println("Connecting to AWS IoT...");

    while (!client.connect(THINGNAME)) {
        Serial.print(".");
        delay(500);
    }

    if (client.connected()) {
        Serial.println("\nAWS IoT connected!");
        client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
    } else {
        Serial.println("\nAWS IoT connection failed!");
    }
}

// Publish a JSON message to AWS IoT Core
void publishMessage(int metricsValue) {
    StaticJsonDocument<200> doc;
    doc["metrics"] = metricsValue;

    char jsonBuffer[256];
    serializeJson(doc, jsonBuffer);

    if (client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer)) {
        Serial.println("Message published!");
    } else {
        Serial.println("Publish failed!");
    }
}
