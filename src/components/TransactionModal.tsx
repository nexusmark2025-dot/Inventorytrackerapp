import { useState } from 'react';
import { X } from 'lucide-react';
import { InventoryItem } from '../App';

interface TransactionModalProps {
  item: InventoryItem;
  type: 'purchase' | 'sale';
  onClose: () => void;
  onSubmit: (quantity: number, pricePerUnit: number) => void;
}

export function TransactionModal({
  item,
  type,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(
    type === 'sale' ? item.sellingPrice : item.costPrice
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'sale' && quantity > item.stock) {
      alert('Cannot sell more than available stock!');
      return;
    }

    onSubmit(quantity, pricePerUnit);
  };

  const totalAmount = quantity * pricePerUnit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-gray-900">
            {type === 'purchase' ? 'Add Purchase' : 'Record Sale'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="text-gray-700 mb-1">Product</div>
            <div className="text-gray-900">{item.name}</div>
            <div className="text-gray-500">
              Current stock: {item.stock}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              required
              min="1"
              max={type === 'sale' ? item.stock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {type === 'sale' && quantity > item.stock && (
              <p className="text-red-600 mt-1">
                Insufficient stock available
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Price per Unit (₹)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Amount:</span>
              <span className="text-gray-900">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className={`flex-1 px-6 py-2 text-white rounded-lg transition-colors ${
                type === 'purchase'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {type === 'purchase' ? 'Add Purchase' : 'Record Sale'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
