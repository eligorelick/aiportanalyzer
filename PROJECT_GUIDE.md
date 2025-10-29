# Portfolio Analytics Dashboard - Complete Project

## 🎉 What We Built

A **professional-grade portfolio analytics dashboard** featuring:

### Core Features
✅ **Real-time price updates** from Yahoo Finance API
✅ **27+ portfolio metrics** (Sharpe Ratio, Beta, Alpha, Volatility, etc.)
✅ **AI-powered insights** using Claude API
✅ **Interactive charts** (position allocation, sector breakdown, risk metrics)
✅ **CSV import/export** for easy data management
✅ **Local data storage** - everything stays in your browser
✅ **Auto-refresh** with configurable intervals
✅ **Beautiful, responsive UI** with Tailwind CSS

## 📦 Project Structure

```
portfolio-dashboard/
├── src/
│   ├── components/           # React components
│   │   ├── Dashboard.jsx     # Main container (orchestrates everything)
│   │   ├── FileUpload.jsx    # CSV drag-and-drop upload
│   │   ├── PortfolioOverview.jsx  # Summary cards at top
│   │   ├── ChartsSection.jsx      # All visualizations
│   │   ├── PositionsTable.jsx     # Sortable holdings table
│   │   ├── AIInsights.jsx         # AI-generated insights display
│   │   └── SettingsModal.jsx      # Settings configuration
│   │
│   ├── utils/                # Utility functions
│   │   ├── calculations.js   # All portfolio metric calculations
│   │   ├── dataFetcher.js    # Yahoo Finance API integration
│   │   ├── aiService.js      # Claude API integration
│   │   └── storage.js        # localStorage management
│   │
│   ├── App.jsx               # Main app entry
│   ├── main.jsx              # React render entry
│   └── index.css             # Tailwind CSS setup
│
├── package.json              # Dependencies
├── sample_portfolio.csv      # Example data
└── README.md                 # Documentation
```

## 🚀 Quick Start Guide

### Step 1: Extract the Project
```bash
# Extract the archive
tar -xzf portfolio-dashboard.tar.gz
cd portfolio-dashboard
```

### Step 2: Install Dependencies
```bash
npm install
```
*This will take 1-2 minutes to install all required packages*

### Step 3: Start the Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Navigate to: **http://localhost:5173**

## 📝 How to Use

### 1️⃣ Upload Your Portfolio

The dashboard needs a CSV file with your holdings. Format:

```csv
Ticker,Shares,Cost_Basis,Purchase_Date,Asset_Type
NVDA,50,450.25,2024-01-15,Stock
AMD,100,125.50,2024-03-20,Stock
AAPL,30,175.00,2023-11-10,Stock
```

**Use the included `sample_portfolio.csv` to test!**

### 2️⃣ Refresh Prices

Click "Refresh Prices" button to:
- Fetch current market prices from Yahoo Finance
- Calculate all metrics
- Update visualizations

### 3️⃣ Configure Settings (Optional)

Click "Settings" to add:
- **Anthropic API Key** for AI insights (get from console.anthropic.com)
- **Risk-Free Rate** (default: 4.2%)
- **Auto-Refresh Interval**

### 4️⃣ Generate AI Insights

Once you have prices loaded and API key configured:
1. Click "Generate Insights"
2. Claude will analyze your portfolio
3. Get actionable recommendations on:
   - Risk levels
   - Diversification
   - Concentration issues
   - Performance evaluation

## 🔧 Key Technologies

| Technology | Purpose | Why Used |
|------------|---------|----------|
| **React 18** | UI Framework | Modern, component-based development |
| **Vite** | Build Tool | Fast development and optimized builds |
| **Tailwind CSS** | Styling | Professional, responsive design |
| **Recharts** | Charts | Beautiful, interactive visualizations |
| **yahoo-finance2** | Market Data | Real-time stock prices |
| **@anthropic-ai/sdk** | AI | Claude-powered insights |
| **Papa Parse** | CSV | Easy CSV parsing |

## 📊 Understanding the Metrics

### Sharpe Ratio
- Measures risk-adjusted returns
- **Above 2**: Excellent
- **1.5-2**: Very Good
- **1-1.5**: Good
- **Below 1**: Needs improvement

### Beta
- Volatility compared to market
- **> 1.2**: High volatility
- **0.8-1.2**: Market-like
- **< 0.8**: Low volatility

### Concentration
- Weight of top 3 positions
- **< 30%**: Well diversified
- **30-50%**: Moderate
- **> 50%**: Highly concentrated

### Herfindahl Index
- Overall diversification measure
- **Closer to 0**: More diversified
- **Closer to 1**: More concentrated

## 🎨 Features Breakdown

### 1. Portfolio Overview Cards
Shows at-a-glance:
- Total portfolio value
- Day change ($ and %)
- Total gain/loss
- Sharpe Ratio rating
- Portfolio Beta

### 2. Interactive Charts
- **Position Allocation Pie Chart**: Shows weight of each holding
- **Sector Allocation Pie Chart**: Industry breakdown
- **Risk Metrics Bar Chart**: Visual comparison of Sharpe, Sortino, Info Ratio

### 3. Holdings Table
- Sortable by any column
- Click column headers to sort
- Shows all position details
- Color-coded gains/losses
- Totals row at bottom

### 4. AI Insights
- Risk assessment
- Concentration warnings
- Diversification analysis
- Performance evaluation
- Specific recommendations

### 5. Data Export
- Export current portfolio to CSV
- Includes all calculated metrics
- Date-stamped filename

## 🔒 Privacy & Security

✅ **All data stored locally** in browser (localStorage)
✅ **No external data storage**
✅ **API key never leaves your browser**
✅ Only external calls:
   - Yahoo Finance (public price data)
   - Anthropic API (only when generating insights)

## 🐛 Troubleshooting

### Issue: Prices not updating
**Solutions:**
- Check ticker symbols are correct (e.g., "AAPL" not "Apple")
- Wait 1-2 seconds between attempts
- Check browser console for errors (F12)

### Issue: AI insights fail
**Solutions:**
- Verify API key is correct in Settings
- Check you have Anthropic API credits
- Make sure you have prices loaded first

### Issue: CSV upload fails
**Solutions:**
- Check CSV has required columns: Ticker, Shares, Cost_Basis, Purchase_Date
- Use comma-separated format (not semicolons)
- Try the sample_portfolio.csv first

## 🔮 Future Enhancements

Potential additions:
- Historical performance charts over time
- Comparison with S&P 500 benchmark
- Tax lot tracking
- Dividend income tracking
- Mobile app version
- Multiple portfolio support
- Automated alerts

## 💡 Code Highlights

### Calculations Engine
The `calculations.js` file implements 20+ financial formulas including:
- Modern Portfolio Theory metrics
- Risk-adjusted performance measures
- Correlation analysis
- Drawdown calculations

### Data Fetching
Smart caching system in `dataFetcher.js`:
- Caches prices for 5 minutes
- Batch requests to avoid rate limits
- Handles errors gracefully

### AI Integration
Structured prompts in `aiService.js`:
- Provides full portfolio context to Claude
- Formats response as structured JSON
- Categories insights by type and severity

## 📚 Learning Resources

If you're new to these concepts:

- **Portfolio Theory**: [Investopedia - Modern Portfolio Theory](https://www.investopedia.com/terms/m/modernportfoliotheory.asp)
- **Sharpe Ratio**: [Investopedia - Sharpe Ratio](https://www.investopedia.com/terms/s/sharperatio.asp)
- **React**: [React Official Docs](https://react.dev)
- **Tailwind CSS**: [Tailwind Docs](https://tailwindcss.com)

## 🎓 Educational Value

This project demonstrates:
- Modern React patterns (hooks, state management)
- API integration (REST APIs)
- Financial calculations
- Data visualization
- AI integration
- Professional UI/UX design
- CSV data handling
- Local storage
- Error handling

## 📄 License

Open source - use for learning and personal projects!

---

## ✨ Getting Started Now

1. Extract the project: `tar -xzf portfolio-dashboard.tar.gz`
2. Navigate to folder: `cd portfolio-dashboard`
3. Install packages: `npm install`
4. Start server: `npm run dev`
5. Open browser: `http://localhost:5173`
6. Upload `sample_portfolio.csv` to test!

**Have questions? Check the README.md in the project folder for more details!**

---

Built with ❤️ using React, Vite, Tailwind CSS, and Claude AI
