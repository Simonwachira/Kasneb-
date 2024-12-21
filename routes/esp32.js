const express = require('express');
const mqtt = require('mqtt');
const router = express.Router();

// Initialize MQTT client for ESP32
const client = mqtt.connect('mqtts://YOUR_AWS_IOT_ENDPOINT');

// ESP32 Communication Route
router.post('/send-command', (req, res) => {
    const { command } = req.body;

    // Send command to ESP32 via MQTT
    client.publish('esp32/topic', command, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to send command' });
        }
        res.status(200).json({ message: 'Command sent to ESP32' });
    });
});

module.exports = router;
