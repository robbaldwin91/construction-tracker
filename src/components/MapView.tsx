'use client'

import { useEffect, useRef, useState } from 'react'
import PlotModal from './PlotModal'
import { Plot, PlotStatus } from '@/types/plot'

// Mock data - replace with your actual database integration
const mockPlots: Plot[] = [
  { id: '1', name: 'Plot A1', status: 'completed', progress: 100, coordinates: [40.7128, -74.0060] },
  { id: '2', name: 'Plot A2', status: 'in-progress', progress: 65, coordinates: [40.7130, -74.0055] },
  { id: '3', name: 'Plot B1', status: 'not-started', progress: 0, coordinates: [40.7125, -74.0065] },
  { id: '4', name: 'Plot B2', status: 'on-hold', progress: 30, coordinates: [40.7135, -74.0050] },
]

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [plots] = useState<Plot[]>(mockPlots)

  const getStatusColor = (status: PlotStatus): string => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'in-progress': return '#f59e0b'
      case 'not-started': return '#ef4444'
      case 'on-hold': return '#6b7280'
      default: return '#6b7280'
    }
  }

  // Placeholder for map initialization
  useEffect(() => {
    if (!mapRef.current) return

    // Here you would initialize your map library (Leaflet, MapBox, etc.)
    // For now, we'll create a simple visual representation
    const mapContainer = mapRef.current
    mapContainer.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        background: linear-gradient(45deg, #e5f3ff 25%, #f0f9ff 25%, #f0f9ff 50%, #e5f3ff 50%, #e5f3ff 75%, #f0f9ff 75%);
        background-size: 20px 20px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      ">
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: bold;">
          Construction Site Map
        </h2>
        <p style="color: #6b7280; margin-bottom: 30px;">
          Click on the colored plots below to view details
        </p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
          ${plots.map(plot => `
            <div 
              class="plot-marker" 
              data-plot-id="${plot.id}"
              style="
                width: 80px; 
                height: 80px; 
                background-color: ${getStatusColor(plot.status)}; 
                border-radius: 8px; 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-weight: bold;
                transition: transform 0.2s;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              "
              onmouseover="this.style.transform='scale(1.1)'"
              onmouseout="this.style.transform='scale(1)'"
            >
              ${plot.name}
            </div>
          `).join('')}
        </div>
      </div>
    `

    // Add click handlers for plot markers
    const plotMarkers = mapContainer.querySelectorAll('.plot-marker')
    plotMarkers.forEach(marker => {
      marker.addEventListener('click', (e) => {
        const plotId = (e.target as HTMLElement).getAttribute('data-plot-id')
        const plot = plots.find(p => p.id === plotId)
        if (plot) {
          setSelectedPlot(plot)
        }
      })
    })
  }, [plots])

  const handleCloseModal = () => {
    setSelectedPlot(null)
  }

  const handleUpdatePlot = (updatedPlot: Plot) => {
    // Here you would update the plot in your database
    console.log('Updating plot:', updatedPlot)
    setSelectedPlot(null)
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2">Plot Status</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Not Started</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
            <span className="text-sm">On Hold</span>
          </div>
        </div>
      </div>

      {selectedPlot && (
        <PlotModal
          plot={selectedPlot}
          onClose={handleCloseModal}
          onUpdate={handleUpdatePlot}
        />
      )}
    </div>
  )
}