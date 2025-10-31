// ManualInput.jsx - Component for manually inputting portfolio positions
import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

export default function ManualInput({ onDataLoaded }) {
  const [positions, setPositions] = useState([{ ticker: '', shares: '', costBasis: '' }]);
  const [error, setError] = useState(null);

  const handleAddPosition = () => {
    setPositions([...positions, { ticker: '', shares: '', costBasis: '' }]);
  };

  const handleRemovePosition = (index) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const newPositions = [...positions];
    newPositions[index][field] = value;
    setPositions(newPositions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate and transform the data
      const transformedPositions = positions
        .filter(pos => pos.ticker && pos.shares && pos.costBasis) // Remove empty rows
        .map((pos, index) => {
          const shares = parseFloat(pos.shares);
          const costBasis = parseFloat(pos.costBasis);

          if (isNaN(shares) || isNaN(costBasis)) {
            throw new Error(`Invalid number format in row ${index + 1}`);
          }

          return {
            ticker: pos.ticker.toUpperCase(),
            shares,
            costBasis,
            value: shares * costBasis, // Initial value based on cost basis
          };
        });

      if (transformedPositions.length === 0) {
        throw new Error('Please enter at least one valid position');
      }

      onDataLoaded(transformedPositions);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {positions.map((position, index) => (
          <div key={index} className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Ticker"
              value={position.ticker}
              onChange={(e) => handleInputChange(index, 'ticker', e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Shares"
              value={position.shares}
              onChange={(e) => handleInputChange(index, 'shares', e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Cost Basis"
              value={position.costBasis}
              onChange={(e) => handleInputChange(index, 'costBasis', e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemovePosition(index)}
              className="p-2 text-red-500 hover:text-red-700"
              title="Remove position"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddPosition}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <Plus size={20} />
            Add Position
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
          >
            <Save size={20} />
            Save Portfolio
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}