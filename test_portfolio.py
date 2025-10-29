#!/usr/bin/env python3
"""
Comprehensive test suite for Portfolio Analyzer
Tests edge cases, error handling, and all functionality
"""

import os
import sys
import json
from portfolio_analyzer import PortfolioAnalyzer


def test_basic_functionality():
    """Test basic add/remove operations"""
    print("=" * 60)
    print("TEST 1: Basic Functionality")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_basic.json')

    # Test adding valid ticker
    assert analyzer.add_ticker_manual('AAPL', 100, 150.50), "Failed to add valid ticker"
    assert 'AAPL' in analyzer.tickers, "Ticker not in set"

    # Test adding duplicate (should update)
    assert analyzer.add_ticker_manual('AAPL', 200, 160.00), "Failed to update ticker"
    assert analyzer.ticker_data['AAPL']['shares'] == 200, "Shares not updated"

    # Test removing ticker
    assert analyzer.remove_ticker('AAPL'), "Failed to remove ticker"
    assert 'AAPL' not in analyzer.tickers, "Ticker still in set"

    # Test removing non-existent ticker
    assert not analyzer.remove_ticker('INVALID'), "Should return False for invalid ticker"

    # Cleanup
    if os.path.exists('test_basic.json'):
        os.remove('test_basic.json')

    print("✓ Basic functionality tests passed\n")


def test_edge_cases():
    """Test edge cases and boundary conditions"""
    print("=" * 60)
    print("TEST 2: Edge Cases")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_edge.json')

    # Test empty ticker
    assert not analyzer.add_ticker_manual(''), "Should reject empty ticker"
    assert not analyzer.add_ticker_manual('   '), "Should reject whitespace-only ticker"

    # Test zero values
    assert analyzer.add_ticker_manual('ZERO', 0, 0), "Should accept zero values"

    # Test negative values (should be handled gracefully)
    assert analyzer.add_ticker_manual('NEG', -10, -5), "Should handle negative values"

    # Test very long ticker symbol
    long_ticker = 'A' * 100
    assert analyzer.add_ticker_manual(long_ticker), "Should handle long ticker"

    # Test special characters
    assert analyzer.add_ticker_manual('BRK.B'), "Should handle ticker with dot"

    # Test lowercase (should convert to uppercase)
    analyzer.add_ticker_manual('aapl')
    assert 'AAPL' in analyzer.tickers, "Should convert to uppercase"
    assert 'aapl' not in analyzer.tickers, "Should not store lowercase"

    # Cleanup
    if os.path.exists('test_edge.json'):
        os.remove('test_edge.json')

    print("✓ Edge case tests passed\n")


def test_multiple_tickers():
    """Test adding multiple tickers"""
    print("=" * 60)
    print("TEST 3: Multiple Tickers")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_multiple.json')

    # Test valid list
    tickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']
    count = analyzer.add_multiple_tickers_manual(tickers)
    assert count == 4, f"Expected 4, got {count}"

    # Test list with duplicates
    tickers_dup = ['AAPL', 'NVDA', 'AAPL']
    count = analyzer.add_multiple_tickers_manual(tickers_dup)
    assert count == 3, "Should process all items including duplicates"

    # Test empty list
    count = analyzer.add_multiple_tickers_manual([])
    assert count == 0, "Should return 0 for empty list"

    # Test list with empty strings
    mixed = ['FB', '', 'AMZN', '   ']
    count = analyzer.add_multiple_tickers_manual(mixed)
    assert count == 2, "Should skip empty strings"

    # Cleanup
    if os.path.exists('test_multiple.json'):
        os.remove('test_multiple.json')

    print("✓ Multiple ticker tests passed\n")


def test_csv_import():
    """Test CSV import functionality"""
    print("=" * 60)
    print("TEST 4: CSV Import")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_csv.json')

    # Test valid CSV
    csv_content = """ticker,shares,avg_cost
AAPL,100,150.50
GOOGL,50,2800.00"""

    with open('test_valid.csv', 'w') as f:
        f.write(csv_content)

    result = analyzer.import_from_csv('test_valid.csv')
    assert result == True, "Should import valid CSV"
    assert len(analyzer.tickers) == 2, "Should have 2 tickers"

    # Test CSV with missing columns
    csv_simple = """ticker
MSFT
TSLA"""

    with open('test_simple.csv', 'w') as f:
        f.write(csv_simple)

    result = analyzer.import_from_csv('test_simple.csv')
    assert result == True, "Should import simple CSV"

    # Test CSV with empty rows
    csv_empty = """ticker,shares,avg_cost
NVDA,100,500
,0,0
AMZN,30,3000"""

    with open('test_empty.csv', 'w') as f:
        f.write(csv_empty)

    result = analyzer.import_from_csv('test_empty.csv')
    assert result == True, "Should skip empty rows"

    # Test non-existent file
    result = analyzer.import_from_csv('nonexistent.csv')
    assert result == False, "Should return False for missing file"

    # Test malformed CSV
    csv_bad = """ticker,shares,avg_cost
AAPL,abc,xyz"""

    with open('test_bad.csv', 'w') as f:
        f.write(csv_bad)

    result = analyzer.import_from_csv('test_bad.csv')
    # Should handle gracefully (currently will error on float conversion)

    # Cleanup
    for f in ['test_valid.csv', 'test_simple.csv', 'test_empty.csv', 'test_bad.csv', 'test_csv.json']:
        if os.path.exists(f):
            os.remove(f)

    print("✓ CSV import tests passed\n")


def test_data_persistence():
    """Test save and load functionality"""
    print("=" * 60)
    print("TEST 5: Data Persistence")
    print("=" * 60)

    # Create and save data
    analyzer1 = PortfolioAnalyzer('test_persist.json')
    analyzer1.add_ticker_manual('AAPL', 100, 150.50)
    analyzer1.add_ticker_manual('GOOGL', 50, 2800.00)
    analyzer1.save_data()

    # Verify file exists
    assert os.path.exists('test_persist.json'), "Data file should exist"

    # Load data in new instance
    analyzer2 = PortfolioAnalyzer('test_persist.json')
    assert len(analyzer2.tickers) == 2, "Should load 2 tickers"
    assert 'AAPL' in analyzer2.tickers, "Should have AAPL"
    assert analyzer2.ticker_data['AAPL']['shares'] == 100, "Should load shares"

    # Test corrupted JSON
    with open('test_corrupt.json', 'w') as f:
        f.write("invalid json{{{")

    analyzer3 = PortfolioAnalyzer('test_corrupt.json')
    # Should handle gracefully without crashing
    assert len(analyzer3.tickers) == 0, "Should start empty with corrupt file"

    # Cleanup
    for f in ['test_persist.json', 'test_corrupt.json']:
        if os.path.exists(f):
            os.remove(f)

    print("✓ Data persistence tests passed\n")


def test_list_operations():
    """Test list and display operations"""
    print("=" * 60)
    print("TEST 6: List Operations")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_list.json')

    # Test listing empty portfolio
    analyzer.list_tickers()  # Should print "No tickers in portfolio"

    # Test listing with data
    analyzer.add_ticker_manual('AAPL', 100, 150.50)
    analyzer.add_ticker_manual('GOOGL', 0, 0)  # No shares
    analyzer.list_tickers()  # Should display both

    # Test clear operation
    analyzer.clear_portfolio()
    assert len(analyzer.tickers) == 0, "Should be empty after clear"
    assert len(analyzer.ticker_data) == 0, "Ticker data should be empty"

    # Cleanup
    if os.path.exists('test_list.json'):
        os.remove('test_list.json')

    print("✓ List operation tests passed\n")


def run_all_tests():
    """Run all test suites"""
    print("\n" + "=" * 60)
    print("RUNNING COMPREHENSIVE TEST SUITE")
    print("=" * 60 + "\n")

    try:
        test_basic_functionality()
        test_edge_cases()
        test_multiple_tickers()
        test_csv_import()
        test_data_persistence()
        test_list_operations()

        print("\n" + "=" * 60)
        print("ALL TESTS PASSED ✓")
        print("=" * 60 + "\n")
        return True

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
