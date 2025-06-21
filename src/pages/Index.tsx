
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Activity, Thermometer, Droplets, Gauge } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { SensorDataGenerator } from '@/utils/sensorDataGenerator';
import { StreamProcessor } from '@/utils/streamProcessor';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  deviceId: string;
}

const Index = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [timeRange, setTimeRange] = useState('5m');
  const [alerts, setAlerts] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState({
    avgTemp: 0,
    avgHumidity: 0,
    avgPressure: 0,
    dataPoints: 0,
    anomalies: 0
  });

  const dataGenerator = new SensorDataGenerator();
  const streamProcessor = new StreamProcessor();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStreaming) {
      interval = setInterval(() => {
        const newData = dataGenerator.generateBatch(3);
        
        setSensorData(prevData => {
          const updatedData = [...prevData, ...newData];
          const cutoffTime = Date.now() - (parseInt(timeRange) * 60 * 1000);
          const filteredData = updatedData.filter(d => new Date(d.timestamp).getTime() > cutoffTime);
          
          // Process analytics
          const processed = streamProcessor.processData(filteredData);
          setAnalytics(processed.analytics);
          setAlerts(processed.alerts);
          
          return filteredData.slice(-100); // Keep last 100 points
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, timeRange]);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      setSensorData([]);
      setAlerts([]);
    }
  };

  const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Stream Processing Analytics
          </h1>
          <p className="text-gray-600">Real-time IoT sensor data monitoring and analytics</p>
        </div>

        {/* Controls */}
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={toggleStreaming}
                variant={isStreaming ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {isStreaming ? 'Stop Stream' : 'Start Stream'}
              </Button>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 min</SelectItem>
                  <SelectItem value="5m">5 min</SelectItem>
                  <SelectItem value="10m">10 min</SelectItem>
                  <SelectItem value="30m">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isStreaming ? "default" : "secondary"} className="animate-pulse">
                {isStreaming ? 'LIVE' : 'OFFLINE'}
              </Badge>
              <span className="text-sm text-gray-600">{sensorData.length} data points</span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(-3).map((alert, index) => (
              <Alert key={index} className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">{alert}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Thermometer className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-2xl font-bold text-red-600">
                    {latestData ? `${latestData.temperature.toFixed(1)}°C` : '--'}
                  </p>
                  <p className="text-xs text-gray-500">Avg: {analytics.avgTemp.toFixed(1)}°C</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {latestData ? `${latestData.humidity.toFixed(1)}%` : '--'}
                  </p>
                  <p className="text-xs text-gray-500">Avg: {analytics.avgHumidity.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gauge className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pressure</p>
                  <p className="text-2xl font-bold text-green-600">
                    {latestData ? `${latestData.pressure.toFixed(0)} hPa` : '--'}
                  </p>
                  <p className="text-xs text-gray-500">Avg: {analytics.avgPressure.toFixed(0)} hPa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Anomalies</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.anomalies}</p>
                  <p className="text-xs text-gray-500">Total detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>
                Temperature Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sensorData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fill="url(#tempGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Humidity Chart */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>
                Humidity Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Humidity']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pressure Chart */}
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
          <CardHeader>
              <CardTitle>
                Pressure Analytics
              </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sensorData.slice(-20)}>
                <defs>
                  <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value.toFixed(0)} hPa`, 'Pressure']}
                />
                <Bar 
                  dataKey="pressure" 
                  fill="url(#pressureGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
