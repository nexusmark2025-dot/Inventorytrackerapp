import { DollarSign, TrendingUp, Package, PiggyBank } from 'lucide-react';

interface ProfitSummaryProps {
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  totalInventoryValue: number;
  potentialRevenue: number;
}

export function ProfitSummary({
  totalRevenue,
  totalCost,
  profit,
  profitMargin,
  totalInventoryValue,
  potentialRevenue,
}: ProfitSummaryProps) {
  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Profit',
      value: `₹${profit.toFixed(2)}`,
      subValue: `${profitMargin.toFixed(1)}% margin`,
      icon: TrendingUp,
      color: profit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: profit >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      label: 'Inventory Value',
      value: `₹${totalInventoryValue.toFixed(2)}`,
      subValue: `Potential: ₹${potentialRevenue.toFixed(2)}`,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
          <h3 className="text-gray-600 mb-1">{stat.label}</h3>
          <p className={`text-gray-900 ${stat.color}`}>{stat.value}</p>
          {stat.subValue && (
            <p className="text-gray-500 mt-1">{stat.subValue}</p>
          )}
        </div>
      ))}
    </>
  );
}
