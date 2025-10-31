// assetClassification.js - Detect and classify different asset types

// Money market funds typically end in XX (like SWVXX, SPAXX, FDRXX, etc.)
const MONEY_MARKET_PATTERNS = [
  /XX$/,           // Ends with XX (SWVXX, SPAXX, FDRXX)
  /XXX$/,          // Ends with XXX
  /^VMFXX$/,       // Vanguard Federal Money Market
  /^VMMXX$/,       // Vanguard Prime Money Market
  /^VMRXX$/,       // Vanguard Municipal Money Market
  /^SPAXX$/,       // Fidelity Government Money Market
  /^FDRXX$/,       // Fidelity Government Cash Reserves
  /^FDLXX$/,       // Fidelity Treasury Money Market
];

const TREASURY_SYMBOLS = [
  '^TNX',          // 10-Year Treasury Note Yield
  '^FVX',          // 5-Year Treasury Yield
  '^TYX',          // 30-Year Treasury Yield
  '^IRX',          // 13-Week Treasury Bill
];

export const assetClassification = {
  /**
   * Check if a ticker is a money market fund
   */
  isMoneyMarketFund(ticker) {
    if (!ticker) return false;
    const upperTicker = ticker.toUpperCase();
    return MONEY_MARKET_PATTERNS.some(pattern => pattern.test(upperTicker));
  },

  /**
   * Check if a ticker is a treasury/bond instrument
   */
  isTreasuryInstrument(ticker) {
    if (!ticker) return false;
    return TREASURY_SYMBOLS.includes(ticker);
  },

  /**
   * Check if a ticker represents cash or cash-equivalent
   */
  isCashEquivalent(ticker) {
    return this.isMoneyMarketFund(ticker) || this.isTreasuryInstrument(ticker);
  },

  /**
   * Get the asset class for a ticker
   */
  getAssetClass(ticker, sector = null) {
    if (this.isMoneyMarketFund(ticker)) {
      return 'Money Market Fund';
    }

    if (this.isTreasuryInstrument(ticker)) {
      return 'Treasury';
    }

    // You can expand this with more classifications
    if (sector) {
      return sector;
    }

    return 'Equity';
  },

  /**
   * Determine if position should be included in volatility calculations
   */
  includeInVolatilityCalcs(ticker) {
    // Exclude money market funds and treasuries from volatility calculations
    return !this.isCashEquivalent(ticker);
  },

  /**
   * Determine if position should be included in beta calculations
   */
  includeInBetaCalcs(ticker) {
    // Only include equities in beta calculations
    return !this.isCashEquivalent(ticker);
  },

  /**
   * Get expected annual return for cash equivalents
   * This should ideally come from current yield data
   */
  getCashEquivalentReturn(ticker, riskFreeRate = 0.05) {
    if (this.isMoneyMarketFund(ticker)) {
      // Money market funds typically return close to the risk-free rate
      // Could be enhanced to fetch actual yield from fund data
      return riskFreeRate;
    }
    return 0;
  },

  /**
   * Separate positions into equity and cash
   */
  separatePositions(positions) {
    const equityPositions = [];
    const cashPositions = [];

    positions.forEach(pos => {
      if (this.isCashEquivalent(pos.ticker)) {
        cashPositions.push(pos);
      } else {
        equityPositions.push(pos);
      }
    });

    return { equityPositions, cashPositions };
  },

  /**
   * Get sector label for display
   */
  getSectorLabel(ticker, sector) {
    if (this.isMoneyMarketFund(ticker)) {
      return 'Cash & Money Market';
    }

    if (this.isTreasuryInstrument(ticker)) {
      return 'Fixed Income';
    }

    return sector || 'Unknown';
  }
};
