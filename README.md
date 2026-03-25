# ParkWhere Web

ParkWhere Web is a Next.js app for viewing bicycle parking locations on an interactive map.

## What The App Currently Does

- Loads bicycle parking data from LTA Datamall through a Next.js API route.
- Displays parking spots on a MapLibre map.
- Updates map camera coordinates on map movement.
- Lets users click a parking marker/layer point to focus the camera and open a details popup.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- React Query
- Zustand
- MapLibre + react-map-gl

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_API_KEY=your_lta_datamall_account_key
```

## How To Run

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```
