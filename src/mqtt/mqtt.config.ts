import mqtt, { MqttClient, IClientOptions } from 'mqtt';

// WebSocket-compatible MQTT broker URL (HiveMQ Cloud)
const MQTT_BROKER_WS = "wss://c29162f3d8f24ad1ae54157ddb08596c.s1.eu.hivemq.cloud:8884/mqtt";

// HiveMQ Cloud credentials
const MQTT_USERNAME = "hivemq.webclient.1742322741194";
const MQTT_PASSWORD = "yDw%iF@0Gc7MqSjZ24.,";

// Singleton MQTT client instance
let mqttClient: MqttClient | null = null;
let currentTopic: string | null = null;
let queuedTopic: string | null = null; // For topic changes before connect
let messageHandler: ((topic: string, message: Buffer) => void) | null = null;

export interface MqttMessage {
  fieldId?: string;
  temperature?: number;
  humidity?: number;
  soil_moisture?: number;
  light_intensity?: number;
  actuator?: 'motor' | 'shade';
  status?: boolean;
}

// Initialize MQTT client with a custom message handler
export const initializeMqttClient = (
  topicName: string,
  onMessage?: (topic: string, message: Buffer) => void
): void => {
  console.log('Initializing MQTT client for topic:', topicName);

  // Store the message handler
  if (onMessage) {
    messageHandler = onMessage;
  }

  // If already connected → switch topic if needed
  if (mqttClient && mqttClient.connected) {
    if (currentTopic !== topicName) {
      if (currentTopic) {
        mqttClient.unsubscribe(currentTopic, (err) => {
          if (err) {
            console.error(`❌ Failed to unsubscribe from ${currentTopic}`, err);
          } else {
            console.log(`🚫 Unsubscribed from topic: ${currentTopic}`);
          }
        });
      }
      mqttClient.subscribe(topicName, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to topic: ${topicName}`, err);
        } else {
          console.log(`📡 Subscribed to topic: ${topicName}`);
          currentTopic = topicName;
        }
      });
    }
    return;
  }

  // If client exists but is still connecting, queue the topic
  if (mqttClient && !mqttClient.connected) {
    queuedTopic = topicName;
    return;
  }

  // Create MQTT client
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
    queuedTopic = topicName; // Queue topic until connected
  } catch (error) {
    console.error('Failed to initiate MQTT client:', error);
    mqttClient = null;
    return;
  }

  // Handle successful connection
  mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT broker');

    const topicToSubscribe = queuedTopic || topicName;
    mqttClient!.subscribe(topicToSubscribe, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to topic: ${topicToSubscribe}`, err);
      } else {
        console.log(`📡 Subscribed to topic: ${topicToSubscribe}`);
        currentTopic = topicToSubscribe;
        queuedTopic = null;
      }
    });
  });

  // Handle incoming messages
  mqttClient.on('message', (topic, message) => {
    if (messageHandler) {
      messageHandler(topic, message);
    } else {
      try {
        const messageString = message.toString();
        const cleaned = messageString.replace(/'/g, '"');
        const data = JSON.parse(cleaned);
        console.log(`SensorData:[${new Date().toISOString()}][${topic}]`, data);
      } catch (err) {
        console.error(`Error parsing MQTT message from ${topic}:`, err);
      }
    }
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT client error:', err);
  });

  mqttClient.on('close', () => {
    console.log('🔌 Disconnected from MQTT broker');
    currentTopic = null;
  });

  mqttClient.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...');
  });
};

// Publish a message to a specified topic
export const publishMqttMessage = (
  topic: string,
  message: MqttMessage,
  callback?: (err?: Error) => void
): void => {
  if (!mqttClient || !mqttClient.connected) {
    const error = new Error('MQTT client is not connected');
    console.error(error.message);
    if (callback) callback(error);
    return;
  }

  const messageString = JSON.stringify(message);
  mqttClient.publish(topic, messageString, { qos: 1 }, (err) => {
    if (err) {
      console.error(`❌ Failed to publish to topic: ${topic}`, err);
      if (callback) callback(err);
    } else {
      console.log(`📤 Published to topic: ${topic}`, messageString);
      if (callback) callback();
    }
  });
};

export const getMqttClient = (): MqttClient | null => mqttClient;
// import mqtt, { MqttClient, IClientOptions } from 'mqtt';

// // ✅ WebSocket-compatible MQTT broker URL (HiveMQ Cloud)
// const MQTT_BROKER_WS = "wss://c29162f3d8f24ad1ae54157ddb08596c.s1.eu.hivemq.cloud:8884/mqtt";

// // Your HiveMQ Cloud credentials
// const MQTT_USERNAME = "hivemq.webclient.1742322741194";
// const MQTT_PASSWORD = "yDw%iF@0Gc7MqSjZ24.,";

// // Singleton MQTT client instance
// let mqttClient: MqttClient | null = null;
// let currentTopic: string | null = null;
// let queuedTopic: string | null = null; // For topic changes before connect

// export const initializeMqttClient = (topicName: string): void => {
//   console.log('Initializing MQTT client for topic:', topicName);

//   // If already connected → just switch topic if needed
//   if (mqttClient && mqttClient.connected) {
//     if (currentTopic !== topicName) {
//       if (currentTopic) {
//         mqttClient.unsubscribe(currentTopic, (err) => {
//           if (err) {
//             console.error(`❌ Failed to unsubscribe from ${currentTopic}`, err);
//           } else {
//             console.log(`🚫 Unsubscribed from topic: ${currentTopic}`);
//           }
//         });
//       }
//       mqttClient.subscribe(topicName, { qos: 1 }, (err) => {
//         if (err) {
//           console.error(`❌ Failed to subscribe to topic: ${topicName}`, err);
//         } else {
//           console.log(`📡 Subscribed to topic: ${topicName}`);
//           currentTopic = topicName;
//         }
//       });
//     }
//     return;
//   }

//   // If client exists but is still connecting, queue the topic
//   if (mqttClient && !mqttClient.connected) {
//     queuedTopic = topicName;
//     return;
//   }

//   // Create MQTT client if not already created
//   const options: IClientOptions = {
//     username: MQTT_USERNAME,
//     password: MQTT_PASSWORD,
//     protocol: 'wss',
//     keepalive: 60,
//     reconnectPeriod: 1000,
//     connectTimeout: 30 * 1000,
//     rejectUnauthorized: false, // Avoid TLS errors in browser
//   };

//   try {
//     mqttClient = mqtt.connect(MQTT_BROKER_WS, options);
//     console.log('MQTT client connection initiated');
//     queuedTopic = topicName; // Queue topic until connected
//   } catch (error) {
//     console.error('Failed to initiate MQTT client:', error);
//     mqttClient = null;
//     return;
//   }

//   // Handle successful connection
//   mqttClient.on('connect', () => {
//     console.log('✅ Connected to MQTT broker');

//     const topicToSubscribe = queuedTopic || topicName;
//     mqttClient!.subscribe(topicToSubscribe, { qos: 1 }, (err) => {
//       if (err) {
//         console.error(`❌ Failed to subscribe to topic: ${topicToSubscribe}`, err);
//       } else {
//         console.log(`📡 Subscribed to topic: ${topicToSubscribe}`);
//         currentTopic = topicToSubscribe;
//         queuedTopic = null;
//       }
//     });
//   });

//   // Handle incoming messages
//   mqttClient.on('message', (topic, message) => {
//     try {
//       const messageString = message.toString();
//       const cleaned = messageString.replace(/'/g, '"');
//       const data = JSON.parse(cleaned);
//       console.log(`SensorData:[${new Date().toISOString()}][${topic}]`, data);
//     } catch (err) {
//       console.error(`Error parsing MQTT message from ${topic}:`, err);
//     }
//   });

//   mqttClient.on('error', (err) => {
//     console.error('MQTT client error:', err);
//   });

//   mqttClient.on('close', () => {
//     console.log('🔌 Disconnected from MQTT broker');
//     currentTopic = null;
//   });

//   mqttClient.on('reconnect', () => {
//     console.log('🔄 Reconnecting to MQTT broker...');
//   });
// };

// export const getMqttClient = (): MqttClient | null => mqttClient;
