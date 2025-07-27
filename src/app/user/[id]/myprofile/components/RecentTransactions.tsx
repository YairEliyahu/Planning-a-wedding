'use client';

import { WalletInfo } from '../types/profileTypes';

interface RecentTransactionsProps {
  walletInfo: WalletInfo;
}

export default function RecentTransactions({ walletInfo }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4">הוצאות אחרונות</h3>
      {walletInfo.lastTransactions.length > 0 ? (
        <div className="responsive-table">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">שם הפריט</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">סכום</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {walletInfo.lastTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm">{transaction.itemName}</td>
                    <td className="py-3 px-4 font-medium text-sm">₪{transaction.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{new Date(transaction.date).toLocaleDateString('he-IL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* מבט מובייל */}
          <div className="sm:hidden space-y-3">
            {walletInfo.lastTransactions.map((transaction, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{transaction.itemName}</h4>
                  <span className="font-bold text-sm text-purple-600">₪{transaction.amount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('he-IL')}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-gray-500">אין הוצאות אחרונות</p>
        </div>
      )}
    </div>
  );
} 