# UFC Fight Predictor

XGBoost ML model trained on 11,280 UFC fights. 68.4% cross-validated accuracy.

## Stack
- Model: XGBoost trained in Google Colab
- Backend: Express.js
- Frontend: React + Vite + Framer Motion

## Local dev

```bash
# Build frontend
cd frontend && npm install && npm run build && cd ..

# Start server
npm install && npm start
```

## Retrain
Open `ufc_predictor.ipynb` in Colab, run all cells, download `dashboard_v2.json`, replace `data/dashboard_v2.json`.
