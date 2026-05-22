# Stock Portfolio Assistant Web App

The Stock Portfolio Assistant Web App is a CMSC 495 capstone project designed to help users track and manage their stock investments in one place. The completed application will allow users to maintain a portfolio, retrieve near-current stock pricing data, calculate portfolio value and gains or losses, and view portfolio information through a user-friendly dashboard.

## Team Members

- Justin Mika
- Luis Peralta Aguirre
- Miles Dobbins
- Aaron Fensterheim

## Technology Stack

- **Next.js** and **React** for full-stack web application development
- **TypeScript** as the primary programming language
- **Tailwind CSS** for application styling
- **PostgreSQL** hosted through **Neon** for database storage
- **Prisma** for database access and schema management
- **Finnhub API** for near-current stock quote data
- **Recharts** for planned portfolio visualizations
- **Auth.js / NextAuth** for planned user authentication
- **Vercel** for planned deployment

## Current Status

The project is currently in the initial development stage.

Completed work:

- Created the Next.js web application structure
- Confirmed the application runs locally
- Created the hosted PostgreSQL database through Neon
- Configured Prisma to connect to the database
- Created and synchronized the initial database schema
- Added Finnhub API support through a backend route
- Successfully tested stock quote retrieval using ticker symbols such as `AAPL`

Still in development:

- User authentication
- Portfolio dashboard interface
- Add, update, and remove holding features
- Portfolio value and gain/loss calculations
- Stock price caching and refresh intervals
- Charts and portfolio analytics
- Final deployment

## Current Finnhub API Route

The application currently includes a backend API route for retrieving stock quote data through Finnhub.

```text
GET /api/quote?symbol=AAPL
```

The route returns formatted quote information including:

- Current stock price
- Daily price change
- Percentage change
- Daily high and low prices
- Opening price
- Previous closing price
- Quote timestamp

The Finnhub API key is stored in a local environment file and accessed only through the backend route. It is not exposed in frontend browser code.

## Database

The project currently uses PostgreSQL hosted through Neon. Prisma defines and manages the database structure.

The initial database schema supports:

- User information
- Authentication account and session information
- Stock holdings
- Buy and sell transactions
- Portfolio snapshots
- Cached stock pricing data

## Environment Variables

The application uses local environment variables for private credentials and API keys.

Required variables include:

```env
DATABASE_URL="your_neon_database_connection_string"
FINNHUB_API_KEY="your_finnhub_api_key"
```

Environment files containing real credentials should not be committed to GitHub.

## Planned Features

- Secure user registration and login
- Personalized portfolio dashboard
- Stock holding management
- Portfolio total value calculation
- Individual stock gain and loss tracking
- Controlled stock price refresh logic
- Portfolio allocation pie chart
- Portfolio performance tracking over time
- Deployment of the completed web application