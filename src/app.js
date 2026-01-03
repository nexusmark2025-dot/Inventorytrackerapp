// Data storage
let inventory = [];
let transactions = [];
let currentPage = 'dashboard';

// Load data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  navigateTo('dashboard');
});

// Save data to localStorage
function saveData() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Load data from localStorage
function loadData() {
  const savedInventory = localStorage.getItem('inventory');
  const savedTransactions = localStorage.getItem('transactions');
  
  if (savedInventory) {
    inventory = JSON.parse(savedInventory);
  }
  
  if (savedTransactions) {
    transactions = JSON.parse(savedTransactions).map(t => ({
      ...t,
      date: new Date(t.date)
    }));
  }
}

// Navigation
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(el => {
    el.classList.add('hidden');
  });
  
  // Show selected page
  document.getElementById(`page-${page}`).classList.remove('hidden');
  
  // Update navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`nav-${page}`).classList.add('active');
  
  currentPage = page;
  
  // Render page content
  switch(page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'inventory':
      renderInventoryPage();
      break;
    case 'transactions':
      renderTransactionsPage();
      break;
    case 'reports':
      renderReportsPage();
      break;
  }
}

// Toggle add product form
function toggleAddForm() {
  const form = document.getElementById('add-product-form');
  const button = document.getElementById('show-add-form');
  
  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden');
    button.classList.add('hidden');
  } else {
    form.classList.add('hidden');
    button.classList.remove('hidden');
    document.querySelector('#add-product-form form').reset();
  }
}

// Add product
function addProduct(event) {
  event.preventDefault();
  
  const product = {
    id: Date.now().toString(),
    name: document.getElementById('product-name').value,
    category: document.getElementById('product-category').value,
    stock: parseInt(document.getElementById('product-stock').value) || 0,
    costPrice: parseFloat(document.getElementById('product-cost').value) || 0,
    sellingPrice: parseFloat(document.getElementById('product-selling').value) || 0
  };
  
  inventory.push(product);
  saveData();
  toggleAddForm();
  renderInventoryPage();
}

// Delete product
function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    inventory = inventory.filter(item => item.id !== id);
    transactions = transactions.filter(t => t.itemId !== id);
    saveData();
    renderInventoryPage();
  }
}

// Show transaction modal
function showTransactionModal() {
  if (inventory.length === 0) {
    alert('Please add products to your inventory first');
    return;
  }
  
  const modal = document.getElementById('transaction-modal');
  const productSelect = document.getElementById('transaction-product');
  
  // Populate product dropdown
  productSelect.innerHTML = inventory.map(item => 
    `<option value="${item.id}">${item.name} (Stock: ${item.stock})</option>`
  ).join('');
  
  // Set default price
  if (inventory.length > 0) {
    const firstProduct = inventory[0];
    document.getElementById('transaction-price').value = firstProduct.sellingPrice;
  }
  
  modal.classList.remove('hidden');
  updateTransactionTotal();
}

// Close transaction modal
function closeTransactionModal() {
  document.getElementById('transaction-modal').classList.add('hidden');
  document.querySelector('#transaction-modal form').reset();
}

// Update transaction total
function updateTransactionTotal() {
  const quantity = parseFloat(document.getElementById('transaction-quantity').value) || 0;
  const price = parseFloat(document.getElementById('transaction-price').value) || 0;
  const total = quantity * price;
  
  document.getElementById('transaction-total').textContent = `₹${total.toFixed(2)}`;
}

// Listen for quantity and price changes
document.addEventListener('DOMContentLoaded', () => {
  const quantityInput = document.getElementById('transaction-quantity');
  const priceInput = document.getElementById('transaction-price');
  const productSelect = document.getElementById('transaction-product');
  
  if (quantityInput) {
    quantityInput.addEventListener('input', updateTransactionTotal);
  }
  
  if (priceInput) {
    priceInput.addEventListener('input', updateTransactionTotal);
  }
  
  if (productSelect) {
    productSelect.addEventListener('change', () => {
      const selectedProduct = inventory.find(item => item.id === productSelect.value);
      if (selectedProduct) {
        const type = document.getElementById('transaction-type').value;
        priceInput.value = type === 'sale' ? selectedProduct.sellingPrice : selectedProduct.costPrice;
        updateTransactionTotal();
      }
    });
  }
  
  const typeSelect = document.getElementById('transaction-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const selectedProduct = inventory.find(item => item.id === productSelect.value);
      if (selectedProduct) {
        const type = typeSelect.value;
        priceInput.value = type === 'sale' ? selectedProduct.sellingPrice : selectedProduct.costPrice;
        updateTransactionTotal();
      }
    });
  }
});

// Submit transaction
function submitTransaction(event) {
  event.preventDefault();
  
  const itemId = document.getElementById('transaction-product').value;
  const type = document.getElementById('transaction-type').value;
  const quantity = parseInt(document.getElementById('transaction-quantity').value) || 0;
  const pricePerUnit = parseFloat(document.getElementById('transaction-price').value) || 0;
  
  const item = inventory.find(i => i.id === itemId);
  if (!item) return;
  
  // Check stock for sales
  if (type === 'sale' && quantity > item.stock) {
    alert('Insufficient stock!');
    return;
  }
  
  const transaction = {
    id: Date.now().toString(),
    itemId,
    itemName: item.name,
    type,
    quantity,
    pricePerUnit,
    totalAmount: quantity * pricePerUnit,
    date: new Date()
  };
  
  transactions.unshift(transaction);
  
  // Update stock
  const stockChange = type === 'purchase' ? quantity : -quantity;
  item.stock += stockChange;
  
  saveData();
  closeTransactionModal();
  
  if (currentPage === 'transactions') {
    renderTransactionsPage();
  } else if (currentPage === 'inventory') {
    renderInventoryPage();
  } else if (currentPage === 'dashboard') {
    renderDashboard();
  }
}

// Render Dashboard
function renderDashboard() {
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
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.stock * item.costPrice), 0);
  
  // Render stats
  const statsHtml = `
    <button onclick="navigateTo('inventory')" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left">
      <div class="flex items-center justify-between mb-4">
        <div class="p-3 rounded-lg bg-blue-100">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M20 7h-4V5.5a2.5 2.5 0 00-5 0V7H7a2 2 0 00-2 2v10a2 2 0 002 2h13a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm text-gray-600 mb-1">Total Products</h3>
      <p class="text-2xl font-bold text-blue-600">${inventory.length}</p>
    </button>
    
    <button onclick="navigateTo('reports')" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left">
      <div class="flex items-center justify-between mb-4">
        <div class="p-3 rounded-lg bg-green-100">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm text-gray-600 mb-1">Total Revenue</h3>
      <p class="text-2xl font-bold text-green-600">₹${totalRevenue.toFixed(2)}</p>
    </button>
    
    <button onclick="navigateTo('reports')" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left">
      <div class="flex items-center justify-between mb-4">
        <div class="p-3 rounded-lg ${profit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}">
          <svg class="w-6 h-6 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm text-gray-600 mb-1">Total Profit</h3>
      <p class="text-2xl font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}">₹${profit.toFixed(2)}</p>
    </button>
    
    <button onclick="navigateTo('inventory')" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left">
      <div class="flex items-center justify-between mb-4">
        <div class="p-3 rounded-lg bg-purple-100">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M20 7h-4V5.5a2.5 2.5 0 00-5 0V7H7a2 2 0 00-2 2v10a2 2 0 002 2h13a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm text-gray-600 mb-1">Inventory Value</h3>
      <p class="text-2xl font-bold text-purple-600">₹${totalInventoryValue.toFixed(2)}</p>
    </button>
  `;
  
  document.getElementById('dashboard-stats').innerHTML = statsHtml;
  
  // Render stock alerts
  const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock < 10);
  const outOfStockItems = inventory.filter(item => item.stock === 0);
  
  let alertsHtml = '';
  if (outOfStockItems.length === 0 && lowStockItems.length === 0) {
    alertsHtml = '<p class="text-gray-500">All items are well stocked</p>';
  } else {
    alertsHtml = '<div class="space-y-3">';
    
    outOfStockItems.forEach(item => {
      alertsHtml += `
        <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div>
            <div class="font-medium text-gray-900">${item.name}</div>
            <div class="text-sm text-red-600">Out of stock</div>
          </div>
          <button onclick="navigateTo('inventory')" class="text-sm text-red-600 hover:text-red-700 font-medium">Restock</button>
        </div>
      `;
    });
    
    lowStockItems.forEach(item => {
      alertsHtml += `
        <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div>
            <div class="font-medium text-gray-900">${item.name}</div>
            <div class="text-sm text-yellow-700">Low stock: ${item.stock} units</div>
          </div>
          <button onclick="navigateTo('inventory')" class="text-sm text-yellow-700 hover:text-yellow-800 font-medium">View</button>
        </div>
      `;
    });
    
    alertsHtml += '</div>';
  }
  
  document.getElementById('stock-alerts').innerHTML = alertsHtml;
  
  // Render recent transactions
  const recentTransactions = transactions.slice(0, 5);
  let transactionsHtml = '';
  
  if (recentTransactions.length === 0) {
    transactionsHtml = '<p class="text-gray-500">No transactions yet</p>';
  } else {
    transactionsHtml = '<div class="space-y-3">';
    
    recentTransactions.forEach(transaction => {
      transactionsHtml += `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div class="font-medium text-gray-900">${transaction.itemName}</div>
            <div class="text-sm text-gray-600">${transaction.type === 'purchase' ? 'Purchase' : 'Sale'} • ${transaction.quantity} units</div>
          </div>
          <div class="text-right ${transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'} font-semibold">
            ₹${transaction.totalAmount.toFixed(2)}
          </div>
        </div>
      `;
    });
    
    transactionsHtml += '</div>';
  }
  
  document.getElementById('recent-transactions').innerHTML = transactionsHtml;
}

// Render Inventory Page
function renderInventoryPage() {
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.costPrice), 0);
  
  // Render summary
  const summaryHtml = `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Products</h3>
      <p class="text-2xl font-bold text-gray-900">${totalItems}</p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Stock Units</h3>
      <p class="text-2xl font-bold text-gray-900">${totalStock}</p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Inventory Value</h3>
      <p class="text-2xl font-bold text-gray-900">₹${totalValue.toFixed(2)}</p>
    </div>
  `;
  
  document.getElementById('inventory-summary').innerHTML = summaryHtml;
  
  // Render inventory table
  let tableHtml = '';
  
  if (inventory.length === 0) {
    tableHtml = `
      <tr>
        <td colspan="7" class="px-6 py-12 text-center text-gray-500">
          No products yet. Add your first product to get started!
        </td>
      </tr>
    `;
  } else {
    inventory.forEach(item => {
      const potentialProfit = item.stock * (item.sellingPrice - item.costPrice);
      const profitMargin = item.sellingPrice > 0 ? ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100) : 0;
      
      tableHtml += `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 text-gray-900">${item.name}</td>
          <td class="px-6 py-4">
            <span class="inline-flex px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">${item.category}</span>
          </td>
          <td class="px-6 py-4 text-right">
            <span class="inline-flex px-3 py-1 text-sm ${item.stock === 0 ? 'bg-red-100 text-red-700' : item.stock < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} rounded-full">
              ${item.stock}
            </span>
          </td>
          <td class="px-6 py-4 text-right text-gray-900">₹${item.costPrice.toFixed(2)}</td>
          <td class="px-6 py-4 text-right text-gray-900">₹${item.sellingPrice.toFixed(2)}</td>
          <td class="px-6 py-4 text-right">
            <div class="font-semibold text-gray-900">₹${potentialProfit.toFixed(2)}</div>
            <div class="text-sm ${profitMargin > 0 ? 'text-green-600' : 'text-gray-500'}">${profitMargin.toFixed(1)}% margin</div>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button onclick="showTransactionModalForItem('${item.id}', 'purchase')" class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">Buy</button>
              <button onclick="showTransactionModalForItem('${item.id}', 'sale')" class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Sell</button>
              <button onclick="deleteProduct('${item.id}')" class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });
  }
  
  document.getElementById('inventory-table').innerHTML = tableHtml;
}

// Show transaction modal for specific item
function showTransactionModalForItem(itemId, type) {
  showTransactionModal();
  document.getElementById('transaction-type').value = type;
  document.getElementById('transaction-product').value = itemId;
  
  const item = inventory.find(i => i.id === itemId);
  if (item) {
    document.getElementById('transaction-price').value = type === 'sale' ? item.sellingPrice : item.costPrice;
    updateTransactionTotal();
  }
}

// Render Transactions Page
function renderTransactionsPage() {
  const totalPurchases = transactions.filter(t => t.type === 'purchase').length;
  const totalSales = transactions.filter(t => t.type === 'sale').length;
  const totalPurchaseAmount = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.totalAmount, 0);
  const totalSalesAmount = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  
  // Render summary
  const summaryHtml = `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Purchases</h3>
      <p class="text-2xl font-bold text-gray-900">${totalPurchases}</p>
      <p class="text-sm text-green-600 mt-1">₹${totalPurchaseAmount.toFixed(2)}</p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Sales</h3>
      <p class="text-2xl font-bold text-gray-900">${totalSales}</p>
      <p class="text-sm text-blue-600 mt-1">₹${totalSalesAmount.toFixed(2)}</p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Transactions</h3>
      <p class="text-2xl font-bold text-gray-900">${transactions.length}</p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Net Flow</h3>
      <p class="text-2xl font-bold ${totalSalesAmount - totalPurchaseAmount >= 0 ? 'text-green-600' : 'text-red-600'}">
        ₹${(totalSalesAmount - totalPurchaseAmount).toFixed(2)}
      </p>
    </div>
  `;
  
  document.getElementById('transaction-summary').innerHTML = summaryHtml;
  
  // Render transactions table
  let tableHtml = '';
  
  if (transactions.length === 0) {
    tableHtml = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
          No transactions yet. Record your first transaction!
        </td>
      </tr>
    `;
  } else {
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      tableHtml += `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 text-sm text-gray-900">${formattedDate}</td>
          <td class="px-6 py-4">
            <span class="inline-flex px-3 py-1 text-sm ${transaction.type === 'purchase' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} rounded-full">
              ${transaction.type === 'purchase' ? 'Purchase' : 'Sale'}
            </span>
          </td>
          <td class="px-6 py-4 text-gray-900">${transaction.itemName}</td>
          <td class="px-6 py-4 text-right text-gray-900">${transaction.quantity}</td>
          <td class="px-6 py-4 text-right text-gray-900">₹${transaction.pricePerUnit.toFixed(2)}</td>
          <td class="px-6 py-4 text-right font-semibold text-gray-900">₹${transaction.totalAmount.toFixed(2)}</td>
        </tr>
      `;
    });
  }
  
  document.getElementById('transactions-table').innerHTML = tableHtml;
}

// Render Reports Page
function renderReportsPage() {
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
  
  // Render profit overview
  const profitHtml = `
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center gap-3 mb-3">
        <div class="p-3 bg-blue-100 rounded-lg">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
      <p class="text-2xl font-bold text-gray-900">₹${totalRevenue.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-1">From sales</p>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center gap-3 mb-3">
        <div class="p-3 bg-red-100 rounded-lg">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm font-medium text-gray-600 mb-1">Total Cost</h3>
      <p class="text-2xl font-bold text-gray-900">₹${totalCost.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-1">Cost of goods sold</p>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center gap-3 mb-3">
        <div class="p-3 ${grossProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg">
          <svg class="w-6 h-6 ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm font-medium text-gray-600 mb-1">Gross Profit</h3>
      <p class="text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}">₹${grossProfit.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-1">${profitMargin.toFixed(1)}% margin</p>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center gap-3 mb-3">
        <div class="p-3 bg-purple-100 rounded-lg">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M20 7h-4V5.5a2.5 2.5 0 00-5 0V7H7a2 2 0 00-2 2v10a2 2 0 002 2h13a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
          </svg>
        </div>
      </div>
      <h3 class="text-sm font-medium text-gray-600 mb-1">Inventory Value</h3>
      <p class="text-2xl font-bold text-gray-900">₹${totalInventoryValue.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-1">Current stock value</p>
    </div>
  `;
  
  document.getElementById('profit-overview').innerHTML = profitHtml;
  
  // Render potential profit
  const potentialHtml = `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Potential Revenue</h3>
      <p class="text-2xl font-bold text-gray-900">₹${potentialRevenue.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-1">If all stock sells at selling price</p>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Potential Profit</h3>
      <p class="text-2xl font-bold text-green-600">₹${potentialProfit.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-1">From current inventory</p>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-sm font-medium text-gray-600 mb-1">Purchase Spending</h3>
      <p class="text-2xl font-bold text-gray-900">₹${totalPurchaseSpend.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-1">Total spent on purchases</p>
    </div>
  `;
  
  document.getElementById('potential-profit').innerHTML = potentialHtml;
  
  // Calculate category breakdown
  const categoryStats = {};
  inventory.forEach(item => {
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = {
        items: 0,
        stock: 0,
        value: 0,
        potentialRevenue: 0
      };
    }
    categoryStats[item.category].items += 1;
    categoryStats[item.category].stock += item.stock;
    categoryStats[item.category].value += item.stock * item.costPrice;
    categoryStats[item.category].potentialRevenue += item.stock * item.sellingPrice;
  });
  
  // Render category table
  let categoryHtml = '';
  
  if (Object.keys(categoryStats).length === 0) {
    categoryHtml = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
          No categories yet
        </td>
      </tr>
    `;
  } else {
    Object.entries(categoryStats).forEach(([category, stats]) => {
      categoryHtml += `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4">
            <span class="inline-flex px-3 py-1 bg-gray-100 text-gray-700 rounded">${category}</span>
          </td>
          <td class="px-6 py-4 text-right text-gray-900">${stats.items}</td>
          <td class="px-6 py-4 text-right text-gray-900">${stats.stock}</td>
          <td class="px-6 py-4 text-right text-gray-900">₹${stats.value.toFixed(2)}</td>
          <td class="px-6 py-4 text-right text-gray-900">₹${stats.potentialRevenue.toFixed(2)}</td>
          <td class="px-6 py-4 text-right font-semibold text-green-600">
            ₹${(stats.potentialRevenue - stats.value).toFixed(2)}
          </td>
        </tr>
      `;
    });
  }
  
  document.getElementById('category-table').innerHTML = categoryHtml;
  
  // Calculate top products
  const productSales = {};
  transactions.filter(t => t.type === 'sale').forEach(t => {
    if (!productSales[t.itemId]) {
      productSales[t.itemId] = {
        name: t.itemName,
        quantity: 0,
        revenue: 0
      };
    }
    productSales[t.itemId].quantity += t.quantity;
    productSales[t.itemId].revenue += t.totalAmount;
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  // Render top products table
  let topProductsHtml = '';
  
  if (topProducts.length === 0) {
    topProductsHtml = `
      <tr>
        <td colspan="4" class="px-6 py-12 text-center text-gray-500">
          No sales data yet
        </td>
      </tr>
    `;
  } else {
    topProducts.forEach((product, index) => {
      topProductsHtml += `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
              ${index + 1}
            </div>
          </td>
          <td class="px-6 py-4 text-gray-900">${product.name}</td>
          <td class="px-6 py-4 text-right text-gray-900">${product.quantity}</td>
          <td class="px-6 py-4 text-right font-semibold text-green-600">₹${product.revenue.toFixed(2)}</td>
        </tr>
      `;
    });
  }
  
  document.getElementById('top-products-table').innerHTML = topProductsHtml;
}
