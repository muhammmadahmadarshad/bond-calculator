# Bond Calculator API (NestJS)

Backend for the bond calculator: bond math and cash flow schedule exposed over HTTP.

## Setup

```bash
npm install
```

## Run

```bash
# Development (watch mode)
npm run start:dev

# One-off run
npm run start

# Production build + run
npm run build
npm run start:prod
```

Default port: **3000** (override with `PORT` env var).

## API

### POST `/api/bond/calculate`

Calculates bond metrics and cash flow schedule.

**Request body**

| Field               | Type   | Description                          |
|---------------------|--------|--------------------------------------|
| `faceValue`         | number | Face value in dollars (> 0)          |
| `annualCouponRate`  | number | Annual coupon rate in % (≥ 0)        |
| `marketPrice`       | number | Market price in dollars (> 0)        |
| `yearsToMaturity`   | number | Years to maturity (> 0)              |
| `couponFrequency`   | 1 \| 2 | 1 = annual, 2 = semi-annual         |

**Response**

```json
{
  "results": {
    "currentYield": 0.0526,
    "ytm": 0.0558,
    "totalInterestEarned": 500,
    "priceStatus": "discount"
  },
  "cashFlows": [
    {
      "period": 1,
      "paymentDate": "2025-08-25",
      "couponPayment": 25,
      "cumulativeInterest": 25,
      "remainingPrincipal": 1000
    }
  ]
}
```

- **currentYield:** Annual coupon / market price.
- **ytm:** Yield to maturity (iterative solver), annualized for semi-annual bonds.
- **totalInterestEarned:** Total coupon interest over the bond’s life.
- **priceStatus:** `"premium"` | `"discount"` | `"par"` (market price vs face value).
- **cashFlows:** Bullet bond schedule; principal only in the final period.

Invalid input returns `400 Bad Request` with a message.

## Project structure

```
server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   └── modules/
│       └── bond/
│           ├── bond.module.ts
│           ├── bond.controller.ts   # POST /api/bond/calculate
│           ├── bond.service.ts     # Validation + orchestration
│           ├── bond-calculations.ts # Pure bond math
│           └── dto/
│               └── calculate-bond.dto.ts
├── package.json
└── README.md
```

## Scripts

| Command           | Description        |
|-------------------|--------------------|
| `npm run build`   | Compile to `dist/` |
| `npm run start`   | Run compiled app   |
| `npm run start:dev` | Run with watch   |
| `npm run start:prod` | Run production build |
| `npm run test`    | Unit tests         |
| `npm run test:e2e` | E2E tests         |

## CORS

CORS is enabled for all origins so the Vite dev client can call the API. Restrict in production if needed (e.g. in `main.ts`).
