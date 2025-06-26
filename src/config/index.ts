import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  mqtt_broker: process.env.MQTT_BROKER,
  mqtt_port: parseInt(process.env.MQTT_PORT || '8883', 10),
  mqtt_topic: process.env.MQTT_TOPIC,
  mqtt_username: process.env.MQTT_USERNAME,
  mqtt_password: process.env.MQTT_PASSWORD,
};