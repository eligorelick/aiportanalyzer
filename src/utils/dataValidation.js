// dataValidation.js - Validate portfolio data and flag suspicious values

export const dataValidation = {
  /**
   * Validate a single metric value
   */
  validateMetric(metricName, value, thresholds) {
    const warnings = [];
    const errors = [];

    if (value === null || value === undefined || isNaN(value)) {
      errors.push(`${metricName} is invalid or missing`);
      return { isValid: false, warnings, errors };
    }

    if (value === Infinity || value === -Infinity) {
      warnings.push(`${metricName} is infinite - this may indicate division by zero`);
    }

    // Check against thresholds
    if (thresholds) {
      if (thresholds.max !== undefined && value > thresholds.max) {
        warnings.push(`${metricName} (${value.toFixed(2)}) exceeds expected maximum (${thresholds.max})`);
      }
      if (thresholds.min !== undefined && value < thresholds.min) {
        warnings.push(`${metricName} (${value.toFixed(2)}) is below expected minimum (${thresholds.min})`);
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  },

  /**
   * Validate all portfolio metrics
   */
  validateMetrics(metrics) {
    const validationResults = {
      isValid: true,
      warnings: [],
      errors: [],
      flaggedMetrics: []
    };

    const metricThresholds = {
      alpha: { min: -1, max: 1 },        // Alpha beyond ±100% is suspicious
      sharpe: { min: -5, max: 10 },      // Extreme Sharpe ratios
      sortino: { min: -5, max: 10 },
      beta: { min: -2, max: 5 },         // Beta outside -2 to 5 is unusual
      maxDrawdown: { max: 0.99 },        // >99% drawdown means nearly total loss
      volatility: { min: 0, max: 2 },    // >200% annualized volatility is extreme
      infoRatio: { min: -5, max: 5 },
      treynor: { min: -1, max: 1 },
      calmar: { min: -10, max: 10 },
      omega: { min: 0, max: 100 },
      rSquared: { min: 0, max: 1 },
      winRate: { min: 0, max: 100 },
      profitFactor: { min: 0, max: 1000 }
    };

    // Validate each metric
    for (const [metricName, value] of Object.entries(metrics)) {
      if (metricThresholds[metricName]) {
        const result = this.validateMetric(metricName, value, metricThresholds[metricName]);

        if (!result.isValid) {
          validationResults.isValid = false;
          validationResults.errors.push(...result.errors);
          validationResults.flaggedMetrics.push(metricName);
        }

        if (result.warnings.length > 0) {
          validationResults.warnings.push(...result.warnings);
          validationResults.flaggedMetrics.push(metricName);
        }
      }
    }

    // Add specific metric relationship validations
    if (metrics.sharpe > 5) {
      validationResults.warnings.push('Sharpe ratio > 5 is exceptionally high - verify calculations');
    }

    if (metrics.maxDrawdown > 0.8) {
      validationResults.warnings.push('Maximum drawdown > 80% indicates severe losses');
    }

    if (metrics.volatility > 1) {
      validationResults.warnings.push('Volatility > 100% is extremely high - verify data quality');
    }

    if (Math.abs(metrics.alpha) > 0.5) {
      validationResults.warnings.push(`Alpha of ${(metrics.alpha * 100).toFixed(1)}% is unusually high`);
    }

    return validationResults;
  },

  /**
   * Check historical data completeness
   */
  validateHistoricalData(historicalData, expectedDays = 252) {
    const validation = {
      isComplete: true,
      warnings: [],
      errors: [],
      tickerStatus: {}
    };

    if (!historicalData || Object.keys(historicalData).length === 0) {
      validation.isComplete = false;
      validation.errors.push('No historical data available');
      return validation;
    }

    for (const [ticker, data] of Object.entries(historicalData)) {
      const dataPoints = data.length;
      const completeness = (dataPoints / expectedDays) * 100;

      validation.tickerStatus[ticker] = {
        dataPoints,
        expected: expectedDays,
        completeness: completeness.toFixed(1) + '%',
        isComplete: dataPoints >= expectedDays * 0.9 // Allow 10% missing data
      };

      if (dataPoints < expectedDays * 0.5) {
        validation.errors.push(`${ticker}: Only ${dataPoints}/${expectedDays} data points (${completeness.toFixed(0)}%) - insufficient data`);
        validation.isComplete = false;
      } else if (dataPoints < expectedDays * 0.9) {
        validation.warnings.push(`${ticker}: ${dataPoints}/${expectedDays} data points (${completeness.toFixed(0)}%) - calculations may be less accurate`);
      }
    }

    return validation;
  },

  /**
   * Validate position data
   */
  validatePosition(position) {
    const warnings = [];
    const errors = [];

    if (!position.ticker) {
      errors.push('Position missing ticker symbol');
    }

    if (position.shares <= 0) {
      errors.push(`${position.ticker}: Invalid shares amount (${position.shares})`);
    }

    if (position.costBasis <= 0) {
      warnings.push(`${position.ticker}: Cost basis is ${position.costBasis} - may be invalid`);
    }

    if (position.currentPrice <= 0) {
      errors.push(`${position.ticker}: Current price is ${position.currentPrice} - unable to calculate metrics`);
    }

    // Check for extreme price movements
    if (position.currentPrice > 0 && position.costBasis > 0) {
      const returnPct = ((position.currentPrice - position.costBasis) / position.costBasis) * 100;

      if (returnPct > 1000) {
        warnings.push(`${position.ticker}: Extreme gain of ${returnPct.toFixed(0)}% - verify prices`);
      } else if (returnPct < -99) {
        warnings.push(`${position.ticker}: Extreme loss of ${returnPct.toFixed(0)}% - verify prices`);
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  },

  /**
   * Validate all positions
   */
  validatePositions(positions) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      positionStatus: {}
    };

    if (!positions || positions.length === 0) {
      validation.isValid = false;
      validation.errors.push('No positions to validate');
      return validation;
    }

    positions.forEach(position => {
      const result = this.validatePosition(position);
      validation.positionStatus[position.ticker] = result;

      if (!result.isValid) {
        validation.isValid = false;
        validation.errors.push(...result.errors);
      }

      validation.warnings.push(...result.warnings);
    });

    return validation;
  },

  /**
   * Get severity level for a validation result
   */
  getSeverity(validation) {
    if (validation.errors && validation.errors.length > 0) {
      return 'error';
    }
    if (validation.warnings && validation.warnings.length > 0) {
      return 'warning';
    }
    return 'success';
  }
};
