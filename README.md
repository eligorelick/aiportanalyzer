# Portfolio Analytics Dashboard

A professional-grade, web-based portfolio analytics dashboard that provides institutional-quality metrics, AI-powered insights, and beautiful visualizations for investment portfolios.

![Portfolio Dashboard](https://img.shields.io/badge/React-18+-blue) ![Vite](https://img.shields.io/badge/Vite-5+-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3+-cyan)

## Features

### 📊 Core Analytics
- **Real-time price updates** from Yahoo Finance
- **27+ portfolio metrics** including:
  - Risk-adjusted performance (Sharpe, Sortino, Alpha, Beta)
  - Volatility measures (Standard Deviation, Max Drawdown)
  - Diversification metrics (Herfindahl Index, Concentration)
  - Market comparison (R-Squared, Information Ratio, Tracking Error)
- **Interactive visualizations** with position and sector allocation charts
- **Sortable holdings table** with full position details

### 🤖 AI-Powered Insights
- Generate actionable portfolio insights using **Claude AI**
- Risk assessment and recommendations
- Concentration and diversification analysis
- Performance evaluation with specific metrics

### 💾 Data Management
- **CSV import/export** for easy portfolio management
- **Local storage** - all data stays in your browser
- **Auto-refresh** prices at configurable intervals
- Drag-and-drop file upload

### 🎨 Professional UI
- Clean, modern interface built with Tailwind CSS
- Responsive design works on all devices
- Color-coded metrics for quick insights
- Professional charts and visualizations

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies** (already done if you're reading this)
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

### 1. Upload Your Portfolio

The dashboard accepts CSV files with the following format:

```csv
Ticker,Shares,Cost_Basis,Purchase_Date,Asset_Type
NVDA,50,450.25,2024-01-15,Stock
AMD,100,125.50,2024-03-20,Stock
AAPL,30,175.00,2023-11-10,Stock
```

**Required fields:**
- `Ticker` or `Symbol` - Stock symbol (e.g., NVDA, AAPL, MSFT)
- `Shares` - Number of shares owned
- `Cost_Basis` or `AC/Share` - Average purchase price per share

**Optional fields:**
- `Purchase_Date` or `Date` - Date in YYYY-MM-DD format
- `Asset_Type` or `Type` - Stock, ETF, Futures, etc. (defaults to "Stock")

**Note:** The system accepts multiple column name variations for flexibility.

A sample CSV file (`sample_portfolio.csv`) is included for testing.

### 2. Configure Settings

Click the **Settings** button to configure:

- **Anthropic API Key** - Required for AI insights
  - Get your key from [console.anthropic.com](https://console.anthropic.com)
- **Risk-Free Rate** - Current 10-year Treasury yield (default: 4.2%)
- **Auto-Refresh Interval** - How often to update prices
- **Currency** - Display currency preference

### 3. Generate AI Insights

Click **Generate Insights** to receive AI-powered analysis!

## Architecture

This application uses a client-server architecture:

### Frontend (Port 5173)
- React 19 with Vite
- Tailwind CSS v4
- Recharts for visualizations
- Local storage for data persistence

### Backend API Server (Port 3001)
- Express.js REST API
- Yahoo Finance 2 integration
- In-memory caching (1-minute TTL)
- Automatic sector data fetching

**The backend server is required** for fetching real-time stock prices and sector data from Yahoo Finance. The `npm run dev` command starts both servers concurrently.

## Technologies Used

- **React 19** - Latest UI framework
- **Vite 7** - Next-generation build tool
- **Tailwind CSS v4** - New @import syntax
- **Recharts** - Data visualization
- **Express** - Backend API server
- **yahoo-finance2** - Real-time market data
- **@anthropic-ai/sdk** - AI-powered insights
- **concurrently** - Run multiple servers

## Building for Production

### Frontend Build
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deployment Options

#### Option 1: Deploy Both Frontend & Backend Together
Host on platforms that support Node.js:
- **Render** (recommended)
- **Railway**
- **Heroku**
- **AWS/GCP/Azure**

#### Option 2: Separate Deployment
1. **Backend**: Deploy to Node.js hosting (Render, Railway, etc.)
2. **Frontend**: Deploy to static hosting (Vercel, Netlify, etc.)
3. **Important**: Update `API_BASE_URL` in `src/utils/dataFetcher.js` to your production backend URL

### Environment Variables

Create a `.env` file (see `.env.example`):
```
PORT=3001
ANTHROPIC_API_KEY=your_api_key_here
```

## Troubleshooting

### Prices Showing $0.00
1. Ensure backend server is running on port 3001
2. Click "Refresh Prices" button
3. Check browser console for errors
4. Verify ticker symbols are valid

### "Access to storage is not allowed"
This is a browser extension error, not from the app. The app handles this gracefully.

### Sector Showing "Unknown"
Money market funds (like SWVXX) don't have sector data. This is normal.

### Port Already in Use
Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :3001
taskkill //PID <PID> //F

# Mac/Linux
lsof -ti:3001 | xargs kill
```
