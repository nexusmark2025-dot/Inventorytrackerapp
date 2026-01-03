import { InventoryItem, Transaction } from '../../App';
import { TrendingUp, DollarSign, Package, BarChart3, PieChart } from 'lucide-react';

interface ReportsPageProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
}

export function ReportsPage({ inventory, transactions }: ReportsPageProps) {
  // Calculate profit metrics
  let totalRevenue = 0;
  let totalCost = 0;
  let totalPurchaseSpend = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'sale') {
      totalRevenue += transaction.totalAmount;
      const item = inventory.find(i => i.id === transaction.itemId);
      if (item) {
        totalCost += transaction.quantity * item.costPrice;
      }
    } else {
      totalPurchaseSpend += transaction.totalAmount;
    }
  });

  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.stock * item.costPrice), 0);
  const potentialRevenue = inventory.reduce((sum, item) => sum + (item.stock * item.sellingPrice), 0);
  const potentialProfit = potentialRevenue - totalInventoryValue;

  // Category breakdown
  const categoryStats = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {
        items: 0,
        stock: 0,
        value: 0,
        potentialRevenue: 0,
      };
    }
    acc[item.category].items += 1;
    acc[item.category].stock += item.stock;
    acc[item.category].value += item.stock * item.costPrice;
    acc[item.category].potentialRevenue += item.stock * item.sellingPrice;
    return acc;
  }, {} as Record<string, { items: number; stock: number; value: number; potentialRevenue: number }>);

  // Top performing products
  const productSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((acc, t) => {
      if (!acc[t.itemId]) {
        acc[t.itemId] = {
          name: t.itemName,
          quantity: 0,
          revenue: 0,
        };
      }
      acc[t.itemId].quantity += t.quantity;
      acc[t.itemId].revenue += t.totalAmount;
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-gray-900 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">
          Analyze your business performance and profits
        </p>
      </header>

      {/* Profit Summary */}
      <div className="mb-8">
        <h3 className="text-gray-900 mb-4">Profit Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-gray-900">₹{totalRevenue.toFixed(2)}</p>
            <p className="text-gray-500">From sales</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-gray-600 mb-1">Total Cost</h3>
            <p className="text-gray-900">₹{totalCost.toFixed(2)}</p>
            <p className="text-gray-500">Cost of goods sold</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-lg ${grossProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <BarChart3 className={`w-6 h-6 ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <h3 className="text-gray-600 mb-1">Gross Profit</h3>
            <p className={`text-gray-900 ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{grossProfit.toFixed(2)}
            </p>
            <p className="text-gray-500">{profitMargin.toFixed(1)}% margin</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 mb-1">Inventory Value</h3>
            <p className="text-gray-900">₹{totalInventoryValue.toFixed(2)}</p>
            <p className="text-gray-500">Current stock value</p>
          </div>
        </div>
      </div>

      {/* Potential Profit */}
      <div className="mb-8">
        <h3 className="text-gray-900 mb-4">Potential Profit Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 mb-1">Potential Revenue</h3>
            <p className="text-gray-900">₹{potentialRevenue.toFixed(2)}</p>
            <p className="text-gray-500">If all stock sells at selling price</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 mb-1">Potential Profit</h3>
            <p className="text-green-600">₹{potentialProfit.toFixed(2)}</p>
            <p className="text-gray-500">From current inventory</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 mb-1">Purchase Spending</h3>
            <p className="text-gray-900">₹{totalPurchaseSpend.toFixed(2)}</p>
            <p className="text-gray-500">Total spent on purchases</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-8">
        <h3 className="text-gray-900 mb-4">Category Breakdown</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {Object.keys(categoryStats).length === 0 ? (
            <div className="p-12 text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No categories yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Category</th>
                    <th className="px-6 py-3 text-right text-gray-700">Products</th>
                    <th className="px-6 py-3 text-right text-gray-700">Stock Units</th>
                    <th className="px-6 py-3 text-right text-gray-700">Current Value</th>
                    <th className="px-6 py-3 text-right text-gray-700">Potential Revenue</th>
                    <th className="px-6 py-3 text-right text-gray-700">Potential Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(categoryStats).map(([category, stats]) => (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 rounded">
                          {category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">{stats.items}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{stats.stock}</td>
                      <td className="px-6 py-4 text-right text-gray-900">₹{stats.value.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-900">₹{stats.potentialRevenue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-green-600">
                        ₹{(stats.potentialRevenue - stats.value).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Products */}
      <div>
        <h3 className="text-gray-900 mb-4">Top Performing Products</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {topProducts.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sales data yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Rank</th>
                    <th className="px-6 py-3 text-left text-gray-700">Product</th>
                    <th className="px-6 py-3 text-right text-gray-700">Units Sold</th>
                    <th className="px-6 py-3 text-right text-gray-700">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{product.quantity}</td>
                      <td className="px-6 py-4 text-right text-green-600">₹{product.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
