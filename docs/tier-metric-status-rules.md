# Tier metric status rules

Status determines the color of the Current value in the "Path to the next tier" table.

## Status colors

| Status | Color | Dot color |
|---|---|---|
| Met | `bm-green-700` | `bm-green-500` |
| Close | `amber-700` | `amber-500` |
| Needs improvement | `red-700` | `red-500` |

## Rules

**Met (green):** Current value meets or beats the requirement.

**Close (amber):** Within 10% of the required threshold.

**Needs improvement (red):** More than 10% away from the requirement.

## Direction

Most metrics are **lower is better** (defective rate, refund rate, OOW rate, wrong product rate). GMV and seniority are **higher is better**.

### Lower is better

- Met: `current ≤ required`
- Close: `current ≤ required × 1.1`
- Red: `current > required × 1.1`

### Higher is better

- Met: `current ≥ required`
- Close: `current ≥ required × 0.9`
- Red: `current < required × 0.9`

## Worked examples

### Lower is better (defective rate, required ≤ 6.5%)

| Current | Status | Why |
|---|---|---|
| 5.8% | Met | 5.8 ≤ 6.5 |
| 7.0% | Close | 7.0 ≤ 7.15 (6.5 × 1.1) |
| 8.0% | Red | 8.0 > 7.15 |

### Higher is better (GMV, required €75,000)

| Current | Status | Why |
|---|---|---|
| €80,000 | Met | 80,000 ≥ 75,000 |
| €68,000 | Close | 68,000 ≥ 67,500 (75,000 × 0.9) |
| €50,000 | Red | 50,000 < 67,500 |
