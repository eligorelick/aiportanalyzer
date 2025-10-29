# AI Portfolio Analyzer

A simple and efficient tool for managing stock portfolio tickers with support for both manual entry and CSV import.

## Features

- **Manual Ticker Entry**: Add tickers one at a time or multiple at once
- **CSV Import**: Import tickers from CSV files
- **Portfolio Management**: View, add, and remove tickers
- **Data Persistence**: Automatically saves your portfolio data
- **Flexible Input**: Support for ticker symbols only or with shares and cost basis

## Installation

No external dependencies required! Uses Python 3.6+ standard library only.

```bash
# Clone the repository
git clone <repository-url>
cd aiportanalyzer

# Run the application
python3 portfolio_analyzer.py
```

## Usage

### Interactive Menu

Run the main application to access the interactive menu:

```bash
python3 portfolio_analyzer.py
```

The menu provides the following options:

1. **Add single ticker manually** - Enter one ticker with optional shares and cost
2. **Add multiple tickers manually** - Enter multiple tickers separated by commas or spaces
3. **Import tickers from CSV file** - Import from a CSV file
4. **List all tickers** - Display all tickers in your portfolio
5. **Remove a ticker** - Remove a specific ticker
6. **Clear portfolio** - Remove all tickers
7. **Save and exit** - Save your changes and exit

### Manual Entry Examples

**Single ticker with details:**
```
Enter ticker symbol: AAPL
Enter number of shares: 100
Enter average cost per share: 150.50
```

**Multiple tickers (symbols only):**
```
Enter ticker symbols separated by commas or spaces:
> AAPL, GOOGL, MSFT, TSLA
```

or

```
> AAPL GOOGL MSFT TSLA
```

### CSV Import Format

Create a CSV file with the following format:

**Option 1: With shares and cost data**
```csv
ticker,shares,avg_cost
AAPL,100,150.50
GOOGL,50,2800.00
MSFT,75,300.25
```

**Option 2: Ticker symbols only**
```csv
ticker
AAPL
GOOGL
MSFT
```

A sample CSV file (`sample_portfolio.csv`) is included in the repository.

### Programmatic Usage

You can also use the `PortfolioAnalyzer` class in your own Python scripts:

```python
from portfolio_analyzer import PortfolioAnalyzer

# Create analyzer instance
analyzer = PortfolioAnalyzer()

# Add single ticker
analyzer.add_ticker_manual("AAPL", shares=100, avg_cost=150.50)

# Add multiple tickers
analyzer.add_multiple_tickers_manual(["GOOGL", "MSFT", "TSLA"])

# Import from CSV
analyzer.import_from_csv("my_portfolio.csv")

# List all tickers
analyzer.list_tickers()

# Save data
analyzer.save_data()
```

## Data Storage

Portfolio data is automatically saved to `portfolio_data.json` in the current directory. This file contains:
- List of all ticker symbols
- Share quantities and average cost for each ticker
- Timestamp of when each ticker was added
- Last update timestamp

## Future Enhancements

Potential features for future releases:
- Real-time stock price fetching
- Portfolio value tracking and visualization
- Performance analytics and reporting
- Integration with brokerage APIs
- Export to various formats (Excel, PDF)

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.