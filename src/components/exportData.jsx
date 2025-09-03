// You'll need to install SheetJS: npm install xlsx
// import * as XLSX from 'xlsx';
import { utils, writeFile } from 'xlsx';

const exportData = () => {
  // Create a new workbook
  const workbook = utils.book_new();
  
  // Create worksheets for each data type
  
  // 1. Transactions worksheet
  if (transactions && transactions.length > 0) {
    const transactionsWS = utils.json_to_sheet(transactions);
    utils.book_append_sheet(workbook, transactionsWS, 'Transactions');
  }
  
  // 2. Income Categories worksheet
  if (incomeCategories && incomeCategories.length > 0) {
    const incomeCategoriesWS = utils.json_to_sheet(incomeCategories);
    utils.book_append_sheet(workbook, incomeCategoriesWS, 'Income Categories');
  }
  
  // 3. Expense Categories worksheet
  if (expenseCategories && expenseCategories.length > 0) {
    const expenseCategoriesWS = utils.json_to_sheet(expenseCategories);
    utils.book_append_sheet(workbook, expenseCategoriesWS, 'Expense Categories');
  }
  
  // 4. Accounts worksheet
  if (accounts && accounts.length > 0) {
    const accountsWS = utils.json_to_sheet(accounts);
    utils.book_append_sheet(workbook, accountsWS, 'Accounts');
  }
  
  // 5. Export Info worksheet
  const exportInfo = [{
    'Export Date': new Date().toISOString(),
    'Export Time': new Date().toLocaleString(),
    'Total Transactions': transactions?.length || 0,
    'Total Income Categories': incomeCategories?.length || 0,
    'Total Expense Categories': expenseCategories?.length || 0,
    'Total Accounts': accounts?.length || 0
  }];
  const exportInfoWS = utils.json_to_sheet(exportInfo);
  utils.book_append_sheet(workbook, exportInfoWS, 'Export Info');
  
  // Generate filename with current date
  const exportFileDefaultName = `financial-data-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Write and download the file
  writeFile(workbook, exportFileDefaultName);
};

// // Alternative version if you prefer to create one consolidated sheet
// const exportDataConsolidated = () => {
//   const workbook = XLSX.utils.book_new();
  
//   // Create a summary sheet with all data
//   const consolidatedData = [];
  
//   // Add export metadata
//   consolidatedData.push({
//     Type: 'Export Info',
//     Date: new Date().toISOString(),
//     'Total Records': (transactions?.length || 0) + (incomeCategories?.length || 0) + 
//                     (expenseCategories?.length || 0) + (accounts?.length || 0)
//   });
  
//   consolidatedData.push({}); // Empty row for spacing
  
//   // Add transactions
//   if (transactions?.length > 0) {
//     consolidatedData.push({ Type: 'TRANSACTIONS', Date: '', 'Total Records': '' });
//     transactions.forEach(transaction => {
//       consolidatedData.push({
//         Type: 'Transaction',
//         ...transaction
//       });
//     });
//     consolidatedData.push({}); // Empty row
//   }
  
//   // Add income categories
//   if (incomeCategories?.length > 0) {
//     consolidatedData.push({ Type: 'INCOME CATEGORIES', Date: '', 'Total Records': '' });
//     incomeCategories.forEach(category => {
//       consolidatedData.push({
//         Type: 'Income Category',
//         ...category
//       });
//     });
//     consolidatedData.push({}); // Empty row
//   }
  
//   // Add expense categories
//   if (expenseCategories?.length > 0) {
//     consolidatedData.push({ Type: 'EXPENSE CATEGORIES', Date: '', 'Total Records': '' });
//     expenseCategories.forEach(category => {
//       consolidatedData.push({
//         Type: 'Expense Category',
//         ...category
//       });
//     });
//     consolidatedData.push({}); // Empty row
//   }
  
//   // Add accounts
//   if (accounts?.length > 0) {
//     consolidatedData.push({ Type: 'ACCOUNTS', Date: '', 'Total Records': '' });
//     accounts.forEach(account => {
//       consolidatedData.push({
//         Type: 'Account',
//         ...account
//       });
//     });
//   }
  
//   const worksheet = XLSX.utils.json_to_sheet(consolidatedData);
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Data');
  
//   const exportFileDefaultName = `financial-data-consolidated-${new Date().toISOString().split('T')[0]}.xlsx`;
//   XLSX.writeFile(workbook, exportFileDefaultName);
// };

export default exportData;