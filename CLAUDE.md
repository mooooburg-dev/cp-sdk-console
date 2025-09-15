# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js 15 application that serves as a test interface for the Coupang Partners SDK. The application allows users to test three different Coupang Partners API endpoints through a web interface: product search, GoldBox deals, and CoupangPL recommendations.

## Development Commands

- **Development server**: `npm run dev` (starts on http://localhost:3000)
- **Build**: `npm run build`
- **Production start**: `npm start`
- **Linting**: `npm run lint` (uses ESLint with Next.js config)

## Architecture & Key Components

### SDK Integration

- Uses `coupang-partners-sdk-standalone` as a local file dependency (from `../coupang-partners-sdk-standalone`)
- SDK client initialization requires `COUPANG_ACCESS_KEY` and `COUPANG_SECRET_KEY` environment variables
- Environment variables are configured via `.env.local` (see `.env.local.example`)

### App Structure (Next.js App Router)

- **app/layout.tsx**: Root layout with Geist fonts and global CSS
- **app/page.tsx**: Main client component with tabbed interface for three API endpoints
- **app/api/products/**: API routes for Coupang Partners endpoints
  - `search/route.ts`: Product search API
  - `goldbox/route.ts`: GoldBox deals API
  - `coupangpl/route.ts`: CoupangPL recommendations API

### Frontend Features

- Client-side React component with state management for three different API test forms
- Image optimization configured for Coupang CDN domains in `next.config.ts`
- Tailwind CSS for styling with responsive grid layouts
- Product cards display with images, pricing, shipping info, and affiliate links

### API Integration Pattern

Each API route follows the same pattern:

1. Initialize CoupangPartnersClient with environment credentials
2. Parse query parameters from request
3. Call appropriate SDK method
4. Return JSON response with error handling

### Environment Configuration

Required environment variables in `.env.local`:

- `COUPANG_ACCESS_KEY`: Coupang Partners API access key
- `COUPANG_SECRET_KEY`: Coupang Partners API secret key

### TypeScript Configuration

- Target ES2017 with strict mode enabled
- Path aliases configured with `@/*` pointing to project root
- Next.js TypeScript plugin enabled

### Build & Deployment

- ESLint configured with Next.js core-web-vitals and TypeScript rules
- PostCSS with Tailwind CSS for styling
- Next.js image optimization configured for Coupang domains
