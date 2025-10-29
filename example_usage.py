#!/usr/bin/env python3
"""
Example usage of the Portfolio Analyzer
Demonstrates various ways to use the API programmatically
"""

from portfolio_analyzer import PortfolioAnalyzer


def example_manual_entry():
    """Example: Adding tickers manually"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Manual Ticker Entry")
    print("="*60)

    analyzer = PortfolioAnalyzer('example_portfolio.json')

    # Add single ticker with full details
    analyzer.add_ticker_manual('AAPL', shares=100, avg_cost=150.50)

    # Add ticker without position details
    analyzer.add_ticker_manual('GOOGL')

    # Add multiple tickers at once
    watchlist = ['MSFT', 'TSLA', 'NVDA', 'AMZN']
    analyzer.add_multiple_tickers_manual(watchlist)

    analyzer.list_tickers()
    analyzer.save_data()


def example_csv_import():
    """Example: Importing from CSV"""
    print("\n" + "="*60)
    print("EXAMPLE 2: CSV Import")
    print("="*60)

    analyzer = PortfolioAnalyzer('example_portfolio.json')

    # Import from the sample CSV file
    analyzer.import_from_csv('sample_portfolio.csv')

    analyzer.list_tickers()
    analyzer.save_data()


def example_portfolio_management():
    """Example: Managing portfolio"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Portfolio Management")
    print("="*60)

    analyzer = PortfolioAnalyzer('example_portfolio.json')

    # Add some tickers
    analyzer.add_ticker_manual('AAPL', 100, 150.00)
    analyzer.add_ticker_manual('GOOGL', 50, 2800.00)
    analyzer.add_ticker_manual('MSFT', 75, 300.00)

    print("\nInitial portfolio:")
    analyzer.list_tickers()

    # Remove a ticker
    print("\nRemoving MSFT...")
    analyzer.remove_ticker('MSFT')

    print("\nUpdated portfolio:")
    analyzer.list_tickers()

    # Update existing ticker
    print("\nUpdating AAPL position...")
    analyzer.add_ticker_manual('AAPL', 150, 155.00)

    print("\nFinal portfolio:")
    analyzer.list_tickers()

    analyzer.save_data()


def example_building_watchlist():
    """Example: Building a stock watchlist"""
    print("\n" + "="*60)
    print("EXAMPLE 4: Building a Watchlist")
    print("="*60)

    analyzer = PortfolioAnalyzer('watchlist.json')

    # Tech stocks
    tech_stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA']
    print("Adding tech stocks...")
    analyzer.add_multiple_tickers_manual(tech_stocks)

    # Financial stocks
    financial_stocks = ['JPM', 'BAC', 'WFC', 'GS', 'MS']
    print("\nAdding financial stocks...")
    analyzer.add_multiple_tickers_manual(financial_stocks)

    # Healthcare stocks
    healthcare_stocks = ['JNJ', 'UNH', 'PFE', 'ABBV']
    print("\nAdding healthcare stocks...")
    analyzer.add_multiple_tickers_manual(healthcare_stocks)

    print("\nComplete watchlist:")
    analyzer.list_tickers()

    analyzer.save_data()


def example_mixed_approach():
    """Example: Combining manual entry and CSV import"""
    print("\n" + "="*60)
    print("EXAMPLE 5: Mixed Approach")
    print("="*60)

    analyzer = PortfolioAnalyzer('mixed_portfolio.json')

    # Import core holdings from CSV
    print("Importing core holdings from CSV...")
    analyzer.import_from_csv('sample_portfolio.csv')

    # Add additional positions manually
    print("\nAdding additional positions manually...")
    analyzer.add_ticker_manual('NVDA', 25, 500.00)
    analyzer.add_ticker_manual('AMD', 50, 120.00)

    # Add watchlist items (no positions)
    print("\nAdding watchlist items...")
    analyzer.add_multiple_tickers_manual(['COIN', 'SHOP', 'SQ'])

    print("\nComplete portfolio:")
    analyzer.list_tickers()

    analyzer.save_data()


def cleanup_examples():
    """Clean up example files"""
    import os
    files = ['example_portfolio.json', 'watchlist.json', 'mixed_portfolio.json']
    for f in files:
        if os.path.exists(f):
            os.remove(f)
            print(f"Cleaned up {f}")


def main():
    """Run all examples"""
    print("\n" + "="*60)
    print("PORTFOLIO ANALYZER - USAGE EXAMPLES")
    print("="*60)

    # Run examples
    example_manual_entry()
    example_csv_import()
    example_portfolio_management()
    example_building_watchlist()
    example_mixed_approach()

    # Cleanup
    print("\n" + "="*60)
    print("CLEANUP")
    print("="*60)
    cleanup_examples()

    print("\n" + "="*60)
    print("EXAMPLES COMPLETE")
    print("="*60)
    print("\nTo run the interactive menu, use:")
    print("  python3 portfolio_analyzer.py")
    print()


if __name__ == "__main__":
    main()
