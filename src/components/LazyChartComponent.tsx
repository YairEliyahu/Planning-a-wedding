import React, { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
// ייבוא Chart.js setup מרכזי
import '@/lib/chartSetup';

// Lazy load Chart.js components only when needed
const Bar = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }>;
}

interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: any;
  scales: any;
}

interface LazyChartProps {
  data: ChartData;
  options: ChartOptions;
  className?: string;
}

const LazyChartComponent: React.FC<LazyChartProps> = ({ data, options, className }) => {
  return (
    <div className={`w-full h-64 ${className || ''}`}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="md" text="טוען תרשים..." />
        </div>
      }>
        <Bar data={data} options={options} />
      </Suspense>
    </div>
  );
};

export default LazyChartComponent; 