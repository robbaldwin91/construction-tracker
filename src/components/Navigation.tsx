'use client'

interface NavigationProps {
  currentView: 'map' | 'dashboard'
  onViewChange: (view: 'map' | 'dashboard') => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">Construction Tracker</h1>
        
        <div className="flex space-x-4">
          <button
            onClick={() => onViewChange('map')}
            className={`px-4 py-2 rounded transition-colors ${
              currentView === 'map'
                ? 'bg-blue-800 text-white'
                : 'bg-blue-500 hover:bg-blue-700'
            }`}
          >
            Map View
          </button>
          
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-4 py-2 rounded transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-800 text-white'
                : 'bg-blue-500 hover:bg-blue-700'
            }`}
          >
            Dashboard
          </button>
        </div>
      </div>
    </nav>
  )
}