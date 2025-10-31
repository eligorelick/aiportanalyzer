// PositionsTable.jsx - Sortable table displaying all portfolio positions
import { useState } from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

export default function PositionsTable({ positions }) {
  const [sortField, setSortField] = useState('weight');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPositions = [...positions].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'ticker':
        aVal = a.ticker;
        bVal = b.ticker;
        break;
      case 'shares':
        aVal = a.shares;
        bVal = b.shares;
        break;
      case 'costBasis':
        aVal = a.costBasis;
        bVal = b.costBasis;
        break;
      case 'currentPrice':
        aVal = a.currentPrice;
        bVal = b.currentPrice;
        break;
      case 'marketValue':
        aVal = a.marketValue;
        bVal = b.marketValue;
        break;
      case 'totalGainLoss':
        aVal = a.totalGainLoss;
        bVal = b.totalGainLoss;
        break;
      case 'totalGainLossPercent':
        aVal = a.totalGainLossPercent;
        bVal = b.totalGainLossPercent;
        break;
      case 'dayChangePercent':
        aVal = a.dayChangePercent;
        bVal = b.dayChangePercent;
        break;
      case 'weight':
        aVal = a.weight || 0;
        bVal = b.weight || 0;
        break;
      default:
        aVal = a[sortField];
        bVal = b[sortField];
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Holdings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th 
                className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ticker')}
              >
                Ticker <SortIcon field="ticker" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shares')}
              >
                Shares <SortIcon field="shares" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('costBasis')}
              >
                Cost Basis <SortIcon field="costBasis" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('currentPrice')}
              >
                Current Price <SortIcon field="currentPrice" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('marketValue')}
              >
                Market Value <SortIcon field="marketValue" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalGainLoss')}
              >
                Gain/Loss <SortIcon field="totalGainLoss" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalGainLossPercent')}
              >
                Return % <SortIcon field="totalGainLossPercent" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dayChangePercent')}
              >
                Day Change <SortIcon field="dayChangePercent" />
              </th>
              <th 
                className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('weight')}
              >
                Weight <SortIcon field="weight" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions.map((pos, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold text-blue-600">{pos.ticker}</td>
                <td className="p-3 text-right">{pos.shares}</td>
                <td className="p-3 text-right">{formatCurrency(pos.costBasis)}</td>
                <td className="p-3 text-right">{formatCurrency(pos.currentPrice)}</td>
                <td className="p-3 text-right font-semibold">
                  {formatCurrency(pos.marketValue)}
                </td>
                <td className={`p-3 text-right font-medium ${
                  pos.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(pos.totalGainLoss))}
                </td>
                <td className={`p-3 text-right font-medium ${
                  pos.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(pos.totalGainLossPercent)}
                </td>
                <td className={`p-3 text-right ${
                  pos.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className="flex items-center justify-end">
                    {pos.dayChangePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {formatPercent(pos.dayChangePercent)}
                  </div>
                </td>
                <td className="p-3 text-right">{(pos.weight || 0).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 font-bold">
            <tr>
              <td className="p-3" colSpan="4">Total</td>
              <td className="p-3 text-right">
                {formatCurrency(positions.reduce((sum, p) => sum + p.marketValue, 0))}
              </td>
              <td className={`p-3 text-right ${
                positions.reduce((sum, p) => sum + p.totalGainLoss, 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(positions.reduce((sum, p) => sum + p.totalGainLoss, 0)))}
              </td>
              <td className="p-3"></td>
              <td className="p-3"></td>
              <td className="p-3 text-right">100.00%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
