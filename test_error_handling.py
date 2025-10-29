#!/usr/bin/env python3
"""
Test error handling and edge cases
"""

import os
from portfolio_analyzer import PortfolioAnalyzer


def test_invalid_numeric_inputs():
    """Test handling of invalid numeric inputs"""
    print("=" * 60)
    print("TEST: Invalid Numeric Inputs")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_errors.json')

    # Test invalid shares/cost (should be caught by validation)
    result = analyzer.add_ticker_manual('TEST1', 'abc', 'def')
    assert result == False, "Should reject non-numeric shares/cost"

    # Test None values (should be rejected by validation)
    result = analyzer.add_ticker_manual('TEST2', None, None)
    assert result == False, "Should reject None values"

    # Test very large numbers
    result = analyzer.add_ticker_manual('TEST3', 1e100, 1e100)
    assert result == True, "Should handle very large numbers"

    # Test very small numbers
    result = analyzer.add_ticker_manual('TEST4', 1e-100, 1e-100)
    assert result == True, "Should handle very small numbers"

    # Cleanup
    if os.path.exists('test_errors.json'):
        os.remove('test_errors.json')

    print("✓ Invalid numeric input tests passed\n")


def test_csv_error_scenarios():
    """Test various CSV error scenarios"""
    print("=" * 60)
    print("TEST: CSV Error Scenarios")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_csv_errors.json')

    # Empty CSV file
    with open('test_empty_file.csv', 'w') as f:
        f.write("")

    result = analyzer.import_from_csv('test_empty_file.csv')
    # Should handle gracefully

    # CSV with only headers
    with open('test_headers_only.csv', 'w') as f:
        f.write("ticker,shares,avg_cost\n")

    result = analyzer.import_from_csv('test_headers_only.csv')
    assert result == True, "Should handle CSV with only headers"

    # CSV with mixed valid and invalid data
    with open('test_mixed.csv', 'w') as f:
        f.write("ticker,shares,avg_cost\n")
        f.write("AAPL,100,150.50\n")
        f.write("INVALID,bad,data\n")
        f.write("GOOGL,50,2800\n")

    result = analyzer.import_from_csv('test_mixed.csv')
    assert result == True, "Should import valid rows and skip invalid"
    assert 'AAPL' in analyzer.tickers, "Should have imported AAPL"
    assert 'GOOGL' in analyzer.tickers, "Should have imported GOOGL"

    # Cleanup
    for f in ['test_empty_file.csv', 'test_headers_only.csv', 'test_mixed.csv', 'test_csv_errors.json']:
        if os.path.exists(f):
            os.remove(f)

    print("✓ CSV error scenario tests passed\n")


def test_file_operations():
    """Test file operation edge cases"""
    print("=" * 60)
    print("TEST: File Operations")
    print("=" * 60)

    # Test creating new file
    analyzer = PortfolioAnalyzer('new_test_file.json')
    analyzer.add_ticker_manual('AAPL')
    analyzer.save_data()
    assert os.path.exists('new_test_file.json'), "Should create new file"

    # Test loading and verifying data
    analyzer2 = PortfolioAnalyzer('new_test_file.json')
    assert 'AAPL' in analyzer2.tickers, "Should load data correctly"

    # Test overwriting data
    analyzer2.add_ticker_manual('GOOGL')
    analyzer2.save_data()

    analyzer3 = PortfolioAnalyzer('new_test_file.json')
    assert len(analyzer3.tickers) == 2, "Should have 2 tickers"

    # Cleanup
    if os.path.exists('new_test_file.json'):
        os.remove('new_test_file.json')

    print("✓ File operation tests passed\n")


def test_special_ticker_formats():
    """Test various ticker symbol formats"""
    print("=" * 60)
    print("TEST: Special Ticker Formats")
    print("=" * 60)

    analyzer = PortfolioAnalyzer('test_formats.json')

    # Test ticker with dot
    result = analyzer.add_ticker_manual('BRK.B')
    assert result == True, "Should accept ticker with dot"
    assert 'BRK.B' in analyzer.tickers, "Should store ticker with dot"

    # Test ticker with hyphen
    result = analyzer.add_ticker_manual('SPY-X')
    assert result == True, "Should accept ticker with hyphen"

    # Test ticker with numbers
    result = analyzer.add_ticker_manual('SHOP2')
    assert result == True, "Should accept ticker with numbers"

    # Test very short ticker
    result = analyzer.add_ticker_manual('A')
    assert result == True, "Should accept single letter ticker"

    # Test mixed case (should uppercase)
    result = analyzer.add_ticker_manual('TsLa')
    assert 'TSLA' in analyzer.tickers, "Should convert to uppercase"

    # Cleanup
    if os.path.exists('test_formats.json'):
        os.remove('test_formats.json')

    print("✓ Special ticker format tests passed\n")


def run_all_error_tests():
    """Run all error handling tests"""
    print("\n" + "=" * 60)
    print("RUNNING ERROR HANDLING TEST SUITE")
    print("=" * 60 + "\n")

    try:
        test_invalid_numeric_inputs()
        test_csv_error_scenarios()
        test_file_operations()
        test_special_ticker_formats()

        print("\n" + "=" * 60)
        print("ALL ERROR HANDLING TESTS PASSED ✓")
        print("=" * 60 + "\n")
        return True

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    import sys
    success = run_all_error_tests()
    sys.exit(0 if success else 1)
