const AWS = require('aws-sdk');
const mqtt = require('mqtt');
const dotenv = require('dotenv');
dotenv.config();

// AWS IoT Core configuration
const iotEndpoint = process.env.AWS_IOT_ENDPOINT; // IoT endpoint from AWS
const topicPublish = process.env.AWS_IOT_PUBLISH_TOPIC; 
const topicSubscribe = process.env.AWS_IOT_SUBSCRIBE_TOPIC; 
const clientId = process.env.AWS_IOT_CLIENT_ID;  // Unique client ID for ESP32
const thingName = process.env.THING_NAME; // Thing's name configured in AWS IoT Core

// AWS IoT MQTT Client Configuration
const mqttOptions = {
    host: iotEndpoint,
    port: process.env.AWS_IOT_PORT || 8883,  // Default MQTT port for TLS connection
    protocol: 'mqtts',  // secure MQTT TLS
    clientId: clientId,
    thingName: process.env.THINGNAME,
        
    ca: fs.readFileSync('./certs/AmazonRootCA1.pem'),  // Root certificate
    
    cert: fs.readFileSync('./certificate.pem.crt'),  // certificate
    key: fs.readFileSync('./certs/private.pem.key'),  //  private key
};

// Initialize the MQTT client
const mqttClient = mqtt.connect(mqttOptions);

// Handle successful connection
mqttClient.on('connect', function () {
    console.log('Connected to AWS IoT Core');
    mqttClient.subscribe(topic, { qos: 1 }, function (err) {
        if (!err) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error('Subscription error:', err);
        }
    });
});

// Handle incoming messages from ESP32 (MQTT subscribe)
mqttClient.on('message', function (topic, message) {
    console.log(`Received message: ${message.toString()} on topic: ${topic}`);

});

// Publish a message to the topic
async function publishToESP32(data) {
    try {
        const payload = JSON.stringify(data);  // Convert the data to JSON
        mqttClient.publish(topic, payload, { qos: 1 }, function (err) {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log(`Message published to ${topic}`);
            }
        });
    } catch (error) {
        console.error('Error in publishToESP32:', error);
    }
}

// Function to disconnect the MQTT client (if needed)
function disconnect() {
    mqttClient.end();
    console.log('Disconnected from AWS IoT Core');
}

module.exports = {
    publishToESP32,
    disconnect,
};
SetInterval(publishMessage, 5000);