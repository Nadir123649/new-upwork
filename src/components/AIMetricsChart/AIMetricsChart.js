import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './AIMetricsChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const AIMetricsChart = ({ chartData }) => {
  const [chartConfig, setChartConfig] = useState(null);

  useEffect(() => {
    if (chartData && chartData.chart_data && chartData.chart_data.length > 0) {
      const firstChart = chartData.chart_data[0];
      const category = firstChart.category;
      const subcategory = firstChart.subcategory;
      const series = firstChart.series;

      const labels = series[0].data.map(([date]) => date);
      const datasets = series.map((s) => ({
        label: s.name,
        data: s.data.map(([, value]) => value),
        backgroundColor: s.name === 'AAPL' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
        borderColor: s.name === 'AAPL' ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        borderWidth: 1,
      }));

      setChartConfig({
        labels,
        datasets,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: `${category} - ${subcategory}`,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Value',
              },
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [chartData]);

  if (!chartConfig) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="ai-metrics-chart">
      <Bar data={chartConfig} options={chartConfig.options} />
    </div>
  );
};

export default AIMetricsChart;