// modify the transfer type transaction history display to a more understandable format 
// add import data button to allow data to be imported from external source.

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Settings, Calendar, TrendingUp, TrendingDown, PieChart, Search, Download, ChevronDown, ChevronUp, Eye, EyeOff, Edit2, AlertTriangle, Save, Upload } from 'lucide-react';

const ExpenseTracker = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'transactions');
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
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
    return saved ? JSON.parse(saved) : ['Salary', 'Gift', 'Carry Over', 'Other'];
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
    toAccount: '',
    note: '',
    description: '',
    type: 'expense'
  });
  
  // Settings form state
  const [newCategory, setNewCategory] = useState({ name: '', type: 'income' });
  const [newAccount, setNewAccount] = useState('');
  // Edit state
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');

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

  // Start editing a transaction
  const startEditing = (transaction) => {
    setIsEditing(true);
    setEditingTransactionId(transaction.id);
    setFormData({
      date: transaction.date,
      amount: transaction.amount.toString(),
      category: transaction.category,
      account: transaction.account,
      toAccount: transaction.toAccount || '',
      note: transaction.note || '',
      description: transaction.description || '',
      type: transaction.category === 'Transfer' ? 'transfer' : transaction.type
    });
    setShowTransactionForm(true);
  };

  // Start editing an account or category
  const startEditingItem = (item, type) => {
    setEditingItem({ item, type });
    setEditValue(item);
  };

  // Save edited item
  const saveEditedItem = () => {
    if (!editValue.trim() || !editingItem) return;

    const { item, type } = editingItem;

    if (type === 'account') {
      if (accounts.includes(editValue) || editValue === item) {
        setEditingItem(null);
        setEditValue('');
        return;
      }
      // Update accounts and transactions
      const updatedAccounts = accounts.map(acc => acc === item ? editValue : acc);
      const updatedTransactions = transactions.map(t => ({
        ...t,
        account: t.account === item ? editValue : t.account,
        toAccount: t.toAccount === item ? editValue : t.toAccount,
        fromAccount: t.fromAccount === item ? editValue : t.fromAccount
      }));
      setAccounts(updatedAccounts);
      setTransactions(updatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else if (type === 'income') {
      if (incomeCategories.includes(editValue) || editValue === item || editValue === 'Carry Over') {
        setEditingItem(null);
        setEditValue('');
        return;
      }
      const updatedCategories = incomeCategories.map(cat => cat === item ? editValue : cat);
      const updatedTransactions = transactions.map(t => ({
        ...t,
        category: t.category === item && t.type === 'income' ? editValue : t.category
      }));
      setIncomeCategories(updatedCategories);
      setTransactions(updatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else if (type === 'expense') {
      if (expenseCategories.includes(editValue) || editValue === item) {
        setEditingItem(null);
        setEditValue('');
        return;
      }
      const updatedCategories = expenseCategories.map(cat => cat === item ? editValue : cat);
      const updatedTransactions = transactions.map(t => ({
        ...t,
        category: t.category === item && t.type === 'expense' ? editValue : t.category
      }));
      setExpenseCategories(updatedCategories);
      setTransactions(updatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    setEditingItem(null);
    setEditValue('');
  };

  // Add or update transaction
  const addOrUpdateTransaction = () => {
    if (!formData.amount || !formData.account) return;
    
    let updatedTransactions;
    
    if (isEditing) {
      if (formData.type === 'transfer') {
        if (!formData.toAccount || formData.account === formData.toAccount) return;
        
        const relatedTransaction = transactions.find(t => 
          t.category === 'Transfer' && 
          t.amount === transactions.find(t => t.id === editingTransactionId).amount && 
          t.date === transactions.find(t => t.id === editingTransactionId).date && 
          ((t.fromAccount === transactions.find(t => t.id === editingTransactionId).account && 
            t.account === transactions.find(t => t.id === editingTransactionId).toAccount) ||
           (t.fromAccount === transactions.find(t => t.id === editingTransactionId).toAccount && 
            t.account === transactions.find(t => t.id === editingTransactionId).fromAccount))
        );

        updatedTransactions = transactions.filter(t => t.id !== editingTransactionId && t.id !== (relatedTransaction?.id));

        const transferOut = {
          id: editingTransactionId,
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: 'Transfer',
          account: formData.account,
          toAccount: formData.toAccount,
          note: formData.note || `Transfer to ${formData.toAccount}`,
          description: formData.description,
          type: 'expense'
        };
        
        const transferIn = {
          id: relatedTransaction ? relatedTransaction.id : Date.now(),
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: 'Transfer',
          account: formData.toAccount,
          fromAccount: formData.account,
          note: formData.note || `Transfer from ${formData.account}`,
          description: formData.description,
          type: 'income'
        };
        
        updatedTransactions = [transferOut, transferIn, ...updatedTransactions];
      } else {
        if (!formData.category) return;
        
        const updatedTransaction = {
          id: editingTransactionId,
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          account: formData.account,
          note: formData.note,
          description: formData.description,
          type: formData.type
        };
        
        updatedTransactions = transactions.map(t => t.id === editingTransactionId ? updatedTransaction : t);
      }
    } else {
      if (formData.type === 'transfer') {
        if (!formData.toAccount || formData.account === formData.toAccount) return;
        
        const transferOut = {
          id: Date.now(),
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: 'Transfer',
          account: formData.account,
          toAccount: formData.toAccount,
          note: formData.note || `Transfer to ${formData.toAccount}`,
          description: formData.description,
          type: 'expense'
        };
        
        const transferIn = {
          id: Date.now() + 1,
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: 'Transfer',
          account: formData.toAccount,
          fromAccount: formData.account,
          note: formData.note || `Transfer from ${formData.account}`,
          description: formData.description,
          type: 'income'
        };
        
        updatedTransactions = [transferOut, transferIn, ...transactions];
      } else {
        if (!formData.category) return;
        
        const transaction = {
          id: Date.now(),
          ...formData,
          amount: parseFloat(formData.amount)
        };
        
        updatedTransactions = [transaction, ...transactions];
      }
    }
    
    setTransactions(updatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      account: '',
      toAccount: '',
      note: '',
      description: '',
      type: 'expense'
    });
    setIsEditing(false);
    setEditingTransactionId(null);
    setShowTransactionForm(false);
  };

  // Delete all transactions
  const deleteAllTransactions = () => {
    setTransactions([]);
    setShowDeleteAllConfirm(false);
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
      setTransactions(transactions.filter(t => t.type !== 'income' || t.category !== categoryName));
    } else {
      setExpenseCategories(expenseCategories.filter(cat => cat !== categoryName));
      setTransactions(transactions.filter(t => t.type !== 'expense' || t.category !== categoryName));
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
    setTransactions(transactions.filter(t => t.account !== accountName && t.toAccount !== accountName && t.fromAccount !== accountName));
  };

  // Delete transaction
  const deleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction && transaction.category === 'Transfer') {
      const relatedTransaction = transactions.find(t => 
        t.category === 'Transfer' && 
        t.amount === transaction.amount && 
        t.date === transaction.date && 
        ((t.fromAccount === transaction.account && t.account === transaction.toAccount) ||
         (t.fromAccount === transaction.toAccount && t.account === transaction.fromAccount))
      );
      setTransactions(transactions.filter(t => t.id !== transactionId && t.id !== (relatedTransaction?.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setTransactions(transactions.filter(t => t.id !== transactionId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };


  // Export data as Excel (CSV format)
  const exportToExcel = () => {
    const headers = ['Date', 'Type', 'Amount (₦)', 'Category', 'Account', 'To Account', 'Note', 'Description'];
    
    const csvData = transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.type === 'income' ? 'Income' : transaction.type === 'expense' ? 'Expense' : 'Transfer',
      transaction.amount,
      transaction.category,
      transaction.account,
      transaction.toAccount || transaction.fromAccount || '',
      transaction.note || '',
      transaction.description || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
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
    
    accounts.forEach(account => {
      balances[account] = { balance: 0, transactions: [] };
    });
    
    transactions.forEach(transaction => {
      if (balances[transaction.account]) {
        if (transaction.type === 'income') {
          balances[transaction.account].balance += transaction.amount;
        } else if (transaction.type === 'expense') {
          balances[transaction.account].balance -= transaction.amount;
        }
        balances[transaction.account].transactions.push(transaction);
      }
    });
    
    Object.keys(balances).forEach(account => {
      balances[account].transactions.sort((a, b) => {
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison !== 0) return dateComparison;
        const aText = (a.note || (a.category === 'Transfer' ? `Transfer ${a.type === 'income' ? 'from' : 'to'} ${a.fromAccount || a.toAccount}` : a.category) || '').toLowerCase();
        const bText = (b.note || (b.category === 'Transfer' ? `Transfer ${b.type === 'income' ? 'from' : 'to'} ${b.fromAccount || b.toAccount}` : b.category) || '').toLowerCase();
        return bText.localeCompare(aText);
      });
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
    let filteredTransactions = transactions;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTransactions = transactions.filter(transaction => 
        transaction.note?.toLowerCase().includes(query) ||
        transaction.description?.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.account.toLowerCase().includes(query) ||
        transaction.toAccount?.toLowerCase().includes(query) ||
        transaction.fromAccount?.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query)
      );
    }
    
    return filteredTransactions.sort((a, b) => {
      const dateComparison = new Date(b.date) - new Date(a.date);
      if (dateComparison !== 0) return dateComparison;
      const aText = (a.note || (a.category === 'Transfer' ? `Transfer ${a.type === 'income' ? 'from' : 'to'} ${a.fromAccount || a.toAccount}` : a.category) || '').toLowerCase();
      const bText = (b.note || (b.category === 'Transfer' ? `Transfer ${b.type === 'income' ? 'from' : 'to'} ${b.fromAccount || b.toAccount}` : b.category) || '').toLowerCase();
      return bText.localeCompare(aText);
    });
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
      .filter(t => t.type === 'income' && t.category !== 'Transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses, transactions: currentMonthTransactions };
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const monthlyData = getMonthlyData();
    const incomeCategoryTotals = {};
    const expenseCategoryTotals = {};
    
    monthlyData.transactions.forEach(t => {
      if (t.category === 'Transfer') return;
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
      .filter(item => item.category !== "Carry Over")
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



  // Import Data
const fileInputRef = useRef(null);

const handleImportCSV = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csvContent = e.target.result;
      const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length < 1) {
        alert('Empty CSV file.');
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(header => header.replace(/^"|"$/g, '').trim());
      const expectedHeaders = ['Date', 'Type', 'Amount (₦)', 'Category', 'Account', 'To Account', 'Note', 'Description'];
      if (!expectedHeaders.every((h, i) => headers[i] === h)) {
        alert('Invalid CSV format. Expected headers: ' + expectedHeaders.join(', '));
        return;
      }

      // Parse rows
      const newTransactions = [];
      const newAccounts = new Set(accounts);
      const newIncomeCategories = new Set(incomeCategories);
      const newExpenseCategories = new Set(expenseCategories);

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim());
        if (row.length < headers.length) continue;

        const [date, type, amount, category, account, toAccount, note, description] = row;

        // Parse and validate date (MM/DD/YYYY format)
        const dateParts = date.split('/');
        if (dateParts.length !== 3) continue;
        const [month, day, year] = dateParts.map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (isNaN(parsedDate)) continue;
        const formattedDate = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Validate type
        if (!['Income', 'Expense', 'Transfer'].includes(type)) continue;

        // Validate amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) continue;

        // Add accounts and categories
        if (account) newAccounts.add(account);
        if (toAccount) newAccounts.add(toAccount);
        if (category && type === 'Income' && category !== 'Transfer') newIncomeCategories.add(category);
        if (category && type === 'Expense' && category !== 'Transfer') newExpenseCategories.add(category);

        // Create transaction object
        newTransactions.push({
          id: Date.now() + i, // Unique ID
          date: formattedDate,
          type: type === 'Income' ? 'income' : type === 'Expense' ? 'expense' : type.toLowerCase(),
          amount: parsedAmount,
          category: category || 'Transfer',
          account,
          toAccount: toAccount || '',
          fromAccount: type === 'Income' && category === 'Transfer' ? account : type === 'Transfer' ? toAccount : '',
          note: note || '',
          description: description || ''
        });
      }

      // Sort transactions
      const sortedTransactions = newTransactions.sort((a, b) => {
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison !== 0) return dateComparison;
        const aText = (a.note || (a.category === 'Transfer' ? `Transfer ${a.type === 'income' ? 'from' : 'to'} ${a.fromAccount || a.toAccount}` : a.category) || '').toLowerCase();
        const bText = (b.note || (b.category === 'Transfer' ? `Transfer ${b.type === 'income' ? 'from' : 'to'} ${b.fromAccount || b.toAccount}` : b.category) || '').toLowerCase();
        return aText.localeCompare(bText);
      });

      // Update state
      setAccounts([...newAccounts]);
      setIncomeCategories([...newIncomeCategories].filter(cat => cat !== 'Carry Over'));
      setExpenseCategories([...newExpenseCategories]);
      setTransactions(sortedTransactions);

      // Save to localStorage
      localStorage.setItem('accounts', JSON.stringify([...newAccounts]));
      localStorage.setItem('incomeCategories', JSON.stringify([...newIncomeCategories].filter(cat => cat !== 'Carry Over')));
      localStorage.setItem('expenseCategories', JSON.stringify([...newExpenseCategories]));
      localStorage.setItem('transactions', JSON.stringify(sortedTransactions));

      alert('CSV data imported successfully!');
    } catch (error) {
      alert('Error importing CSV. Please ensure the file is valid.');
      console.error('CSV import error:', error);
    }
    event.target.value = ''; // Reset file input
  };
  reader.readAsText(file);
};

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Financial Tracker</h1>
        <p className="opacity-90">Track your income, expenses, and transfers efficiently</p>
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
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingTransactionId(null);
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  category: '',
                  account: '',
                  toAccount: '',
                  note: '',
                  description: '',
                  type: 'expense'
                });
                setShowTransactionForm(true);
              }}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg mb-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Transaction
            </button>

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

            {showTransactionForm && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        e.preventDefault();
                        addOrUpdateTransaction();
                        }
                    }}      
              >
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto hide-scrollbar">
                  <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="income"
                            checked={formData.type === 'income'}
                            onChange={(e) => setFormData({...formData, type: e.target.value, category: '', toAccount: ''})}
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
                            onChange={(e) => setFormData({...formData, type: e.target.value, category: '', toAccount: ''})}
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
                            onChange={(e) => setFormData({...formData, type: e.target.value, category: 'Transfer', toAccount: ''})}
                            className="mr-2"
                          />
                          <span className="text-lg mr-1">↔</span>
                          Transfer
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

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

                    {formData.type !== 'transfer' && (
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
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.type === 'transfer' ? 'From Account' : 'Account'}
                      </label>
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

                    {formData.type === 'transfer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Account</label>
                        <select
                          value={formData.toAccount}
                          onChange={(e) => setFormData({...formData, toAccount: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select To Account</option>
                          {accounts.filter(acc => acc !== formData.account).map(account => (
                            <option key={account} value={account}>{account}</option>
                          ))}
                        </select>
                      </div>
                    )}

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

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTransactionForm(false);
                          setIsEditing(false);
                          setEditingTransactionId(null);
                          setFormData({
                            date: new Date().toISOString().split('T')[0],
                            amount: '',
                            category: '',
                            account: '',
                            toAccount: '',
                            note: '',
                            description: '',
                            type: 'expense'
                          });
                        }}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addOrUpdateTransaction}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {isEditing ? 'Update Transaction' : 'Add Transaction'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showDeleteAllConfirm && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600 mr-2" />
                    <h3 className="text-lg font-semibold text-red-600">Confirm Delete All Transactions</h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-center">
                    Are you sure you want to delete all transactions? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteAllConfirm(false)}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteAllTransactions}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                        {transaction.type === 'income' && transaction.category !== 'Transfer' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : transaction.type === 'expense' && transaction.category !== 'Transfer' ? (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : (
                        <span className="text-lg text-blue-600">↔</span>
                        )}
                        <div>
                        <p className="font-medium">
                            {transaction.category === 'Transfer'
                            ? (transaction.type === 'income'
                                ? `Transfer to ${transaction.account}`
                                : `Transfer from ${transaction.account}`)
                            : transaction.note || transaction.category}
                        </p>
                        {showDescriptions && transaction.description && (
                            <p className="text-sm text-gray-500 italic mt-1">{transaction.description}</p>
                        )}
                        <p className="text-sm text-gray-600">
                            {transaction.category} • {transaction.account} 
                            {transaction.category === 'Transfer' && ` → ${transaction.toAccount || transaction.fromAccount}`} 
                            • {new Date(transaction.date).toLocaleDateString('en-GB')}
                        </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <button
                        onClick={() => startEditing(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit transaction"
                        >
                        <Edit2 className="w-4 h-4" />
                        </button>
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
                                {transaction.type === 'income' && transaction.category !== 'Transfer' ? (
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                ) : transaction.type === 'expense' && transaction.category !== 'Transfer' ? (
                                <TrendingDown className="w-5 h-5 text-red-600" />
                                ) : (
                                <span className="text-lg text-blue-600">↔</span>
                                )}
                                <div>
                                <p className="font-medium">
                                    {transaction.category === 'Transfer'
                                    ? (transaction.type === 'income'
                                        ? `Transfer to ${transaction.account}`
                                        : `Transfer from ${transaction.account}`)
                                    : transaction.note || transaction.category}
                                </p>
                                {showDescriptions && transaction.description && (
                                    <p className="text-sm text-gray-500 italic mt-1">{transaction.description}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                    {transaction.category} • {transaction.account} 
                                    {transaction.category === 'Transfer' && ` → ${transaction.toAccount || transaction.fromAccount}`} 
                                    • {new Date(transaction.date).toLocaleDateString('en-GB')}
                                </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </div>
                                <button
                                onClick={() => startEditing(transaction)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit transaction"
                                >
                                <Edit2 className="w-4 h-4" />
                                </button>
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
            <div className="flex space-x-2">
                <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                <Download className="w-4 h-4 mr-2" />
                Export Data
                </button>
                <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
                </button>
                <input
                type="file"
                accept="text/csv"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImportCSV}
                />
            </div>
            </div>
            
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

            {(categoryBreakdown.incomeCategories.length > 0 || categoryBreakdown.expenseCategories.length > 0) && (
            <div className="space-y-6">
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

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Data Management</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Delete All Transactions</h4>
                  <p className="text-sm text-gray-600">Permanently remove all transaction history</p>
                </div>
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  disabled={transactions.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Transactions
                </button>
              </div>
            </div>
            
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

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-600">Accounts</h3>
              <div className="space-y-2">
                {accounts.map(account => (
                  <div key={account} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    {editingItem?.item === account && editingItem.type === 'account' ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={saveEditedItem}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditValue('');
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{account}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingItem(account, 'account')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit account"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAccount(account)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Income Categories</h3>
              <div className="space-y-2">
                {incomeCategories.map(category => (
                  <div key={category} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    {editingItem?.item === category && editingItem.type === 'income' ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={saveEditedItem}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditValue('');
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{category}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingItem(category, 'income')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category, 'income')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Expense Categories</h3>
              <div className="space-y-2">
                {expenseCategories.map(category => (
                  <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    {editingItem?.item === category && editingItem.type === 'expense' ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={saveEditedItem}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditValue('');
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{category}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingItem(category, 'expense')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category, 'expense')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
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