'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BudgetAnalysis as BudgetAnalysisType, ChartData, ChartOptions } from '../types/profileTypes';

// Lazy load chart component
const LazyChartComponent = dynamic(() => import('@/components/LazyChartComponent'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">
    <LoadingSpinner size="md" text="טוען תרשים..." />
  </div>
});

interface BudgetAnalysisProps {
  budgetAnalysis: BudgetAnalysisType;
}

export default function BudgetAnalysis({ budgetAnalysis }: BudgetAnalysisProps) {
  if (!budgetAnalysis.categories.length) {
    return null;
  }

  const chartData: ChartData = {
    labels: budgetAnalysis.categories.map(cat => cat.name),
    datasets: [{
      label: 'הוצאות לפי קטגוריה',
      data: budgetAnalysis.categories.map(cat => cat.amount),
      backgroundColor: 'rgba(245, 158, 11, 0.5)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'התפלגות הוצאות לפי קטגוריה',
        font: {
          size: typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 14
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
          }
        }
      }
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 xl:col-span-2 relative overflow-hidden">
      {/* רקע דקורטיבי */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full"></div>
      <div className="relative z-10">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
          📊 ניתוח תקציב
        </h3>
        <LazyChartComponent
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
} 