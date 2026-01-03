import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/pages/Dashboard';
import { InventoryPage } from './components/pages/InventoryPage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { ReportsPage } from './components/pages/ReportsPage';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'purchase' | 'sale';
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  date: Date;
}

type Page = 'dashboard' | 'inventory' | 'transactions' | 'reports';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setInventory([...inventory, newItem]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    setTransactions(transactions.filter(t => t.itemId !== id));
  };

  const addTransaction = (
    itemId: string,
    type: 'purchase' | 'sale',
    quantity: number,
    pricePerUnit: number
  ) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      itemId,
      itemName: item.name,
      type,
      quantity,
      pricePerUnit,
      totalAmount: quantity * pricePerUnit,
      date: new Date(),
    };

    setTransactions([transaction, ...transactions]);

    // Update stock
    const newStock = type === 'purchase' 
      ? item.stock + quantity 
      : item.stock - quantity;
    
    updateItem(itemId, { stock: newStock });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            inventory={inventory}
            transactions={transactions}
            onNavigate={setCurrentPage}
          />
        );
      case 'inventory':
        return (
          <InventoryPage
            inventory={inventory}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            onAddTransaction={addTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            inventory={inventory}
            transactions={transactions}
            onAddTransaction={addTransaction}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            inventory={inventory}
            transactions={transactions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="max-w-7xl mx-auto p-6">
        {renderPage()}
      </div>
    </div>
  );
}