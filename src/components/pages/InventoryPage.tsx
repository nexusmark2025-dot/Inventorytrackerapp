import { InventoryItem } from '../../App';
import { InventoryForm } from '../InventoryForm';
import { InventoryList } from '../InventoryList';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddTransaction: (
    itemId: string,
    type: 'purchase' | 'sale',
    quantity: number,
    pricePerUnit: number
  ) => void;
}

export function InventoryPage({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddTransaction,
}: InventoryPageProps) {
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.costPrice), 0);

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-gray-900 mb-2">Inventory Management</h2>
        <p className="text-gray-600">
          Manage your products and stock levels
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-1">Total Products</h3>
          <p className="text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-1">Total Stock Units</h3>
          <p className="text-gray-900">{totalStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-1">Total Inventory Value</h3>
          <p className="text-gray-900">₹{totalValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-8">
        <InventoryForm onAddItem={onAddItem} />
      </div>

      <InventoryList
        inventory={inventory}
        onUpdateItem={onUpdateItem}
        onDeleteItem={onDeleteItem}
        onAddTransaction={onAddTransaction}
      />
    </div>
  );
}
