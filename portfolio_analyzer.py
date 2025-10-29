#!/usr/bin/env python3
"""
AI Portfolio Analyzer - Stock Ticker Management
Supports both manual ticker entry and CSV file import
"""

import csv
import json
import os
from typing import List, Dict, Set
from datetime import datetime


class PortfolioAnalyzer:
    """Main class for managing stock tickers in a portfolio"""

    def __init__(self, data_file: str = "portfolio_data.json"):
        self.data_file = data_file
        self.tickers: Set[str] = set()
        self.ticker_data: Dict[str, Dict] = {}
        self.load_data()

    def load_data(self):
        """Load existing ticker data from file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.tickers = set(data.get('tickers', []))
                    self.ticker_data = data.get('ticker_data', {})
                print(f"Loaded {len(self.tickers)} tickers from {self.data_file}")
            except Exception as e:
                print(f"Error loading data: {e}")

    def save_data(self):
        """Save ticker data to file"""
        try:
            data = {
                'tickers': list(self.tickers),
                'ticker_data': self.ticker_data,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Saved {len(self.tickers)} tickers to {self.data_file}")
        except Exception as e:
            print(f"Error saving data: {e}")

    def add_ticker_manual(self, ticker: str, shares: float = 0, avg_cost: float = 0):
        """
        Add a single ticker manually

        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL')
            shares: Number of shares owned (optional)
            avg_cost: Average cost per share (optional)
        """
        ticker = ticker.upper().strip()

        if not ticker:
            print("Error: Ticker symbol cannot be empty")
            return False

        if ticker in self.tickers:
            print(f"Ticker {ticker} already exists. Updating data...")

        self.tickers.add(ticker)
        self.ticker_data[ticker] = {
            'shares': shares,
            'avg_cost': avg_cost,
            'added_date': datetime.now().isoformat()
        }

        print(f"Added ticker: {ticker}")
        if shares > 0:
            print(f"  Shares: {shares}")
            print(f"  Average Cost: ${avg_cost:.2f}")

        return True

    def add_multiple_tickers_manual(self, tickers: List[str]):
        """
        Add multiple tickers at once (symbols only)

        Args:
            tickers: List of ticker symbols
        """
        added = 0
        for ticker in tickers:
            if self.add_ticker_manual(ticker):
                added += 1

        print(f"\nSuccessfully added {added} out of {len(tickers)} tickers")
        return added

    def import_from_csv(self, csv_file: str):
        """
        Import tickers from a CSV file
        Expected format: ticker,shares,avg_cost
        or just: ticker

        Args:
            csv_file: Path to CSV file
        """
        if not os.path.exists(csv_file):
            print(f"Error: File {csv_file} not found")
            return False

        try:
            added = 0
            with open(csv_file, 'r') as f:
                reader = csv.DictReader(f)

                # Handle different CSV formats
                for row in reader:
                    ticker = row.get('ticker', '').strip()

                    if not ticker:
                        continue

                    shares = float(row.get('shares', 0) or 0)
                    avg_cost = float(row.get('avg_cost', 0) or 0)

                    if self.add_ticker_manual(ticker, shares, avg_cost):
                        added += 1

            print(f"\nImported {added} tickers from {csv_file}")
            return True

        except Exception as e:
            print(f"Error importing CSV: {e}")
            return False

    def remove_ticker(self, ticker: str):
        """Remove a ticker from the portfolio"""
        ticker = ticker.upper().strip()

        if ticker in self.tickers:
            self.tickers.remove(ticker)
            self.ticker_data.pop(ticker, None)
            print(f"Removed ticker: {ticker}")
            return True
        else:
            print(f"Ticker {ticker} not found in portfolio")
            return False

    def list_tickers(self):
        """Display all tickers in the portfolio"""
        if not self.tickers:
            print("No tickers in portfolio")
            return

        print(f"\n{'='*60}")
        print(f"Portfolio contains {len(self.tickers)} tickers:")
        print(f"{'='*60}")

        for ticker in sorted(self.tickers):
            data = self.ticker_data.get(ticker, {})
            shares = data.get('shares', 0)
            avg_cost = data.get('avg_cost', 0)

            print(f"\n{ticker}")
            if shares > 0:
                print(f"  Shares: {shares}")
                print(f"  Avg Cost: ${avg_cost:.2f}")
                print(f"  Total Value: ${shares * avg_cost:.2f}")

        print(f"\n{'='*60}")

    def clear_portfolio(self):
        """Clear all tickers from the portfolio"""
        self.tickers.clear()
        self.ticker_data.clear()
        print("Portfolio cleared")


def main():
    """Main interactive menu"""
    analyzer = PortfolioAnalyzer()

    while True:
        print("\n" + "="*60)
        print("AI Portfolio Analyzer")
        print("="*60)
        print("1. Add single ticker manually")
        print("2. Add multiple tickers manually")
        print("3. Import tickers from CSV file")
        print("4. List all tickers")
        print("5. Remove a ticker")
        print("6. Clear portfolio")
        print("7. Save and exit")
        print("="*60)

        choice = input("\nEnter your choice (1-7): ").strip()

        if choice == '1':
            ticker = input("Enter ticker symbol: ").strip()
            shares_input = input("Enter number of shares (optional, press Enter to skip): ").strip()
            cost_input = input("Enter average cost per share (optional, press Enter to skip): ").strip()

            shares = float(shares_input) if shares_input else 0
            avg_cost = float(cost_input) if cost_input else 0

            analyzer.add_ticker_manual(ticker, shares, avg_cost)
            analyzer.save_data()

        elif choice == '2':
            print("Enter ticker symbols separated by commas or spaces:")
            tickers_input = input("> ").strip()

            # Split by comma or space
            tickers = [t.strip() for t in tickers_input.replace(',', ' ').split() if t.strip()]

            analyzer.add_multiple_tickers_manual(tickers)
            analyzer.save_data()

        elif choice == '3':
            csv_file = input("Enter CSV file path: ").strip()
            analyzer.import_from_csv(csv_file)
            analyzer.save_data()

        elif choice == '4':
            analyzer.list_tickers()

        elif choice == '5':
            ticker = input("Enter ticker symbol to remove: ").strip()
            analyzer.remove_ticker(ticker)
            analyzer.save_data()

        elif choice == '6':
            confirm = input("Are you sure you want to clear all tickers? (yes/no): ").strip().lower()
            if confirm == 'yes':
                analyzer.clear_portfolio()
                analyzer.save_data()

        elif choice == '7':
            analyzer.save_data()
            print("Data saved. Goodbye!")
            break

        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
