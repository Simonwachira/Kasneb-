#include "utils.h"

void setup() {
    Serial.begin(115200);
    connectAWS();
}

void loop() {
    // Generate a random metrics value and publish it
    int metricsValue = random(1, 100);
    Serial.print("Metrics: ");
    Serial.println(metricsValue);

    publishMessage(metricsValue);

    // Process MQTT messages
    client.loop();
    delay(1000);
}
