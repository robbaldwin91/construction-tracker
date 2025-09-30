'use client'

import { useState } from 'react'
import { Plot, PlotStatus } from '@/types/plot'

interface PlotModalProps {
  plot: Plot
  onClose: () => void
  onUpdate: (plot: Plot) => void
}

export default function PlotModal({ plot, onClose, onUpdate }: PlotModalProps) {
  const [editedPlot, setEditedPlot] = useState<Plot>(plot)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onUpdate(editedPlot)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedPlot(plot)
    setIsEditing(false)
  }

  const statusOptions: PlotStatus[] = ['not-started', 'in-progress', 'completed', 'on-hold']

  return (
    <div className="plot-modal">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{plot.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                value={editedPlot.status}
                onChange={(e) => setEditedPlot({ 
                  ...editedPlot, 
                  status: e.target.value as PlotStatus 
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            ) : (
              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm ${
                plot.status === 'completed' ? 'bg-green-500' :
                plot.status === 'in-progress' ? 'bg-yellow-500' :
                plot.status === 'not-started' ? 'bg-red-500' : 'bg-gray-500'
              }`}>
                {plot.status.charAt(0).toUpperCase() + plot.status.slice(1).replace('-', ' ')}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={editedPlot.progress}
                onChange={(e) => setEditedPlot({ 
                  ...editedPlot, 
                  progress: parseInt(e.target.value) || 0 
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${plot.progress}%` }}
                ></div>
                <span className="text-sm text-gray-600 mt-1 block">{plot.progress}%</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editedPlot.description || ''}
                onChange={(e) => setEditedPlot({ 
                  ...editedPlot, 
                  description: e.target.value 
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">
                {plot.description || 'No description available'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contractor
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedPlot.contractor || ''}
                onChange={(e) => setEditedPlot({ 
                  ...editedPlot, 
                  contractor: e.target.value 
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-600">
                {plot.contractor || 'Not assigned'}
              </p>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}