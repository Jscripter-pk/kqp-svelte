# KQP Control Panel - SvelteKit

A complete SvelteKit port of the KQP Admin control panel (originally built with Next.js + MUI).

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Login
- **Any ID + Any password** works in demo mode (dummy data is used by default)
- Try: `admin` / `password`

## Features

- ✅ Dark/Light theme toggle
- ✅ Authentication (JWT-style, demo mode)
- ✅ Dashboard with node list & stats
- ✅ Node sub-pages: Node Dashboard, Process, Memory, Audit Log
- ✅ Channel Inbound/Outbound
- ✅ Rule List, Action List, Layout List, SPEC List
- ✅ Identifier List, Function List
- ✅ Status page
- ✅ Interactive charts (CPU, Memory, Inbound, Outbound)
- ✅ Collapsible sidebar with node navigation
- ✅ Pagination
- ✅ Responsive design

## Configuration

Edit `.env` to configure:

```env
PUBLIC_API_DATA_TYPE=dummy    # Use 'real' for live API
PUBLIC_SERVER_URL=http://your-server.com
```

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **SvelteKit** - Framework
- **Chart.js** - Charts
- **TypeScript** - Type safety
- **CSS Variables** - Theming
