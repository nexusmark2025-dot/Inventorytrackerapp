import { useState } from 'react';
import { Package, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { InventoryItem } from '../App';
import { TransactionModal } from './TransactionModal';

interface InventoryListProps {
  inventory: InventoryItem[];
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddTransaction: (
    itemId: string,
    type: 'purchase' | 'sale',
    quantity: number,
    pricePerUnit: number
  ) => void;
}

export function InventoryList({
  inventory,
  onUpdateItem,
  onDeleteItem,
  onAddTransaction,
}: InventoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InventoryItem | null>(null);
  const [transactionModal, setTransactionModal] = useState<{
    item: InventoryItem;
    type: 'purchase' | 'sale';
  } | null>(null);

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const saveEdit = () => {
    if (editForm && editingId) {
      onUpdateItem(editingId, editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-500">
          Add your first product to start tracking inventory
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Product</th>
                <th className="px-6 py-3 text-left text-gray-700">Category</th>
                <th className="px-6 py-3 text-right text-gray-700">Stock</th>
                <th className="px-6 py-3 text-right text-gray-700">Cost Price</th>
                <th className="px-6 py-3 text-right text-gray-700">Selling Price</th>
                <th className="px-6 py-3 text-right text-gray-700">Potential Profit</th>
                <th className="px-6 py-3 text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => {
                const isEditing = editingId === item.id;
                const currentItem = isEditing && editForm ? editForm : item;
                const potentialProfit = (item.sellingPrice - item.costPrice) * item.stock;
                const profitMargin = item.costPrice > 0 
                  ? ((item.sellingPrice - item.costPrice) / item.costPrice * 100) 
                  : 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentItem.name}
                          onChange={(e) =>
                            setEditForm({ ...currentItem, name: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-gray-900">{item.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentItem.category}
                          onChange={(e) =>
                            setEditForm({ ...currentItem, category: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {item.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex px-2 py-1 rounded ${
                          item.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : item.stock < 10
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={currentItem.costPrice}
                          onChange={(e) =>
                            setEditForm({
                              ...currentItem,
                              costPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                      ) : (
                        `₹${item.costPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={currentItem.sellingPrice}
                          onChange={(e) =>
                            setEditForm({
                              ...currentItem,
                              sellingPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                      ) : (
                        `₹${item.sellingPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-900">
                        ₹{potentialProfit.toFixed(2)}
                      </div>
                      <div className={`${profitMargin > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {profitMargin.toFixed(1)}% margin
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setTransactionModal({ item, type: 'purchase' })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Add Purchase"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTransactionModal({ item, type: 'sale' })}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Record Sale"
                            >
                              <TrendingDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${item.name}?`)) {
                                  onDeleteItem(item.id);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {transactionModal && (
        <TransactionModal
          item={transactionModal.item}
          type={transactionModal.type}
          onClose={() => setTransactionModal(null)}
          onSubmit={(quantity, pricePerUnit) => {
            onAddTransaction(
              transactionModal.item.id,
              transactionModal.type,
              quantity,
              pricePerUnit
            );
            setTransactionModal(null);
          }}
        />
      )}
    </>
  );
}
