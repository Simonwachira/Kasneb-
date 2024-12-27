const express = require('express');
const mqtt = require('mqtt');
const dotenv = require('dotenv');
dotenv.config();


const router = express.Router();
// Initialize MQTT client for ESP32
const client = mqtt.connect('process.env.AWS_IOT_ENDPOINT');
 reconnectPeriod: 1000, //auto reconnect after every secod

 client.on('connect',() => {
    console.log('connected to Aws IoT MQTT');
 })
client.on('error', (error)=> {
    console.error('MQTT CONNECTION FAILED', error);

})
// ESP32 Communication Route
router.post('/send-command', (req, res) => {
    const { command, topic } = req.body;

    if (!command || typeof command !== 'string') {
        return res.status(400).json({ message: 'Invalid command' });
    }
    if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ message: 'Invalid topic' });
    }


    // Send command to ESP32 via MQTT
    client.publish(topic, command, (err) => {
        if (err) {
            console.error('Failed to publish command',err);
            return res.status(500).json({ message: 'Failed to send command' });
        }
        res.status(200).json({ message: 'Command sent to ESP32' });
    });
});

module.exports = router;
