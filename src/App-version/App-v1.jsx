import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Calendar, TrendingUp, TrendingDown, PieChart, Search, Download, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
// import exportData from "./components/exportData"

const ExpenseTracker = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'transactions');
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDescriptions, setShowDescriptions] = useState(() => {
    const saved = localStorage.getItem('showDescriptions');
    return saved ? JSON.parse(saved) : false;
  });
  const [collapsedAccounts, setCollapsedAccounts] = useState(() => {
    const saved = localStorage.getItem('collapsedAccounts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // Default categories and accounts
  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('incomeCategories');
    return saved ? JSON.parse(saved) : ['Salary', 'Gift', 'Other'];
  });
  const [expenseCategories, setExpenseCategories] = useState(() => {
    const saved = localStorage.getItem('expenseCategories');
    return saved ? JSON.parse(saved) : ['Food', 'Transportation', 'Offering & Tithe', 'Other'];
  });
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : ['My Cash', 'PocketApp', 'PalmPay', 'Cowrywise', 'Kuda'];
  });
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    account: '',
    note: '',
    description: '',
    type: 'expense'
  });
  
  // Settings form state
  const [newCategory, setNewCategory] = useState({ name: '', type: 'income' });
  const [newAccount, setNewAccount] = useState('');

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('showDescriptions', JSON.stringify(showDescriptions));
  }, [showDescriptions]);

  useEffect(() => {
    localStorage.setItem('collapsedAccounts', JSON.stringify([...collapsedAccounts]));
  }, [collapsedAccounts]);

  useEffect(() => {
    localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Add transaction
  const addTransaction = () => {
    if (!formData.amount || !formData.category || !formData.account) return;
    
    const transaction = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    setTransactions([transaction, ...transactions]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      account: '',
      note: '',
      description: '',
      type: 'expense'
    });
    setShowTransactionForm(false);
  };

  // Add new category
  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    if (newCategory.type === 'income') {
      if (!incomeCategories.includes(newCategory.name)) {
        setIncomeCategories([...incomeCategories, newCategory.name]);
      }
    } else {
      if (!expenseCategories.includes(newCategory.name)) {
        setExpenseCategories([...expenseCategories, newCategory.name]);
      }
    }
    
    setNewCategory({ name: '', type: 'income' });
  };

  // Delete category
  const deleteCategory = (categoryName, type) => {
    if (type === 'income') {
      setIncomeCategories(incomeCategories.filter(cat => cat !== categoryName));
    } else {
      setExpenseCategories(expenseCategories.filter(cat => cat !== categoryName));
    }
  };

  // Add new account
  const addAccount = () => {
    if (!newAccount.trim()) return;
    if (!accounts.includes(newAccount)) {
      setAccounts([...accounts, newAccount]);
    }
    setNewAccount('');
  };

  // Delete account
  const deleteAccount = (accountName) => {
    setAccounts(accounts.filter(acc => acc !== accountName));
  };

  // Delete transaction
  const deleteTransaction = (transactionId) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  // Export data as JSON
  const exportData = () => {
    const data = {
      transactions,
      incomeCategories,
      expenseCategories,
      accounts,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Export data as Excel (CSV format)
  const exportToExcel = () => {
    // Prepare CSV headers
    const headers = ['Date', 'Type', 'Amount (₦)', 'Category', 'Account', 'Note', 'Description'];
    
    // Convert transactions to CSV format
    const csvData = transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.type === 'income' ? 'Income' : 'Expense',
      transaction.amount,
      transaction.category,
      transaction.account,
      transaction.note || '',
      transaction.description || ''
    ]);
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get account balances
  const getAccountBalances = () => {
    const balances = {};
    
    // Initialize all accounts with 0 balance
    accounts.forEach(account => {
      balances[account] = { balance: 0, transactions: [] };
    });
    
    // Calculate balances and group transactions by account
    transactions.forEach(transaction => {
      if (balances[transaction.account]) {
        if (transaction.type === 'income') {
          balances[transaction.account].balance += transaction.amount;
        } else {
          balances[transaction.account].balance -= transaction.amount;
        }
        balances[transaction.account].transactions.push(transaction);
      }
    });
    
    // Sort transactions by date (newest first) for each account
    Object.keys(balances).forEach(account => {
      balances[account].transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return balances;
  };

  // Toggle account collapse
  const toggleAccountCollapse = (accountName) => {
    const newCollapsed = new Set(collapsedAccounts);
    if (newCollapsed.has(accountName)) {
      newCollapsed.delete(accountName);
    } else {
      newCollapsed.add(accountName);
    }
    setCollapsedAccounts(newCollapsed);
  };

  // Filter transactions based on search query
  const getFilteredTransactions = () => {
    if (!searchQuery.trim()) return transactions;
    
    const query = searchQuery.toLowerCase();
    return transactions.filter(transaction => 
      transaction.note?.toLowerCase().includes(query) ||
      transaction.description?.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query) ||
      transaction.account.toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query)
    );
  };

  // Get monthly summary
  const getMonthlyData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses, transactions: currentMonthTransactions };
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const monthlyData = getMonthlyData();
    const incomeCategoryTotals = {};
    const expenseCategoryTotals = {};
    
    monthlyData.transactions.forEach(t => {
      if (t.type === 'income') {
        if (!incomeCategoryTotals[t.category]) {
          incomeCategoryTotals[t.category] = 0;
        }
        incomeCategoryTotals[t.category] += t.amount;
      } else {
        if (!expenseCategoryTotals[t.category]) {
          expenseCategoryTotals[t.category] = 0;
        }
        expenseCategoryTotals[t.category] += t.amount;
      }
    });
    
    const incomeCategories = Object.entries(incomeCategoryTotals)
      .map(([category, amount]) => ({ category, amount, type: 'income' }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const expenseCategories = Object.entries(expenseCategoryTotals)
      .map(([category, amount]) => ({ category, amount, type: 'expense' }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return { incomeCategories, expenseCategories };
  };

  const monthlyData = getMonthlyData();
  const categoryBreakdown = getCategoryBreakdown();
  const accountBalances = getAccountBalances();
  const filteredTransactions = getFilteredTransactions();
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        {/* Financial Tracker */}
        {/* Track your income and expenses efficiently */}
        <h1 className="text-2xl font-bold mb-2"></h1>
        <p className="opacity-90"></p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'transactions' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'accounts' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PieChart className="w-4 h-4 inline mr-2" />
            Accounts
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'summary' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'settings' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            {/* Add Transaction Button */}
            <button
              onClick={() => setShowTransactionForm(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg mb-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Transaction
            </button>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions by note, description, category, account, or amount..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Transaction Form Modal */}
            {showTransactionForm && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto hide-scrollbar">
                  <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
                  
                  <div className="space-y-4">
                    {/* Transaction Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="income"
                            checked={formData.type === 'income'}
                            onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                            className="mr-2"
                          />
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          Income
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="expense"
                            checked={formData.type === 'expense'}
                            onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                            className="mr-2"
                          />
                          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                          Expense
                        </label>
                          <label className="flex items-center">
                          <input
                            type="radio"
                            value="transfer"
                            checked={formData.type === 'transfer'}
                            onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                            className="mr-2"
                          />
                          ✖ Transfer
                        </label>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
                      <input
                          type="text"
                          value={formData.amount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^(\d*\.?\d{0,2})$/.test(value)) {
                              setFormData({ ...formData, amount: value });
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          pattern="^(\d*\.?\d{0,2})$"
                          inputMode="decimal"
                          required
                        />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Account */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                      <select
                        value={formData.account}
                        onChange={(e) => setFormData({...formData, account: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Account</option>
                        {accounts.map(account => (
                          <option key={account} value={account}>{account}</option>
                        ))}
                      </select>
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                      <input
                        type="text"
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief note about this transaction"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Transaction details"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowTransactionForm(false)}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addTransaction}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Transaction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions List */}
            <div className="space-y-3">
              {filteredTransactions.length === 0 && searchQuery ? (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Clear search
                  </button>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet. Add your first transaction!</p>
                </div>
              ) : (
                filteredTransactions.map(transaction => (
                  <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.note || transaction.category}</p>
                          {showDescriptions && transaction.description && (
                            <p className="text-sm text-gray-500 italic mt-1">{transaction.description}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {transaction.category} • {transaction.account} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Account Balances</h2>
            
            {/* Account Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {accounts.map(account => {
                const accountData = accountBalances[account];
                const balance = accountData ? accountData.balance : 0;
                const transactionCount = accountData ? accountData.transactions.length : 0;
                
                return (
                  <div key={account} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{account}</h3>
                      <div className={`w-3 h-3 rounded-full ${balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(balance))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Account Transactions */}
            <div className="space-y-6">
              {accounts.map(account => {
                const accountData = accountBalances[account];
                const accountTransactions = accountData ? accountData.transactions : [];
                
                if (accountTransactions.length === 0) return null;
                
                const isCollapsed = collapsedAccounts.has(account);
                
                return (
                  <div key={account} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleAccountCollapse(account)}
                          className="flex items-center space-x-3 text-left hover:text-blue-600 transition-colors"
                        >
                          {isCollapsed ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronUp className="w-5 h-5" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-800">{account}</h3>
                        </button>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {accountTransactions.length} transaction{accountTransactions.length !== 1 ? 's' : ''}
                          </span>
                          <div className={`text-lg font-bold ${accountData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(accountData.balance))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-100">
                        {accountTransactions.map(transaction => (
                          <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {transaction.type === 'income' ? (
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-red-600" />
                                )}
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {transaction.note || transaction.category}
                                  </p>
                                  {showDescriptions && transaction.description && (
                                    <p className="text-sm text-gray-500 italic mt-1">{transaction.description}</p>
                                  )}
                                  <p className="text-sm text-gray-600">
                                    {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </div>
                                <button
                                  onClick={() => deleteTransaction(transaction.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet. Add transactions to see account balances!</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Monthly Summary - {currentMonthName}</h2>
              
              {/* Export Section */}
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyData.income)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyData.expenses)}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className={`${monthlyData.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${monthlyData.balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>Balance</p>
                    <p className={`text-2xl font-bold ${monthlyData.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(monthlyData.balance))}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${monthlyData.balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                    <span className={`text-lg font-bold ${monthlyData.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {monthlyData.balance >= 0 ? '₦' : '!'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {(categoryBreakdown.incomeCategories.length > 0 || categoryBreakdown.expenseCategories.length > 0) && (
              <div className="space-y-6">
                {/* Income Categories */}
                {categoryBreakdown.incomeCategories.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-600">Top Income Categories This Month</h3>
                    <div className="space-y-3">
                      {categoryBreakdown.incomeCategories.map((item) => {
                        const percentage = monthlyData.income > 0 ? ((item.amount / monthlyData.income) * 100).toFixed(0) : 0;
                        return (
                          <div key={item.category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="font-medium">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600">{formatCurrency(item.amount)}</div>
                              <div className="text-sm text-gray-600">{percentage}% of income</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expense Categories */}
                {categoryBreakdown.expenseCategories.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-red-600">Top Expense Categories This Month</h3>
                    <div className="space-y-3">
                      {categoryBreakdown.expenseCategories.map((item) => {
                        const percentage = monthlyData.expenses > 0 ? ((item.amount / monthlyData.expenses) * 100).toFixed(0) : 0;
                        return (
                          <div key={item.category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="font-medium">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-600">{formatCurrency(item.amount)}</div>
                              <div className="text-sm text-gray-600">{percentage}% of expenses</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Settings Management</h2>
            
            {/* Display Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Transaction Descriptions</h4>
                  <p className="text-sm text-gray-600">Show or hide transaction descriptions in all tabs</p>
                </div>
                <button
                  onClick={() => setShowDescriptions(!showDescriptions)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showDescriptions 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showDescriptions ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Descriptions
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show Descriptions
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Add New Category */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="income">Income Category</option>
                  <option value="expense">Expense Category</option>
                </select>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Category name"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addCategory}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>
            </div>

            {/* Add New Account */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Account</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                  placeholder="Account name (e.g., Opay, GTBank, etc.)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addAccount}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </button>
              </div>
            </div>

            {/* Accounts Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-600">Accounts</h3>
              <div className="space-y-2">
                {accounts.map(account => (
                  <div key={account} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">{account}</span>
                    <button
                      onClick={() => deleteAccount(account)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Income Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Income Categories</h3>
              <div className="space-y-2">
                {incomeCategories.map(category => (
                  <div key={category} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">{category}</span>
                    <button
                      onClick={() => deleteCategory(category, 'income')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Expense Categories</h3>
              <div className="space-y-2">
                {expenseCategories.map(category => (
                  <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">{category}</span>
                    <button
                      onClick={() => deleteCategory(category, 'expense')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;