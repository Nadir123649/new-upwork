import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import './PriceMetricsChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, annotationPlugin);

const PriceMetricsChart = ({ chartData, stockReturns, aiFacts = [] }) => {
  console.log('PriceMetricsChart props:', { chartData, stockReturns, aiFacts });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [relevantFacts, setRelevantFacts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (selectedMonth && aiFacts && aiFacts.length > 0) {
      const selectedDate = new Date(selectedMonth);
      const monthEnd = new Date(selectedDate);
      const monthStart = new Date(selectedDate);
      monthStart.setDate(monthStart.getDate() - 30);  // 30 days before the selected date

      console.log('Selected Date:', selectedDate);
      console.log('Date Range:', monthStart, 'to', monthEnd);
      console.log('All Facts:', aiFacts);

      const facts = aiFacts.filter(fact => {
        const factDate = new Date(fact.date);
        console.log('Fact Date:', factDate, 'In Range:', factDate >= monthStart && factDate <= monthEnd);
        return !isNaN(factDate.getTime()) && factDate >= monthStart && factDate <= monthEnd;
      });

      console.log('Filtered Facts:', facts);

      setRelevantFacts(facts);
      setShowPopup(true);
    } else {
      console.log('No aiFacts available or selectedMonth not set', { aiFacts, selectedMonth });
    }
  }, [selectedMonth, aiFacts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!chartData || !chartData.chart_data || chartData.chart_data.length === 0) {
    console.error('Invalid or empty chartData:', chartData);
    return <div>No chart data available</div>;
  }

  const getMinMaxValues = (data) => {
    const values = data.flatMap(item => 
      item.series[0].data.map(d => typeof d === 'number' ? d : d[1])
    ).filter(v => v !== null && v !== undefined);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const allDates = chartData.chart_data[0].series[0].data.map(d => 
    typeof d[0] === 'string' ? d[0] : new Date(d[0]).toISOString().split('T')[0]
  );

  const getMatchingStockReturn = (date, symbol) => {
    if (!stockReturns || !stockReturns[symbol]) return null;
    const stockData = stockReturns[symbol];
    const matchingDate = Object.keys(stockData).find(d => d >= date) || date;
    return stockData[matchingDate]?.return || null;
  };

  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 90,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Stock Return (%)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        min: -10,
        max: 10,
        ticks: {
          callback: function(value, index, values) {
            return this.getLabelForValue(value).substring(0, 5); // Shorten labels
          }
        },
      },
      ...chartData.chart_data.reduce((acc, item, index) => {
        const { min, max } = getMinMaxValues([item]);
        acc[`y${index + 1}`] = {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: item.subcategory,
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          min: min !== undefined ? min * 0.9 : 0,
          max: max !== undefined ? max * 1.1 : 100,
          grid: {
            drawOnChartArea: false,
          },
        };
        return acc;
      }, {}),
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            return `${datasetLabel}: ${value}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 5,
      },
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'AI Metrics and Stock Returns',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const { index } = elements[0];
        const date = allDates[index];
        setSelectedMonth(date);
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  const stockReturnDatasets = stockReturns ? Object.keys(stockReturns).map(symbol => ({
    type: 'line',
    label: `${symbol} Stock Return`,
    data: allDates.map(date => ({
      x: date,
      y: getMatchingStockReturn(date, symbol),
    })),
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    yAxisID: 'y',
    tension: 0.4,
  })) : [];

  const data = {
    labels: allDates,
    datasets: [
      ...stockReturnDatasets,
      ...chartData.chart_data.map((item, index) => ({
        type: 'bar',
        label: item.subcategory,
        data: item.series[0].data.map(d => ({
          x: typeof d[0] === 'string' ? d[0] : new Date(d[0]).toISOString().split('T')[0],
          y: d[1],
        })),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.7', '1'),
        borderWidth: 1,
        yAxisID: `y${index + 1}`,
      })),
    ],
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Chart ref={chartRef} type='bar' options={options} data={data} />
      </div>
      {showPopup && (
        <div className="facts-popup" ref={popupRef}>
          <h3>Facts for the 30 days prior to {selectedMonth}</h3>
          <ul>
            {relevantFacts.map((fact, index) => (
              <li key={index}>{fact.fact}</li>
            ))}
          </ul>
          {relevantFacts.length === 0 && <p>No facts available for this period.</p>}
        </div>
      )}
    </div>
  );
};

export default PriceMetricsChart;