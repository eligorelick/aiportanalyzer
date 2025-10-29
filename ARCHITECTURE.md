# Portfolio Dashboard - Architecture & Data Flow

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    App.jsx                            │  │
│  │                       │                               │  │
│  │                  Dashboard.jsx                        │  │
│  │          (Main State Management Hub)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│           │              │              │                    │
│     ┌─────┴─────┐  ┌────┴────┐  ┌─────┴──────┐            │
│     │           │  │         │  │            │             │
│  ┌──▼──┐    ┌──▼──┐  ┌──▼──┐  ┌──▼──┐    ┌──▼──┐          │
│  │File │    │Port │  │Chart│  │Table│    │AI   │          │
│  │Upload│   │Ovrvw│  │Sectn│  │     │    │Insgt│          │
│  └─────┘    └─────┘  └─────┘  └─────┘    └─────┘          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                Utils (Utilities)                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │storage.js│  │calcul.js │  │dataFetch │           │  │
│  │  │(localStorage)│(formulas)│  │(Yahoo)   │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │                    ┌──────────┐                       │  │
│  │                    │aiService │                       │  │
│  │                    │(Claude)  │                       │  │
│  │                    └──────────┘                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                │                           │
                ▼                           ▼
        ┌───────────────┐         ┌─────────────────┐
        │ Yahoo Finance │         │ Anthropic API   │
        │   (Prices)    │         │  (AI Insights)  │
        └───────────────┘         └─────────────────┘
```

## 📊 Data Flow Diagram

```
USER UPLOADS CSV
      │
      ▼
┌─────────────┐
│ FileUpload  │──┐
│ Component   │  │ Validates & Parses CSV
└─────────────┘  │
      │          │
      │  ┌───────┘
      │  │
      ▼  ▼
┌──────────────────────┐
│  Dashboard.jsx       │
│  (State: positions)  │──────┐ Stores in localStorage
└──────────────────────┘      │
      │                        ▼
      │               ┌─────────────────┐
      │               │   storage.js    │
      │               │  (localStorage) │
      │               └─────────────────┘
      │
      │ USER CLICKS "REFRESH PRICES"
      │
      ▼
┌─────────────────────┐
│  dataFetcher.js     │
│                     │
│  1. Loop through    │
│     tickers         │
│  2. Check cache     │
│  3. Fetch from      │
│     Yahoo Finance   │──────► Yahoo Finance API
│  4. Cache results   │
└─────────────────────┘
      │
      │ Returns price data
      │
      ▼
┌──────────────────────┐
│  Dashboard.jsx       │
│                      │
│  1. Update positions │
│     with new prices  │
│  2. Calculate        │
│     metrics          │──────► calculations.js
│  3. Re-render        │
│     components       │
└──────────────────────┘
      │
      ├──────────► PortfolioOverview (shows totals)
      │
      ├──────────► ChartsSection (displays charts)
      │
      └──────────► PositionsTable (lists holdings)


USER CLICKS "GENERATE INSIGHTS"
      │
      ▼
┌──────────────────────┐
│  Dashboard.jsx       │
│                      │
│  1. Calculate all    │
│     metrics          │──────► calculations.js
│  2. Prepare          │
│     portfolio data   │
└──────────────────────┘
      │
      ▼
┌─────────────────────┐
│   aiService.js      │
│                     │
│  1. Build prompt    │
│     with portfolio  │
│     context         │
│  2. Call Claude     │──────► Anthropic API
│  3. Parse JSON      │
│     response        │
└─────────────────────┘
      │
      │ Returns insights array
      │
      ▼
┌──────────────────────┐
│  AIInsights.jsx      │
│                      │
│  Displays categorized│
│  insights with       │
│  severity levels     │
└──────────────────────┘
```

## 🔄 State Management Flow

```
                     ┌──────────────────┐
                     │  Dashboard.jsx   │
                     │   (Root State)   │
                     └──────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  [positions]           [settings]            [insights]
  Array of objects      Object with           Array from AI
   │                    config                 │
   │                     │                     │
   │                     │                     │
   ├──► FileUpload      └──► SettingsModal    └──► AIInsights
   ├──► PortfolioOv     
   ├──► ChartsSection   
   ├──► PositionsTable  
   └──► (calculations)
```

## 🧮 Calculations Pipeline

```
INPUT: positions = [
  { ticker: "NVDA", shares: 50, costBasis: 450, currentPrice: 145, ... }
]

        │
        ▼
┌────────────────────────┐
│ calculations.js        │
│                        │
│ Portfolio-Level:       │
│  • totalValue          │──────► Sum of (shares × currentPrice)
│  • totalGainLoss       │──────► Sum of ((currentPrice - costBasis) × shares)
│  • weights             │──────► Each position / total × 100
│                        │
│ Risk Metrics:          │
│  • sharpeRatio         │──────► (return - riskFree) / stdDev
│  • sortinoRatio        │──────► (return - riskFree) / downsideDev
│  • beta                │──────► Covariance / Variance
│                        │
│ Diversification:       │
│  • concentration       │──────► Sum of top 3 weights
│  • herfindahlIndex     │──────► Sum of (weight²)
│                        │
│ Market Comparison:     │
│  • alpha               │──────► Actual - Expected return
│  • rSquared            │──────► Correlation²
└────────────────────────┘
        │
        ▼
OUTPUT: metrics = {
  sharpe: 1.2,
  beta: 1.15,
  concentration: 45.5,
  ...
}
```

## 💾 Data Persistence

```
┌──────────────────────┐
│   Browser Storage    │
│   (localStorage)     │
├──────────────────────┤
│                      │
│ Keys:                │
│                      │
│ 1. portfolio_data    │──► { positions: [...], lastUpdated: "..." }
│                      │
│ 2. portfolio_settings│──► { apiKey: "...", riskFreeRate: 0.042, ... }
│                      │
│ 3. price_cache       │──► { "NVDA": { data: {...}, expires: ... } }
│                      │
└──────────────────────┘

AUTO-SAVE TRIGGERS:
• After CSV upload
• After price refresh
• After settings change
• Every 5 minutes (if auto-refresh enabled)
```

## 🎯 Component Responsibility Matrix

| Component | Responsibility | State Managed | External Calls |
|-----------|---------------|---------------|----------------|
| **Dashboard.jsx** | Orchestration, main state | positions, settings, insights | dataFetcher, aiService |
| **FileUpload.jsx** | CSV parsing, validation | preview, error | Papa Parse |
| **PortfolioOverview.jsx** | Display summary cards | None (props only) | None |
| **ChartsSection.jsx** | Render visualizations | None (props only) | None |
| **PositionsTable.jsx** | Display/sort holdings | sortField, sortDir | None |
| **AIInsights.jsx** | Display insights | None (props only) | None |
| **SettingsModal.jsx** | Config management | formData | None |

## 🔌 API Integration Points

### Yahoo Finance (dataFetcher.js)

```javascript
INPUT:  ['NVDA', 'AMD', 'AAPL']
        │
        ▼
PROCESS: For each ticker:
        1. Check localStorage cache (5-min TTL)
        2. If miss, call yahoo-finance2.quote(ticker)
        3. Extract: price, change, beta, marketCap, sector
        4. Cache result
        5. Delay 100ms (rate limiting)
        │
        ▼
OUTPUT: {
  'NVDA': { price: 145.20, change: 2.30, ... },
  'AMD': { price: 125.80, change: -1.10, ... },
  ...
}
```

### Anthropic Claude (aiService.js)

```javascript
INPUT:  { portfolioData, metrics, apiKey }
        │
        ▼
PROCESS: 1. Build comprehensive prompt with:
           - Portfolio summary
           - All positions
           - Key metrics
           - Sector allocation
        2. Call anthropic.messages.create()
        3. Parse JSON response
        │
        ▼
OUTPUT: [
  {
    category: "Risk",
    severity: "high",
    title: "...",
    description: "...",
    action: "..."
  },
  ...
]
```

## 🎨 UI Component Tree

```
App.jsx
  │
  └── Dashboard.jsx
        │
        ├── Header (inline)
        │     ├── Title
        │     └── Action Buttons
        │           ├── Refresh Prices
        │           ├── Export CSV
        │           └── Settings
        │
        ├── PortfolioOverview
        │     ├── Total Value Card
        │     ├── Gain/Loss Card
        │     ├── Sharpe Ratio Card
        │     └── Beta Card
        │
        ├── ChartsSection
        │     ├── Position Allocation (Pie)
        │     ├── Sector Allocation (Pie)
        │     └── Risk Metrics (Bar)
        │
        ├── AIInsights
        │     ├── Header with Regenerate
        │     └── Insight Cards
        │           ├── Category Badge
        │           ├── Title
        │           ├── Description
        │           └── Action Box
        │
        ├── PositionsTable
        │     ├── Sortable Headers
        │     ├── Position Rows
        │     └── Totals Footer
        │
        └── SettingsModal (conditional)
              ├── API Key Input
              ├── Risk-Free Rate
              ├── Refresh Interval
              └── Currency Select
```

## 🔐 Security & Privacy Model

```
┌─────────────────────────────────┐
│      User's Browser             │
│  ┌───────────────────────────┐  │
│  │   Portfolio Dashboard     │  │
│  │                           │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  localStorage       │  │  │  ◄── All data stored here
│  │  │  • Portfolio data   │  │  │
│  │  │  • API key          │  │  │
│  │  │  • Settings         │  │  │
│  │  └─────────────────────┘  │  │
│  │           │               │  │
│  └───────────┼───────────────┘  │
│              │                  │
└──────────────┼──────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌─────────┐         ┌──────────┐
│ Yahoo   │         │Anthropic │
│ Finance │         │   API    │
│(Public) │         │(API key) │
└─────────┘         └──────────┘

KEY POINTS:
✓ Portfolio data never sent to servers
✓ API key stored locally only
✓ Price data is public information
✓ AI insights use anonymized data structure
✓ Clear browser data removes everything
```

## 📈 Performance Optimization

```
1. CACHING STRATEGY
   ┌──────────────────┐
   │ Request price    │
   │ for "NVDA"       │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐     Yes    ┌────────────┐
   │ Check cache      │──────────► │ Return     │
   │ (5-min TTL)      │             │ cached     │
   └────────┬─────────┘             └────────────┘
            │ No
            ▼
   ┌──────────────────┐
   │ Fetch from API   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Cache + Return   │
   └──────────────────┘

2. BATCH PROCESSING
   - Fetch multiple tickers in parallel
   - Small delays between requests (rate limiting)
   - Update UI once when all complete

3. LAZY RENDERING
   - Charts only render when data changes
   - Table uses virtual scrolling (if large)
   - Components memoized with React.memo
```

## 🛠️ Development Workflow

```
MAKE CHANGES
      │
      ▼
SAVE FILE
      │
      ▼
┌─────────────┐
│ Vite Hot    │──► Browser auto-refreshes
│ Module      │    (keeps state!)
│ Replacement │
└─────────────┘
      │
      │ Check in browser
      │
      ▼
┌─────────────┐
│ Test feature│
└─────────────┘
      │
      │ Works? ──Yes──► Commit
      │
      No
      │
      ▼
┌─────────────┐
│ Check console│
│ for errors  │
└─────────────┘
```

## 📦 Build Process

```
SOURCE CODE
    │
    ├── src/components/*.jsx
    ├── src/utils/*.js
    ├── src/index.css
    └── src/main.jsx
         │
         ▼
┌──────────────┐
│ Vite Build   │
│              │
│ • Bundle JS  │
│ • Process CSS│
│ • Optimize   │
│ • Minify     │
└──────┬───────┘
       │
       ▼
    dist/
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js   (50KB)
    │   └── index-[hash].css  (20KB)
    └── ... (optimized for deployment)
```

---

## 💡 Key Takeaways

1. **Dashboard.jsx is the brain** - manages all state and coordinates components
2. **Utils do the heavy lifting** - calculations, API calls, storage
3. **Components are presentational** - receive data via props, render UI
4. **Data flows one way** - down from Dashboard to components
5. **External calls are isolated** - in dataFetcher and aiService
6. **Storage is automatic** - saves after every important change
7. **Caching improves performance** - reduces API calls

## 🎯 Where to Start Customizing

1. **Change appearance**: Edit Tailwind classes in components
2. **Add metrics**: Extend `calculations.js`
3. **Modify AI prompts**: Edit `aiService.js`
4. **Change charts**: Update `ChartsSection.jsx`
5. **Add features**: Start in `Dashboard.jsx`, add new components

---

This architecture is designed to be **modular, maintainable, and extensible**!
