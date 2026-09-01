/**
 * Chart colours come from the validated categorical order and are assigned by
 * slot, never cycled or re-picked per view.
 *
 * The four metrics are drawn as small multiples — one series per chart, each
 * with its own axis — because temperature (~20-32 °C), humidity (0-100 %) and
 * light (0-18000 lux) share no scale. A dual axis would make their lines
 * comparable-looking when they are not.
 *
 * Since each chart holds a single titled series, identity never rests on
 * colour; the hue is reinforcement across the set. Each chart also shows its
 * current value as text, which is the required relief for the two slots that
 * sit under 3:1 against a white surface.
 */
export type MetricKey = "humidity" | "temperature" | "soilMoisture" | "lightIntensity";

export const SERIES: Record<
  MetricKey,
  { label: string; unit: string; color: string; colorDark: string; decimals: number }
> = {
  // slot 1 — blue
  humidity: { label: "Humidity", unit: "%", color: "#2a78d6", colorDark: "#3987e5", decimals: 1 },
  // slot 2 — orange
  temperature: { label: "Temperature", unit: "°C", color: "#eb6834", colorDark: "#d95926", decimals: 1 },
  // slot 3 — aqua
  soilMoisture: { label: "Soil moisture", unit: "%", color: "#1baf7a", colorDark: "#199e70", decimals: 1 },
  // slot 4 — yellow
  lightIntensity: { label: "Light", unit: "lux", color: "#eda100", colorDark: "#c98500", decimals: 0 },
};

export const METRIC_ORDER: MetricKey[] = [
  "temperature",
  "humidity",
  "soilMoisture",
  "lightIntensity",
];
