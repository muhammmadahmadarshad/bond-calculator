# Bond Calculator

A single-page bond calculator with a React client and NestJS API. Compute current yield, yield to maturity (YTM), total interest over the bond’s life, premium/discount vs face value, and a cash flow schedule.

## Features

- **Inputs:** Face value, annual coupon rate (%), market price, years to maturity, coupon frequency (annual / semi-annual)
- **Outputs:**
  - Current yield
  - Yield to Maturity (YTM), annualized for semi-annual bonds
  - Total interest earned over the bond
  - Premium or discount indicator (trading above/below face value)
- **Cash flow schedule:** Period, payment date, coupon payment, cumulative interest, remaining principal (bullet bond)

## Project structure

```
bond-calculator/
├── client/     # React + Vite + TypeScript frontend
├── server/     # NestJS API (bond calculation logic)
└── README.md
```

## Prerequisites

- Node.js (v18+)
- npm

## Quick start

### Option A: Run both from root (recommended)

From the project root:

```bash
npm install              # install root deps (concurrently)
npm run install:all      # install client + server deps
npm run dev              # start server + client together
```

- API: **http://localhost:3000**
- App: **http://localhost:5173**

### Option B: Run client and server separately

### 1. Install dependencies

```bash
# Client
cd client && npm install && cd ..

# Server
cd server && npm install && cd ..
```

### 2. Run the server

```bash
cd server
npm run start:dev
```

API runs at **http://localhost:3000** (or `PORT` env var).

### 3. Run the client

```bash
cd client
npm run dev
```

App runs at **http://localhost:5173** (or the port Vite shows). It calls the API at `http://localhost:3000` by default.

### 4. Optional: API URL

To point the client at another API base URL, set in `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## API

- **POST** `/bond/calculate`  
  **Body:** `{ faceValue, annualCouponRate, marketPrice, yearsToMaturity, couponFrequency }`  
  **Response:** `{ results: { currentYield, ytm, totalInterestEarned, priceStatus }, cashFlows: [...] }`

See [server/README.md](server/README.md) for server-only setup and scripts.

## Tech stack

- **Client:** React 19, TypeScript, Vite. Dark/light theme, minimal CSS.
- **Server:** NestJS 11, TypeScript. Bond logic in `server/src/modules/bond/`.

## License

MIT
