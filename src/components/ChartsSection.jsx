// ChartsSection.jsx - Portfolio visualization charts
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ChartsSection({ positionData, sectorData, riskMetrics }) {
  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'];

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare sector allocation data for pie chart
  const sectorChartData = Object.entries(sectorData).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  // Prepare position allocation data for pie chart
  const positionChartData = positionData.map(pos => ({
    name: pos.ticker,
    value: pos.weight
  }));

  // Prepare risk metrics data for bar chart
  const riskChartData = [
    {
      metric: 'Sharpe',
      value: riskMetrics.sharpe,
      fill: riskMetrics.sharpe >= 1 ? '#10B981' : '#F59E0B'
    },
    {
      metric: 'Sortino',
      value: riskMetrics.sortino,
      fill: riskMetrics.sortino >= 1 ? '#10B981' : '#F59E0B'
    },
    {
      metric: 'Info Ratio',
      value: riskMetrics.infoRatio,
      fill: riskMetrics.infoRatio >= 0.5 ? '#10B981' : '#F59E0B'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded border">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{formatPercent(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipBar = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded border">
          <p className="font-semibold">{payload[0].payload.metric}</p>
          <p className="text-blue-600">{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Position Allocation Pie Chart */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Position Allocation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={positionChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {positionChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sector Allocation Pie Chart */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Sector Allocation</h3>
        {sectorChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>Sector data will appear after fetching prices</p>
          </div>
        )}
      </div>

      {/* Risk Metrics Bar Chart */}
      <div className="card lg:col-span-2">
        <h3 className="text-xl font-bold mb-4">Risk-Adjusted Performance Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskChartData}>
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip content={<CustomTooltipBar />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {riskChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-green-50 p-3 rounded">
            <p className="text-gray-600">Sharpe Ratio</p>
            <p className="text-xs text-gray-500 mt-1">
              Measures risk-adjusted returns. Above 1 is good, above 2 is excellent.
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-gray-600">Sortino Ratio</p>
            <p className="text-xs text-gray-500 mt-1">
              Like Sharpe but only considers downside risk. Higher is better.
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-gray-600">Information Ratio</p>
            <p className="text-xs text-gray-500 mt-1">
              Excess return per unit of tracking error vs benchmark. Above 0.5 is good.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
