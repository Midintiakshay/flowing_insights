export class SensorDataGenerator {
  private deviceIds = ['sensor-001', 'sensor-002', 'sensor-003'];
  private baseValues = {
    temperature: 22,
    humidity: 45,
    pressure: 1013
  };

  generateBatch(count: number = 1) {
    const batch = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const deviceId = this.deviceIds[Math.floor(Math.random() * this.deviceIds.length)];
      
      // Add realistic variations with occasional spikes
      const tempVariation = (Math.random() - 0.5) * 4;
      const humidityVariation = (Math.random() - 0.5) * 10;
      const pressureVariation = (Math.random() - 0.5) * 20;

      // Occasional anomalies
      const isAnomaly = Math.random() < 0.05; // 5% chance
      const anomalyMultiplier = isAnomaly ? (Math.random() * 2 + 1) : 1;

      const data = {
        timestamp: new Date(now + i * 100).toISOString(),
        temperature: this.baseValues.temperature + (tempVariation * anomalyMultiplier),
        humidity: Math.max(0, Math.min(100, this.baseValues.humidity + (humidityVariation * anomalyMultiplier))),
        pressure: this.baseValues.pressure + (pressureVariation * anomalyMultiplier),
        deviceId
      };

      // Drift base values slightly for realism
      this.baseValues.temperature += (Math.random() - 0.5) * 0.1;
      this.baseValues.humidity += (Math.random() - 0.5) * 0.2;
      this.baseValues.pressure += (Math.random() - 0.5) * 0.5;

      // Keep values in realistic ranges
      this.baseValues.temperature = Math.max(15, Math.min(35, this.baseValues.temperature));
      this.baseValues.humidity = Math.max(20, Math.min(80, this.baseValues.humidity));
      this.baseValues.pressure = Math.max(990, Math.min(1040, this.baseValues.pressure));

      batch.push(data);
    }

    return batch;
  }
}
