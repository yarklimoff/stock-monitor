'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import cn from './StockChart.module.scss';
import axios from 'axios';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type TimeSeriesData = {
  datetime: string;
  close: string;
};

type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointRadius: number;
  }[];
};

interface StockChartProps {
  symbol: string | undefined;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });
};

export default function StockChart({ symbol }: StockChartProps) {
  const [data, setData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }
    setIsLoading(true);

    const fetchChartData = async () => {
      try {
        const res = await axios.get(`/api/stock-data-timeline?symbol=${symbol}`);

        const json = res.data;

        if (!json.values) return;

        const timeSeries: TimeSeriesData[] = json.values.slice(0, 7).reverse();

        const chartData = {
          labels: timeSeries.map((item) => formatDate(item.datetime)),
          datasets: [
            {
              label: `Цена (${symbol})`,
              data: timeSeries.map((item) => parseFloat(item.close)),
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              tension: 0.3,
              pointRadius: 3,
            },
          ],
        };

        setData(chartData);
      } catch (error) {
        console.error('Ошибка при загрузке графика', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [symbol]);

  if (!symbol) {
    return <div className="text-center py-4">Выберите акцию для отображения графика</div>;
  }

  if (isLoading) {
    return <div className="text-center py-4">Загрузка графика...</div>;
  }

  if (!data) {
    return <div className="text-center py-4">Нет данных для отображения</div>;
  }

  return (
    <div className={cn.container}>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: `Изменение цены за неделю (${symbol})`,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.raw as number} USD`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 7,
              },
            },
            y: {
              beginAtZero: false,
              ticks: {
                callback: (tickValue: string | number) => {
                  const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                  return `${value} $`;
                },
              },
              title: {
                display: true,
                text: 'Цена, USD',
              },
            },
          },
        }}
      />
    </div>
  );
}
