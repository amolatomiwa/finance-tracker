import { AlertTriangle } from "lucide-react";

export default function DeleteAllConfirm({ onCancel, onDeleteAll }) {
  return (
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
                onClick={onCancel}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                Cancel
            </button>
            <button
                onClick={onDeleteAll}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
                Delete All
            </button>
            </div>
        </div>
        </div>
  );
}
