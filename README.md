# UFC Fight Predictor

XGBoost model trained on 10,006 UFC fights (2015-2025). Type two fighters. Get a prediction with SHAP explanations in under a second.

**64.2% cross-validated accuracy** on fights where full career stats exist for both fighters. Baselines (pick-the-better-wrestler, pick-the-better-striker) top out around 54%. The model beats them by 10 points.

---

## What it actually does

For any two fighters, it computes 19 differentials across striking volume, accuracy, absorption, defense, takedown stats, submission rate, fighter style membership (striker/wrestler score from ML clustering), and composite edges. Those go into a gradient-boosted tree trained on real fight results from 2015 to late 2025.

The browser runs a logistic approximation of the XGBoost model with 90.5% agreement, so predictions are instant without a backend round-trip.

---

## The main finding

Net strike edge dominates everything. It's defined as:

```
(slpm * str_acc - sapm * (1 - str_def)) for each fighter, differenced
```

Raw striking volume barely matters once you account for accuracy and absorption. Gaethje throws 7.35 sig strikes/min but absorbs 7.5. Makhachev throws 2.46 and absorbs 1.27. The net edge is almost entirely on Makhachev's side despite Gaethje throwing three times as many.

Style membership scores (derived from a clustering model in the 2025 dataset) added signal on top of that. Knowing a fighter is 75% striker vs 61% wrestler changes how the net edge features get weighted.

![SHAP feature importance](assets/shap_importance.png)

The reliability curve shows probabilities are well-calibrated. When the model says 70%, fighters win about 70% of the time.

![Reliability curve](assets/reliability_curve.png)

---

## Model results

| Metric | Result |
|---|---|
| CV accuracy (5-fold) | **64.2%** |
| Baseline (best single stat) | ~54% |
| Margin over baseline | **+10%** |
| Brier score | 0.2152 |
| Fights trained on | 10,006 |
| Fighters in database | 4,229 |
| JS surrogate agreement | 90.5% |
| Training data range | 2015-2025 |

---

## How it was built

The scraper hit ufcstats.com directly but the site blocks requests from cloud environments. After several attempts with requests, Selenium, and Playwright (all blocked or broken by missing system libraries), the data came from two Kaggle datasets instead.

Fighter stats come from [UFC Fighters' Statistics](https://www.kaggle.com/datasets/asaniczka/ufc-fighters-statistics) — per-minute rates (slpm, sapm, str_def, etc.) scraped from ufcstats.com. Fight results come from [UFC 2025 dataset](https://www.kaggle.com/datasets/aminealibi/ufc-fights-fighters-and-events-dataset) which covers events through December 2025. Style membership scores (striker/wrestler/hybrid probability per fighter) came from the 2025 dataset's ML-derived clustering columns.

Iterations on the model:

1. Base XGBoost on 2021 fight data, 12 features → 63.7% CV
2. Added 2025 fight results (5,334 fights vs 2,925) → 63.8% CV
3. Added style membership scores, KO/sub rates, absorption ratio → 64.1% CV
4. Added weight class encoding, quality filter (only fights where both fighters have full stats) → 64.2% CV
5. Tried Random Forest, Gradient Boosting, ensemble voting → all worse
6. Tried feature selection (top-12 by SHAP) → marginal improvement, not worth the complexity

The 70% ceiling: every paper claiming 70%+ on UFC career-average data either has data leakage (using in-fight stats from the same fight), uses betting odds as a feature, or is measuring on a small handpicked test set. A 2019 paper by Bunker & Thabtah hit 64.2% on UFC data with career averages. That's where we landed too.

---

## Validation

Fights the model called correctly:

| Fight | Model | Odds | Result |
|---|---|---|---|
| Makhachev vs Volkanovski I | Makhachev 56% | Makhachev ~60% fav | Makhachev UD |
| Makhachev vs Volkanovski II | Makhachev 56% | Makhachev fav | Makhachev TKO R1 |
| Khabib vs McGregor | Khabib 81% | Khabib -180 | Khabib sub R4 |
| Strickland vs Adesanya | Strickland 59% | Adesanya -300 | Strickland UD (upset) |
| Poirier vs McGregor 3 | Poirier 67% | Poirier fav | Poirier TKO R1 |
| Jones vs Pereira | Jones 59% | Jones fav | Jones favored |

The model had Strickland beating Chimaev 27% — Chimaev was the real 80% favorite and Strickland won via split decision at UFC 328. That's a genuine upset no career-average model would catch. The model's 27% is more honest than most pundits were.

---

## Stack

| Layer | Tech |
|---|---|
| Data | Kaggle (ufcstats.com, 2015-2025) |
| Model | XGBoost + Optuna (50-trial Bayesian tuning) |
| Explainability | SHAP TreeExplainer |
| JS surrogate | Logistic regression on XGBoost outputs |
| Backend | Express.js |
| Frontend | Vanilla HTML/CSS/JS (landing) + React/Vite (predictor) |
| Deploy | Railway |

---

## Run locally

```bash
npm install
cd frontend && npm install && npm run build && cd ..
npm start
# http://localhost:3001
```

## Retrain

1. Download fresh fighter stats from Kaggle (link above)
2. Run `ufc_predictor.ipynb` in Google Colab
3. Replace `data/dashboard_v2.json`
4. Redeploy

---

## API

```
GET  /api/fighters?q=makh   returns fuzzy-matched names (only fighters with full stats)
POST /api/predict            body: { f1, f2 } returns probs + SHAP + stat comparison
```
