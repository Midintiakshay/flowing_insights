
interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  deviceId: string;
}

interface Analytics {
  avgTemp: number;
  avgHumidity: number;
  avgPressure: number;
  dataPoints: number;
  anomalies: number;
}

interface ProcessedResult {
  analytics: Analytics;
  alerts: string[];
}

export class StreamProcessor {
  private readonly TEMP_THRESHOLD = { min: 18, max: 28 };
  private readonly HUMIDITY_THRESHOLD = { min: 30, max: 70 };
  private readonly PRESSURE_THRESHOLD = { min: 1000, max: 1030 };

  processData(data: SensorData[]): ProcessedResult {
    if (data.length === 0) {
      return {
        analytics: { avgTemp: 0, avgHumidity: 0, avgPressure: 0, dataPoints: 0, anomalies: 0 },
        alerts: []
      };
    }

    // Calculate averages
    const totals = data.reduce(
      (acc, curr) => ({
        temp: acc.temp + curr.temperature,
        humidity: acc.humidity + curr.humidity,
        pressure: acc.pressure + curr.pressure
      }),
      { temp: 0, humidity: 0, pressure: 0 }
    );

    const analytics: Analytics = {
      avgTemp: totals.temp / data.length,
      avgHumidity: totals.humidity / data.length,
      avgPressure: totals.pressure / data.length,
      dataPoints: data.length,
      anomalies: this.detectAnomalies(data).length
    };

    // Generate alerts for recent anomalies
    const recentData = data.slice(-10); // Last 10 data points
    const alerts = this.generateAlerts(recentData);

    return { analytics, alerts };
  }

  private detectAnomalies(data: SensorData[]): SensorData[] {
    return data.filter(point => 
      point.temperature < this.TEMP_THRESHOLD.min || 
      point.temperature > this.TEMP_THRESHOLD.max ||
      point.humidity < this.HUMIDITY_THRESHOLD.min || 
      point.humidity > this.HUMIDITY_THRESHOLD.max ||
      point.pressure < this.PRESSURE_THRESHOLD.min || 
      point.pressure > this.PRESSURE_THRESHOLD.max
    );
  }

  private generateAlerts(recentData: SensorData[]): string[] {
    const alerts: string[] = [];
    
    recentData.forEach(point => {
      const time = new Date(point.timestamp).toLocaleTimeString();
      
      if (point.temperature > this.TEMP_THRESHOLD.max) {
        alerts.push(`High temperature alert: ${point.temperature.toFixed(1)}°C at ${time} (${point.deviceId})`);
      } else if (point.temperature < this.TEMP_THRESHOLD.min) {
        alerts.push(`Low temperature alert: ${point.temperature.toFixed(1)}°C at ${time} (${point.deviceId})`);
      }
      
      if (point.humidity > this.HUMIDITY_THRESHOLD.max) {
        alerts.push(`High humidity alert: ${point.humidity.toFixed(1)}% at ${time} (${point.deviceId})`);
      } else if (point.humidity < this.HUMIDITY_THRESHOLD.min) {
        alerts.push(`Low humidity alert: ${point.humidity.toFixed(1)}% at ${time} (${point.deviceId})`);
      }
      
      if (point.pressure > this.PRESSURE_THRESHOLD.max) {
        alerts.push(`High pressure alert: ${point.pressure.toFixed(0)} hPa at ${time} (${point.deviceId})`);
      } else if (point.pressure < this.PRESSURE_THRESHOLD.min) {
        alerts.push(`Low pressure alert: ${point.pressure.toFixed(0)} hPa at ${time} (${point.deviceId})`);
      }
    });

    return [...new Set(alerts)]; // Remove duplicates
  }
}
