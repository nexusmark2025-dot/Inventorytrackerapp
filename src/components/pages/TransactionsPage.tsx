import { useState } from 'react';
import { InventoryItem, Transaction } from '../../App';
import { TransactionHistory } from '../TransactionHistory';
import { Plus } from 'lucide-react';
import { TransactionModal } from '../TransactionModal';

interface TransactionsPageProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
  onAddTransaction: (
    itemId: string,
    type: 'purchase' | 'sale',
    quantity: number,
    pricePerUnit: number
  ) => void;
}

export function TransactionsPage({
  inventory,
  transactions,
  onAddTransaction,
}: TransactionsPageProps) {
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('sale');

  const totalPurchases = transactions.filter(t => t.type === 'purchase').length;
  const totalSales = transactions.filter(t => t.type === 'sale').length;
  const totalPurchaseAmount = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const totalSalesAmount = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const handleOpenModal = () => {
    if (inventory.length === 0) {
      alert('Please add products to your inventory first');
      return;
    }
    setSelectedItem(inventory[0].id);
    setShowNewTransaction(true);
  };

  const handleSubmitTransaction = (quantity: number, pricePerUnit: number) => {
    if (selectedItem) {
      onAddTransaction(selectedItem, transactionType, quantity, pricePerUnit);
      setShowNewTransaction(false);
    }
  };

  const selectedInventoryItem = inventory.find(item => item.id === selectedItem);

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 mb-2">Transaction Management</h2>
            <p className="text-gray-600">
              Record and track all purchases and sales
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Transaction
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-1">Total Purchases</h3>
          <p className="text-gray-900">{totalPurchases}</p>
          <p className="text-green-600">₹{totalPurchaseAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-1">Total Sales</h3>
          <p className="text-gray-900">{totalSales}</p>
          <p className="text-blue-600">₹{totalSalesAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-1">Total Transactions</h3>
          <p className="text-gray-900">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-1">Net Flow</h3>
          <p className={`text-gray-900 ${totalSalesAmount - totalPurchaseAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{(totalSalesAmount - totalPurchaseAmount).toFixed(2)}
          </p>
        </div>
      </div>

      <TransactionHistory transactions={transactions} />

      {/* New Transaction Modal */}
      {showNewTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-gray-900 mb-4">New Transaction</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as 'purchase' | 'sale')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sale">Sale</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Select Product
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Stock: {item.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewTransaction(false);
                  if (selectedInventoryItem) {
                    // This will trigger the actual transaction modal
                    const tempModal = document.createElement('div');
                    document.body.appendChild(tempModal);
                  }
                }}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => setShowNewTransaction(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actual Transaction Entry Modal */}
      {showNewTransaction && selectedInventoryItem && (
        <TransactionModal
          item={selectedInventoryItem}
          type={transactionType}
          onClose={() => setShowNewTransaction(false)}
          onSubmit={handleSubmitTransaction}
        />
      )}
    </div>
  );
}
