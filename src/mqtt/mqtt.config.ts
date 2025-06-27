import mqtt, { MqttClient, IClientOptions } from 'mqtt';

// ✅ WebSocket-compatible MQTT broker URL (HiveMQ Cloud)
const MQTT_BROKER_WS = "wss://c29162f3d8f24ad1ae54157ddb08596c.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_TOPIC = "topic_farmer1";

// Your HiveMQ Cloud credentials
const MQTT_USERNAME = "hivemq.webclient.1742322741194";
const MQTT_PASSWORD = "yDw%iF@0Gc7MqSjZ24.,";

// Singleton MQTT client instance
let mqttClient: MqttClient | null = null;

export const initializeMqttClient = (): void => {
  if (mqttClient) {
    console.log('MQTT client already initialized');
    return;
  }

  console.log('Initializing MQTT client for topic:', MQTT_TOPIC);

  const options: IClientOptions = {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    protocol: 'wss',
    keepalive: 60,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    rejectUnauthorized: false, // Avoid TLS errors in browser
  };

  try {
    mqttClient = mqtt.connect(MQTT_BROKER_WS, options);
    console.log('MQTT client connection initiated');
  } catch (error) {
    console.error('Failed to initiate MQTT client:', error);
    mqttClient = null;
    return;
  }

  mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT broker');

    mqttClient!.subscribe(MQTT_TOPIC, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to topic: ${MQTT_TOPIC}`, err);
      } else {
        console.log(`📡 Subscribed to topic: ${MQTT_TOPIC}`);
      }
    });
  });

  mqttClient.on('message', (topic, message) => {
    try {
      const messageString = message.toString();
      const cleaned = messageString.replace(/'/g, '"');
      const data = JSON.parse(cleaned);

      // ✅ Log received data
      console.log(`SensorData:[${new Date().toISOString()}][${topic}]`, data);
    } catch (err) {
      console.error(`Error parsing MQTT message from ${topic}:`, err);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT client error:', err);
    mqttClient = null;
  });

  mqttClient.on('close', () => {
    console.log('🔌 Disconnected from MQTT broker');
    mqttClient = null;
  });

  mqttClient.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...');
  });
};

export const getMqttClient = (): MqttClient | null => mqttClient;
