# Product API Test Interface

A Next.js application for testing and integrating with e-commerce affiliate APIs.

## Features

- Product search with filtering options
- Deal and promotion browsing
- Product recommendations
- Deeplink generation for affiliate tracking
- Responsive UI with Tailwind CSS

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites

Create a `.env.local` file in the root directory with required API credentials:

```bash
COUPANG_ACCESS_KEY=your_access_key
COUPANG_SECRET_KEY=your_secret_key
```

See `.env.local.example` for reference.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `app/api/` - API routes for backend integration
- `app/globals.css` - Global styles and Tailwind configuration

## License

Private
