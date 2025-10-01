'use client'

import { useState, useEffect } from 'react'
import { Plot, Homebuilder, ConstructionType, UnitType } from '@/types/plot'

interface EnhancedPlotDialogProps {
  show: boolean
  onClose: () => void
  onSave: (plotData: PlotCreationData, plotId?: string) => void
  coordinates: [number, number][]
  saving: boolean
  existingPlotsWithoutPolygons: Plot[]
  viewingPlot?: Plot // Optional plot to view details
}

export interface PlotCreationData {
  // Required for new plot
  name?: string
  // Optional connection to existing plot
  existingPlotId?: string
  // Extended fields
  streetAddress?: string
  homebuilderId?: string
  constructionTypeId?: string
  unitTypeId?: string
  numberOfBeds?: number
  numberOfStoreys?: number
  squareFootage?: number
  minimumSalePrice?: number
  // Basic fields
  description?: string
  contractor?: string
  notes?: string
}

export default function EnhancedPlotDialog({ 
  show, 
  onClose, 
  onSave, 
  coordinates, 
  saving,
  existingPlotsWithoutPolygons,
  viewingPlot
}: EnhancedPlotDialogProps) {
  const [mode, setMode] = useState<'new' | 'connect' | 'view'>('new')
  const [formData, setFormData] = useState<PlotCreationData>({})
  
  // Master data
  const [homebuilders, setHomebuilders] = useState<Homebuilder[]>([])
  const [constructionTypes, setConstructionTypes] = useState<ConstructionType[]>([])
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])
  
  // Loading states
  const [loadingMasterData, setLoadingMasterData] = useState(false)

  useEffect(() => {
    if (show) {
      loadMasterData()
      // Set mode based on whether we're viewing an existing plot
      if (viewingPlot) {
        setMode('view')
        // Populate form data with existing plot data for editing
        setFormData({
          name: viewingPlot.name,
          streetAddress: viewingPlot.streetAddress || '',
          homebuilderId: viewingPlot.homebuilderId || '',
          constructionTypeId: viewingPlot.constructionTypeId || '',
          unitTypeId: viewingPlot.unitTypeId || '',
          numberOfBeds: viewingPlot.numberOfBeds || undefined,
          numberOfStoreys: viewingPlot.numberOfStoreys || undefined,
          squareFootage: viewingPlot.squareFootage || undefined,
          minimumSalePrice: viewingPlot.minimumSalePrice || undefined,
          description: viewingPlot.description || '',
          contractor: viewingPlot.contractor || '',
          notes: viewingPlot.notes || ''
        })
      } else {
        setMode('new')
      }
    } else {
      // Reset form when dialog closes
      setFormData({})
      setMode('new')
    }
  }, [show, viewingPlot])

  const loadMasterData = async () => {
    setLoadingMasterData(true)
    try {
      const [homebuildersRes, constructionTypesRes, unitTypesRes] = await Promise.all([
        fetch('/api/homebuilders'),
        fetch('/api/construction-types'),
        fetch('/api/unit-types')
      ])

      const [homebuildersData, constructionTypesData, unitTypesData] = await Promise.all([
        homebuildersRes.json(),
        constructionTypesRes.json(),
        unitTypesRes.json()
      ])

      setHomebuilders(homebuildersData)
      setConstructionTypes(constructionTypesData)
      setUnitTypes(unitTypesData)
    } catch (error) {
      console.error('Failed to load master data:', error)
    } finally {
      setLoadingMasterData(false)
    }
  }

  const handleSave = () => {
    if (mode === 'new' && !formData.name?.trim()) return
    if (mode === 'connect' && !formData.existingPlotId) return
    if (mode === 'view' && !formData.name?.trim()) return
    
    // Pass plot ID for updates in view mode
    const plotId = mode === 'view' ? viewingPlot?.id : undefined
    onSave(formData, plotId)
  }

  const updateFormData = (field: keyof PlotCreationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto ${
        mode === 'view' ? 'max-w-6xl' : 'max-w-2xl'
      }`}>
        {mode === 'view' ? (
          <div className="flex gap-6">
            {/* Left Column - Editable Plot Form */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Edit Plot Details</h3>
              
              {loadingMasterData ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {/* Plot Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || viewingPlot?.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Enter plot name..."
                      className="w-full p-2 border border-gray-300 rounded"
                      disabled={saving}
                    />
                  </div>

                  {/* Extended Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.streetAddress || viewingPlot?.streetAddress || ''}
                        onChange={(e) => updateFormData('streetAddress', e.target.value)}
                        placeholder="Enter street address..."
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Homebuilder
                      </label>
                      <select
                        value={formData.homebuilderId || viewingPlot?.homebuilderId || ''}
                        onChange={(e) => updateFormData('homebuilderId', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      >
                        <option value="">Select homebuilder...</option>
                        {homebuilders.map(builder => (
                          <option key={builder.id} value={builder.id}>
                            {builder.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Construction Type
                      </label>
                      <select
                        value={formData.constructionTypeId || viewingPlot?.constructionTypeId || ''}
                        onChange={(e) => updateFormData('constructionTypeId', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      >
                        <option value="">Select construction type...</option>
                        {constructionTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Type
                      </label>
                      <select
                        value={formData.unitTypeId || viewingPlot?.unitTypeId || ''}
                        onChange={(e) => updateFormData('unitTypeId', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      >
                        <option value="">Select unit type...</option>
                        {unitTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Beds
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.numberOfBeds || viewingPlot?.numberOfBeds || ''}
                        onChange={(e) => updateFormData('numberOfBeds', parseInt(e.target.value) || undefined)}
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Storeys
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numberOfStoreys || viewingPlot?.numberOfStoreys || ''}
                        onChange={(e) => updateFormData('numberOfStoreys', parseInt(e.target.value) || undefined)}
                        placeholder="1"
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Square Footage
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.squareFootage || viewingPlot?.squareFootage || ''}
                        onChange={(e) => updateFormData('squareFootage', parseFloat(e.target.value) || undefined)}
                        placeholder="0.0"
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Sale Price (£)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.minimumSalePrice || viewingPlot?.minimumSalePrice || ''}
                        onChange={(e) => updateFormData('minimumSalePrice', parseFloat(e.target.value) || undefined)}
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Basic Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description || viewingPlot?.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Enter description..."
                      className="w-full p-2 border border-gray-300 rounded"
                      rows={3}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contractor
                      </label>
                      <input
                        type="text"
                        value={formData.contractor || viewingPlot?.contractor || ''}
                        onChange={(e) => updateFormData('contractor', e.target.value)}
                        placeholder="Enter contractor name..."
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={formData.notes || viewingPlot?.notes || ''}
                        onChange={(e) => updateFormData('notes', e.target.value)}
                        placeholder="Enter any notes..."
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Construction Progress (Compact) */}
            <div className="w-80 flex-shrink-0 bg-gray-50 p-4 rounded-lg">
              <h5 className="text-base font-semibold text-gray-900 mb-4">Construction Progress</h5>
              {viewingPlot?.constructionProgress && viewingPlot.constructionProgress.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                  {viewingPlot.constructionType?.constructionStages
                    ?.sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((stage, index) => {
                      const progress = viewingPlot.constructionProgress?.find(
                        p => p.constructionStageId === stage.id
                      )
                      const completionPercentage = progress?.completionPercentage ?? 0
                      
                      return (
                        <div key={stage.id} className="bg-white border border-gray-200 rounded p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {index + 1}
                              </span>
                              <h6 className="font-medium text-gray-900 text-xs truncate">{stage.name}</h6>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div 
                              className="h-1.5 rounded-full" 
                              style={{ 
                                width: `${completionPercentage}%`, 
                                backgroundColor: stage.color || '#3b82f6' 
                              }}
                            ></div>
                          </div>
                          
                          {/* Key Dates - Compact */}
                          <div className="space-y-1 text-xs">
                            {progress?.plannedStartDate && (
                              <div className="flex justify-between">
                                <span className="text-blue-600 font-medium">Planned:</span>
                                <span className="text-gray-700">{new Date(progress.plannedStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                              </div>
                            )}
                            {progress?.actualStartDate && (
                              <div className="flex justify-between">
                                <span className="text-green-600 font-medium">Started:</span>
                                <span className="text-gray-700">{new Date(progress.actualStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                              </div>
                            )}
                            {progress?.actualEndDate && (
                              <div className="flex justify-between">
                                <span className="text-green-600 font-medium">Complete:</span>
                                <span className="text-gray-700">{new Date(progress.actualEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-500 text-sm text-center">No construction progress data available.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Create Plot Polygon</h3>
            <p className="text-sm text-gray-600 mb-4">
              Polygon with {coordinates.length} points
            </p>

            {/* Mode Selection */}
            <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setMode('new')}
                className={`px-4 py-2 rounded ${
                  mode === 'new' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Create New Plot
              </button>
              <button
                onClick={() => setMode('connect')}
                className={`px-4 py-2 rounded ${
                  mode === 'connect' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={existingPlotsWithoutPolygons.length === 0}
              >
                Connect to Existing Plot ({existingPlotsWithoutPolygons.length})
              </button>
            </div>
          </div>

        {loadingMasterData ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">

            {/* Plot Selection for Connect Mode */}
            {mode === 'connect' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Existing Plot
                </label>
                <select
                  value={formData.existingPlotId || ''}
                  onChange={(e) => updateFormData('existingPlotId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                >
                  <option value="">Choose a plot...</option>
                  {existingPlotsWithoutPolygons.map(plot => (
                    <option key={plot.id} value={plot.id}>
                      {plot.name} {plot.streetAddress ? `(${plot.streetAddress})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Plot Name for New Mode */}
            {mode === 'new' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter plot name..."
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>
            )}

            {/* Extended Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.streetAddress || ''}
                  onChange={(e) => updateFormData('streetAddress', e.target.value)}
                  placeholder="Enter street address..."
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Homebuilder
                </label>
                <select
                  value={formData.homebuilderId || ''}
                  onChange={(e) => updateFormData('homebuilderId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                >
                  <option value="">Select homebuilder...</option>
                  {homebuilders.map(builder => (
                    <option key={builder.id} value={builder.id}>
                      {builder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Construction Type
                </label>
                <select
                  value={formData.constructionTypeId || ''}
                  onChange={(e) => updateFormData('constructionTypeId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                >
                  <option value="">Select construction type...</option>
                  {constructionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Type
                </label>
                <select
                  value={formData.unitTypeId || ''}
                  onChange={(e) => updateFormData('unitTypeId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                >
                  <option value="">Select unit type...</option>
                  {unitTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Beds
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numberOfBeds || ''}
                  onChange={(e) => updateFormData('numberOfBeds', parseInt(e.target.value) || undefined)}
                  placeholder="0"
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Storeys
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfStoreys || ''}
                  onChange={(e) => updateFormData('numberOfStoreys', parseInt(e.target.value) || undefined)}
                  placeholder="1"
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Square Footage
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.squareFootage || ''}
                  onChange={(e) => updateFormData('squareFootage', parseFloat(e.target.value) || undefined)}
                  placeholder="0.0"
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Sale Price (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.minimumSalePrice || ''}
                  onChange={(e) => updateFormData('minimumSalePrice', parseFloat(e.target.value) || undefined)}
                  placeholder="0"
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Basic Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter description..."
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contractor
                </label>
                <input
                  type="text"
                  value={formData.contractor || ''}
                  onChange={(e) => updateFormData('contractor', e.target.value)}
                  placeholder="Enter contractor name..."
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Enter any notes..."
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          {mode === 'view' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={saving || !formData.name?.trim()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={
                  saving || 
                  (mode === 'new' && !formData.name?.trim()) ||
                  (mode === 'connect' && !formData.existingPlotId)
                }
              >
                {saving ? 'Saving...' : mode === 'new' ? 'Create Plot' : 'Connect Polygon'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}