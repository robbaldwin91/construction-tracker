# Construction Tracker

A Next.js Progressive Web App (PWA) for managing construction project progress with interactive map visualization.

## Features

- 📍 **Interactive Map View**: Visualize construction sites with plot overlays
- 🎨 **Color-Coded Status**: Plots display different colors based on progress status
- 📋 **Plot Management**: Click on plots to view and edit details in modal interfaces  
- 📊 **Progress Tracking**: Monitor completion percentage for each plot
- 💼 **Contractor Management**: Assign and track contractors for each plot
- 📱 **PWA Support**: Works as a desktop application

## Plot Status Types

- 🟢 **Completed**: Plot construction is finished
- 🟡 **In Progress**: Plot is currently under construction
- 🔴 **Not Started**: Plot construction hasn't begun
- ⚫ **On Hold**: Plot construction is paused

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd construction-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── MapView.tsx        # Main map interface
│   ├── Navigation.tsx     # Navigation bar
│   └── PlotModal.tsx      # Plot details modal
└── types/                 # TypeScript type definitions
    └── plot.ts            # Plot data types
```

## Technology Stack

- **Framework**: Next.js 15+ with TypeScript
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **State Management**: React hooks
- **Map Integration**: Ready for Leaflet/MapBox integration

## Database Integration

The application is ready for database integration. Current mock data in `src/components/MapView.tsx` should be replaced with:

- REST API endpoints for plot data
- Database queries (PostgreSQL, MongoDB, etc.)
- Real-time updates with WebSockets or Server-Sent Events

## Shapefile Integration

To add shapefile support:

1. Install shapefile parsing libraries:
```bash
npm install shapefile @types/shapefile
```

2. Add file upload functionality for .shp files
3. Parse coordinates and overlay on map
4. Link shapefile features to plot database records

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.