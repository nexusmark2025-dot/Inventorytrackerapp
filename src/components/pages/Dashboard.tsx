import { InventoryItem, Transaction } from '../../App';
import { DollarSign, TrendingUp, Package, AlertTriangle, ArrowRight } from 'lucide-react';

interface DashboardProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
  onNavigate: (page: 'dashboard' | 'inventory' | 'transactions' | 'reports') => void;
}

export function Dashboard({ inventory, transactions, onNavigate }: DashboardProps) {
  // Calculate metrics
  let totalRevenue = 0;
  let totalCost = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'sale') {
      totalRevenue += transaction.totalAmount;
      const item = inventory.find(i => i.id === transaction.itemId);
      if (item) {
        totalCost += transaction.quantity * item.costPrice;
      }
    }
  });

  const profit = totalRevenue - totalCost;
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + (item.stock * item.costPrice),
    0
  );

  const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock < 10);
  const outOfStockItems = inventory.filter(item => item.stock === 0);

  const recentTransactions = transactions.slice(0, 5);

  const stats = [
    {
      label: 'Total Products',
      value: inventory.length.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: () => onNavigate('inventory'),
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      onClick: () => onNavigate('reports'),
    },
    {
      label: 'Total Profit',
      value: `₹${profit.toFixed(2)}`,
      icon: TrendingUp,
      color: profit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: profit >= 0 ? 'bg-emerald-100' : 'bg-red-100',
      onClick: () => onNavigate('reports'),
    },
    {
      label: 'Inventory Value',
      value: `₹${totalInventoryValue.toFixed(2)}`,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      onClick: () => onNavigate('inventory'),
    },
  ];

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">
          Track your inventory performance at a glance
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.onClick}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-gray-600 mb-1">{stat.label}</h3>
            <p className={`text-gray-900 ${stat.color}`}>{stat.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-gray-900">Stock Alerts</h3>
          </div>
          {outOfStockItems.length === 0 && lowStockItems.length === 0 ? (
            <p className="text-gray-500">All items are well stocked</p>
          ) : (
            <div className="space-y-3">
              {outOfStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="text-gray-900">{item.name}</div>
                    <div className="text-red-600">Out of stock</div>
                  </div>
                  <button
                    onClick={() => onNavigate('inventory')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Restock
                  </button>
                </div>
              ))}
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="text-gray-900">{item.name}</div>
                    <div className="text-yellow-700">Low stock: {item.stock} units</div>
                  </div>
                  <button
                    onClick={() => onNavigate('inventory')}
                    className="text-yellow-700 hover:text-yellow-800"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-gray-900">{transaction.itemName}</div>
                    <div className="text-gray-600">
                      {transaction.type === 'purchase' ? 'Purchase' : 'Sale'} • {transaction.quantity} units
                    </div>
                  </div>
                  <div className={`text-right ${transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`}>
                    ₹{transaction.totalAmount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('inventory')}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left border-l-4 border-blue-600"
        >
          <h3 className="text-gray-900 mb-2">Add New Product</h3>
          <p className="text-gray-600">Add items to your inventory</p>
        </button>
        <button
          onClick={() => onNavigate('transactions')}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left border-l-4 border-green-600"
        >
          <h3 className="text-gray-900 mb-2">Record Transaction</h3>
          <p className="text-gray-600">Log purchases or sales</p>
        </button>
        <button
          onClick={() => onNavigate('reports')}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left border-l-4 border-purple-600"
        >
          <h3 className="text-gray-900 mb-2">View Reports</h3>
          <p className="text-gray-600">Analyze your profits and trends</p>
        </button>
      </div>
    </div>
  );
}
