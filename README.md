# 🚲 ParkWhere

![alt text](/images/coverImage1.png)
![alt text](/images/coverImage2.png)

## What It Does

ParkWhere shows you available bicycle parking spots near you on an interactive map. Search for a location (or use your current one) and instantly see all the parking options around you.

Try it here: **[parkwhere-web.vercel.app](https://parkwhere-web.vercel.app)**

## Quick Start

1. **Open** the app via the link
2. **Search or use** "use my location"
3. **Browse the map** to see spots near you
4. **Click a spot** to see details
5. **Navigate** and park

## Project Structure

```
src/
├── app/
│   ├── api/                    # Server-side API route handlers
│   ├── (pages)/                # Main pages (map view, home)
│   └── utils/                  # Utility helpers (tile math, parsing, etc)
├── components/
│   ├── map/                    # Map-related UI components
│   └── ui/                     # General UI components
├── core/
│   └── constants/              # Types & constants
├── hooks/                      # Custom React hooks for viewmodels
├── modules/                    # Client-side API functions
└── viewmodels/                 # State & logic for views
```

## Current features

- Displays bicycle parking spots fetched from LTA's API
- Interactive map with marker layers and detail popups
- Filtering based on searched location or current location
- Toggleable overlay for nearby cycling paths/bike lanes
- Linked navigation to parking spots via Google Maps

## Planned/Future Features

- [ ] Filter by parking type (e.g. covered, uncovered, rack, etc)
- [ ] Crowdsourced spot availability, user reviews, ratings and images
- [ ] Additional data layers (e.g. repair shops, cycling-related POIs)
- [ ] Better mobile compatibility and performance optimizations

## Local Setup

Since this project relies on external data (LTA Datamall, OneMap) and integrations (Neon), you will need to set up environment variables to run it locally.

1. Clone the repository

```bash
git clone https://github.com/rongkangw/parkwhere-web.git
```

2. Install dependencies

```bash
npm install
```

3. Configure Environment Variables

Create a `.env.local` file in the project root directory and add the following:

```bash
# PostgreSQL connection string (Neon)
# Get one at: https://neon.com/
DATABASE_URL="your_postgres_connection_url"

# LTA Datamall API Key
# Get one at: https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html
LTA_PARKINGSPOT_API_KEY="your_lta_api_key"

# OneMap API credentials (for geocoding)
# Get one at: https://www.onemap.gov.sg/apidocs/register
ONE_MAP_PASSWORD="your_onemap_password"
ONE_MAP_EMAIL="your_onemap_email"
```

4. Run the development server

```bash
npm run dev
```

## Tech Stack

- Developed using **React** + **TypeScript**
- **Next.js** (App Router)
- **MapLibre GL** for the map
- **Vercel** for deployment
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **PostgreSQL (Neon)** for data storage
- **[LTA Datamall API](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html)** for parking spot data
- **[OneMap API](https://www.onemap.gov.sg/apidocs/)** for reverse geocoding

## Feedback

Found a bug or have an idea? Please raise a new issue in the "Issues" page. Contributions are also very welcome!
