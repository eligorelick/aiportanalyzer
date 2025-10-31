// FileUpload.jsx - Component for uploading CSV files or manually inputting portfolio data
import { useState } from 'react';
import { Upload, FileText, AlertCircle, Edit3 } from 'lucide-react';
import Papa from 'papaparse';
import ManualInput from './ManualInput';

export default function FileUpload({ onDataLoaded }) {
  const [inputMethod, setInputMethod] = useState('csv'); // 'csv' or 'manual'
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          validateAndLoadData(results.data);
        } catch (err) {
          setError(err.message);
        }
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  const validateAndLoadData = (data) => {
    if (data.length === 0) {
      throw new Error('CSV file is empty');
    }

    const firstRow = data[0];

    // Helper function to get field value with multiple possible names
    const getField = (row, ...possibleNames) => {
      for (const name of possibleNames) {
        if (name in row) {
          return row[name];
        }
      }
      return null;
    };

    // Check if required fields exist (with variations)
    const hasTicker = getField(firstRow, 'Ticker', 'Symbol', 'ticker', 'symbol') !== null;
    const hasShares = getField(firstRow, 'Shares', 'shares', 'Quantity', 'quantity') !== null;
    const hasCostBasis = getField(firstRow, 'Cost_Basis', 'AC/Share', 'Cost Basis', 'Average Cost', 'cost_basis', 'avg_cost') !== null;

    if (!hasTicker || !hasShares || !hasCostBasis) {
      const missing = [];
      if (!hasTicker) missing.push('Ticker/Symbol');
      if (!hasShares) missing.push('Shares');
      if (!hasCostBasis) missing.push('Cost_Basis/AC/Share');
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Transform data to internal format
    const positions = data.map((row, index) => {
      const tickerValue = getField(row, 'Ticker', 'Symbol', 'ticker', 'symbol');
      const sharesValue = getField(row, 'Shares', 'shares', 'Quantity', 'quantity');
      const costBasisValue = getField(row, 'Cost_Basis', 'AC/Share', 'Cost Basis', 'Average Cost', 'cost_basis', 'avg_cost');

      const shares = parseFloat(sharesValue);
      const costBasis = parseFloat(costBasisValue);

      if (isNaN(shares) || isNaN(costBasis)) {
        throw new Error(`Invalid number format in row ${index + 1}`);
      }

      return {
        ticker: tickerValue.toUpperCase().trim(),
        shares: shares,
        costBasis: costBasis,
        purchaseDate: getField(row, 'Purchase_Date', 'Date', 'purchase_date') || new Date().toISOString().split('T')[0],
        assetType: getField(row, 'Asset_Type', 'Type', 'asset_type') || 'Stock',
        currentPrice: 0,
        marketValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        beta: 1,
        marketCap: 0,
        dividendYield: 0,
        sector: 'Unknown'
      };
    });

    // Show preview
    setPreview(positions);
    setError(null);
  };

  const confirmLoad = () => {
    onDataLoaded(preview);
    setPreview(null);
  };

  const cancelPreview = () => {
    setPreview(null);
    setError(null);
  };

  if (preview) {
    return (
      <div className="card max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Preview Data</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Ticker</th>
                <th className="p-2 text-right">Shares</th>
                <th className="p-2 text-right">Cost Basis</th>
                <th className="p-2 text-left">Purchase Date</th>
                <th className="p-2 text-left">Asset Type</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((pos, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2 font-bold">{pos.ticker}</td>
                  <td className="p-2 text-right">{pos.shares}</td>
                  <td className="p-2 text-right">${pos.costBasis.toFixed(2)}</td>
                  <td className="p-2">{pos.purchaseDate}</td>
                  <td className="p-2">{pos.assetType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <button onClick={confirmLoad} className="btn-primary">
            Confirm & Load Portfolio
          </button>
          <button onClick={cancelPreview} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            inputMethod === 'csv'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => setInputMethod('csv')}
        >
          <FileText size={20} />
          CSV Upload
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            inputMethod === 'manual'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => setInputMethod('manual')}
        >
          <Edit3 size={20} />
          Manual Input
        </button>
      </div>

      {inputMethod === 'manual' ? (
        <ManualInput onDataLoaded={onDataLoaded} />
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
        <div className="text-center py-12">
          <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upload Portfolio Data</h2>
          <p className="text-gray-600 mb-6">
            Drag and drop your CSV file here, or click to browse
          </p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">
            Select CSV File
          </label>

          <div className="mt-8 text-left bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">CSV Format Requirements:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Ticker/Symbol</strong> - Stock symbol (e.g., NVDA, AAPL)</li>
                  <li>• <strong>Shares</strong> - Number of shares owned</li>
                  <li>• <strong>Cost_Basis/AC/Share</strong> - Average purchase price per share</li>
                  <li>• <strong>Purchase_Date</strong> (Optional) - Date in YYYY-MM-DD format</li>
                  <li>• <strong>Asset_Type</strong> (Optional) - Stock, ETF, Futures, etc.</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Accepts common variations of field names (e.g., Symbol, AC/Share, Average Cost)
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
