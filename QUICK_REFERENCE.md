# Portfolio Analytics Dashboard - Quick Reference

## 🚀 Setup (First Time)
```bash
# Extract the project
tar -xzf portfolio-dashboard.tar.gz
cd portfolio-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## 💻 Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 📁 Key Files to Know

### Components (src/components/)
- **Dashboard.jsx** - Main app container, manages all state
- **FileUpload.jsx** - CSV upload with drag-and-drop
- **PortfolioOverview.jsx** - Summary cards at top
- **ChartsSection.jsx** - All visualizations
- **PositionsTable.jsx** - Holdings table with sorting
- **AIInsights.jsx** - Displays Claude's analysis
- **SettingsModal.jsx** - Configuration panel

### Utilities (src/utils/)
- **calculations.js** - All financial formulas (Sharpe, Beta, etc.)
- **dataFetcher.js** - Yahoo Finance API integration
- **aiService.js** - Claude API integration
- **storage.js** - localStorage management

## 📊 CSV Format

```csv
Ticker,Shares,Cost_Basis,Purchase_Date,Asset_Type
NVDA,50,450.25,2024-01-15,Stock
AMD,100,125.50,2024-03-20,Stock
```

**Required**: Ticker, Shares, Cost_Basis, Purchase_Date
**Optional**: Asset_Type

## 🎯 Workflow

1. **Upload CSV** → Load your portfolio data
2. **Refresh Prices** → Get current market data
3. **Configure Settings** → Add API key (optional)
4. **Generate Insights** → Get AI analysis
5. **Export CSV** → Save updated portfolio

## 🔑 Key Metrics

### Risk-Adjusted Performance
- **Sharpe Ratio**: Risk-adjusted returns (>1 is good, >2 is excellent)
- **Sortino Ratio**: Downside risk-adjusted returns
- **Beta**: Volatility vs market (1 = market-like)
- **Alpha**: Excess return vs expected

### Diversification
- **Concentration**: Top 3 positions weight (<30% is good)
- **Herfindahl Index**: Overall diversification (lower = better)

### Risk
- **VaR**: Value at Risk (potential loss at 95% confidence)
- **Max Drawdown**: Largest peak-to-trough decline

## 🛠️ Customization Points

### Change Colors (src/components/)
Look for Tailwind classes like:
- `bg-blue-600` (backgrounds)
- `text-green-600` (text colors)
- `border-red-500` (borders)

### Add New Metrics (src/utils/calculations.js)
```javascript
calculateYourMetric(positions) {
  // Your calculation here
  return result;
}
```

### Modify Chart Colors (src/components/ChartsSection.jsx)
```javascript
const COLORS = ['#3B82F6', '#8B5CF6', ...];
```

## 🔧 Common Modifications

### Change Refresh Interval
Edit `src/components/SettingsModal.jsx`:
```javascript
<option value="300000">Every 5 minutes</option>
<option value="YOUR_TIME">Your custom time</option>
```

### Add New Position Fields
1. Update CSV format
2. Modify `src/components/FileUpload.jsx`
3. Update `src/components/PositionsTable.jsx`

### Customize AI Prompts
Edit `src/utils/aiService.js` → `buildPrompt()` function

## 📱 Port Configuration

Default: `http://localhost:5173`

To change port, edit `package.json`:
```json
"scripts": {
  "dev": "vite --port 3000"
}
```

## 🎨 Styling

### Tailwind CSS Classes Used
- **Layouts**: grid, flex, gap-4
- **Colors**: bg-*, text-*, border-*
- **Sizing**: w-full, h-screen, p-4
- **Responsive**: md:, lg:, xl:

### Custom Classes (src/index.css)
- `.btn-primary` - Blue primary button
- `.btn-secondary` - Gray secondary button
- `.card` - White card with shadow

## 🐛 Debug Mode

Add console logs in key files:
```javascript
// In Dashboard.jsx
console.log('Positions:', positions);
console.log('Metrics:', metrics);

// In dataFetcher.js
console.log('Fetched prices:', priceData);
```

## 📊 Adding New Charts

1. Import chart type from recharts:
```javascript
import { LineChart, Line } from 'recharts';
```

2. Prepare data:
```javascript
const chartData = positions.map(p => ({
  name: p.ticker,
  value: p.weight
}));
```

3. Add chart component in ChartsSection.jsx

## 🔐 API Keys

**Anthropic API Key** (for AI insights):
- Get from: https://console.anthropic.com
- Add in: Settings → Anthropic API Key
- Stored locally in browser

## 📦 Dependencies

### Core
- react, react-dom (^18.3.1)
- vite (^6.0.7)

### UI & Styling
- tailwindcss (^3.4.17)
- lucide-react (^0.468.0)
- recharts (^2.15.0)

### Data & APIs
- yahoo-finance2 (^2.13.4)
- @anthropic-ai/sdk (^0.38.1)
- papaparse (^5.4.1)

### Utilities
- mathjs (^14.0.3)
- date-fns (^4.1.0)

## 🚨 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Module not found | Run `npm install` |
| Port already in use | Change port in package.json |
| API key not working | Check console.anthropic.com for credits |
| Prices not loading | Check ticker symbols, internet connection |
| CSV won't upload | Verify column names match exactly |

## 📚 File Size

- **Source code**: ~50KB
- **With node_modules**: ~300MB
- **Built version**: ~500KB

## 🎓 Learning Path

1. **Understand the flow**: App.jsx → Dashboard.jsx → Components
2. **Study calculations**: Open calculations.js, read each function
3. **Modify UI**: Change colors/layouts in components
4. **Add features**: Start with a simple metric calculation
5. **Experiment**: Try different chart types, layouts

## 💡 Quick Wins

### Easy Customizations:
1. Change colors in Tailwind classes
2. Modify card layouts in PortfolioOverview.jsx
3. Add tooltips with more explanations
4. Change number formatting (decimal places)
5. Customize AI prompt for different insights

### Medium Difficulty:
1. Add new chart types
2. Implement data filtering
3. Add date range selection
4. Create custom metrics
5. Add keyboard shortcuts

### Advanced:
1. Add historical price charts
2. Implement benchmark comparisons
3. Add tax lot tracking
4. Create PDF reports
5. Add real-time WebSocket updates

---

## 📞 Need Help?

1. Check PROJECT_GUIDE.md for detailed explanations
2. Read README.md in project folder
3. Check browser console (F12) for errors
4. Review code comments in files

---

**Ready to start? Run `npm run dev` and open http://localhost:5173**
