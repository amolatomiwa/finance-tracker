import { Calendar, PieChart, TrendingUp, Settings } from "lucide-react"

export default function NavigationTab({ activeTab, onTransactions, onAccounts, onSummary, onSettings }) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
            <div className="flex">
              <button
                onClick={onTransactions}
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
                onClick={onAccounts}
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
                onClick={onSummary}
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
                onClick={onSettings}
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
    
  );
}
