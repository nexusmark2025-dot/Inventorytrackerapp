import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Transaction } from '../App';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">No transactions yet</h3>
        <p className="text-gray-500">
          Record purchases and sales to see transaction history
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-gray-700">Product</th>
              <th className="px-6 py-3 text-right text-gray-700">Quantity</th>
              <th className="px-6 py-3 text-right text-gray-700">Price/Unit (₹)</th>
              <th className="px-6 py-3 text-right text-gray-700">Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-600">
                  {transaction.date.toLocaleDateString()} {transaction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded ${
                      transaction.type === 'purchase'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {transaction.type === 'purchase' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {transaction.type === 'purchase' ? 'Purchase' : 'Sale'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {transaction.itemName}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {transaction.quantity}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  ₹{transaction.pricePerUnit.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  ₹{transaction.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
