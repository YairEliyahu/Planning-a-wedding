'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useChecklistContext } from '../context/ChecklistContext';
import { generateChartOptions } from '../utils/checklistUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChecklistChart() {
  const { chartData, summary } = useChecklistContext();

  const chartOptions = generateChartOptions(summary.expectedIncome, summary.totalExpenses);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">ניתוח הכנסות והוצאות</h3>
      <div className="h-[400px] relative">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
} 