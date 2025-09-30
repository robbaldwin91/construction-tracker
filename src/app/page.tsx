'use client'

import { useState } from 'react'
import MapView from '@/components/MapView'
import Navigation from '@/components/Navigation'

export default function Home() {
  const [currentView, setCurrentView] = useState<'map' | 'dashboard'>('map')

  return (
    <main className="min-h-screen bg-gray-100">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {currentView === 'map' && (
        <div className="map-container">
          <MapView />
        </div>
      )}
      
      {currentView === 'dashboard' && (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Project Dashboard</h1>
          <p className="text-gray-600">Dashboard view coming soon...</p>
        </div>
      )}
    </main>
  )
}