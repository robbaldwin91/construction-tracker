'use client'

import { useState, useEffect } from 'react'
import { Plot, Homebuilder, ConstructionType, UnitType } from '@/types/plot'

interface EnhancedPlotDialogProps {
  show: boolean
  onClose: () => void
  onSave: (plotData: PlotCreationData) => void
  coordinates: [number, number][]
  saving: boolean
  existingPlotsWithoutPolygons: Plot[]
  selectedPlot?: Plot
  mode?: 'create' | 'view'
  asSidebar?: boolean
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
  selectedPlot,
  mode: dialogMode = 'create',
  asSidebar = false
}: EnhancedPlotDialogProps) {
  const [mode, setMode] = useState<'new' | 'connect'>('new')
  const [formData, setFormData] = useState<PlotCreationData>({})
  const [plotNameEdited, setPlotNameEdited] = useState(false)
  const isViewMode = dialogMode === 'view' && !!selectedPlot
  
  // Master data
  const [homebuilders, setHomebuilders] = useState<Homebuilder[]>([])
  const [constructionTypes, setConstructionTypes] = useState<ConstructionType[]>([])
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])
  
  // Loading states
  const [loadingMasterData, setLoadingMasterData] = useState(false)
  const [existingPlotNames, setExistingPlotNames] = useState<string[]>([])

  useEffect(() => {
    if (show) {
      loadMasterData()
      
      // Initialize form data from selected plot in view mode
      if (isViewMode && selectedPlot) {
        setFormData({
          name: selectedPlot.name,
          streetAddress: selectedPlot.streetAddress || undefined,
          homebuilderId: selectedPlot.homebuilderId || undefined,
          constructionTypeId: selectedPlot.constructionTypeId || undefined,
          unitTypeId: selectedPlot.unitTypeId || undefined,
          numberOfBeds: selectedPlot.numberOfBeds || undefined,
          numberOfStoreys: selectedPlot.numberOfStoreys || undefined,
          squareFootage: selectedPlot.squareFootage || undefined,
          minimumSalePrice: selectedPlot.minimumSalePrice || undefined,
          description: selectedPlot.description || undefined,
          contractor: selectedPlot.contractor || undefined,
          notes: selectedPlot.notes || undefined,
        })
      }
    } else {
      // Reset form when dialog closes
      setFormData({})
      setMode('new')
      setPlotNameEdited(false)
    }
  }, [show, isViewMode, selectedPlot])

  const loadMasterData = async () => {
    setLoadingMasterData(true)
    try {
      const [homebuildersRes, constructionTypesRes, unitTypesRes, plotsRes] = await Promise.all([
        fetch('/api/homebuilders'),
        fetch('/api/construction-types'),
        fetch('/api/unit-types'),
        fetch('/api/plots')
      ])

      const [homebuildersData, constructionTypesData, unitTypesData, plotsData] = await Promise.all([
        homebuildersRes.json(),
        constructionTypesRes.json(),
        unitTypesRes.json(),
        plotsRes.json()
      ])

      setHomebuilders(homebuildersData)
      setConstructionTypes(constructionTypesData)
      setUnitTypes(unitTypesData)
      setExistingPlotNames(plotsData.map((plot: Plot) => plot.name.toLowerCase()))
    } catch (error) {
      console.error('Failed to load master data:', error)
    } finally {
      setLoadingMasterData(false)
    }
  }

  const handleSave = () => {
    if (mode === 'new') {
      if (!formData.name?.trim()) return
      if (existingPlotNames.includes(formData.name.toLowerCase().trim())) return
      if (!formData.homebuilderId) return
      if (!formData.constructionTypeId) return
    }
    if (mode === 'connect' && !formData.existingPlotId) return
    
    onSave(formData)
  }

  // Only check plot name if it's been edited in view mode or we're in create mode
  const shouldCheckPlotName = !isViewMode || plotNameEdited
  const isPlotNameTaken = shouldCheckPlotName && formData.name && existingPlotNames.includes(formData.name.toLowerCase().trim())

  const updateFormData = (field: keyof PlotCreationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Track if plot name was edited in view mode
    if (field === 'name' && isViewMode) {
      setPlotNameEdited(true)
    }
  }

  if (!show) return null

  if (asSidebar) {
    return (
      <div className="h-full bg-white p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {isViewMode ? `Plot Details: ${selectedPlot?.name}` : 'Create Plot Polygon'}
        </h3>
        {!isViewMode && (
          <p className="text-sm text-gray-600 mb-4">
            Polygon with {coordinates.length} points
          </p>
        )}

        {/* Mode Selection - only show in create mode */}
        {!isViewMode && (
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('new')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  mode === 'new' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Create New Plot
              </button>
              <button
                onClick={() => setMode('connect')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  mode === 'connect' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={existingPlotsWithoutPolygons.length === 0}
              >
                Connect ({existingPlotsWithoutPolygons.length})
              </button>
            </div>
          </div>
        )}

        {loadingMasterData ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-3">
            {/* Plot Selection for Connect Mode */}
            {mode === 'connect' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Existing Plot
                </label>
                <select
                  value={formData.existingPlotId || ''}
                  onChange={(e) => updateFormData('existingPlotId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm"
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
                  placeholder="Enter unique plot name..."
                  className={`w-full p-2 border rounded text-gray-900 placeholder-gray-400 text-sm ${
                    isPlotNameTaken ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={saving}
                />
                {isPlotNameTaken && (
                  <p className="text-red-600 text-xs mt-1">This plot name already exists. Please choose a unique name.</p>
                )}
              </div>
            )}

            {/* Required Fields */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Homebuilder *
                </label>
                <select
                  value={formData.homebuilderId || ''}
                  onChange={(e) => updateFormData('homebuilderId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm"
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
                  Construction Type *
                </label>
                <select
                  value={formData.constructionTypeId || ''}
                  onChange={(e) => updateFormData('constructionTypeId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm"
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
            </div>

            {/* Optional Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.streetAddress || ''}
                onChange={(e) => updateFormData('streetAddress', e.target.value)}
                placeholder="Enter street address..."
                className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 text-sm"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Type
              </label>
              <select
                value={formData.unitTypeId || ''}
                onChange={(e) => updateFormData('unitTypeId', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm"
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

            {/* Compact Numeric Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beds
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numberOfBeds || ''}
                  onChange={(e) => updateFormData('numberOfBeds', parseInt(e.target.value) || undefined)}
                  placeholder="0"
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 text-sm"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storeys
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfStoreys || ''}
                  onChange={(e) => updateFormData('numberOfStoreys', parseInt(e.target.value) || undefined)}
                  placeholder="1"
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 text-sm"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sq Ft
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.squareFootage || ''}
                  onChange={(e) => updateFormData('squareFootage', parseInt(e.target.value) || undefined)}
                  placeholder="0"
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 text-sm"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.minimumSalePrice || ''}
                  onChange={(e) => updateFormData('minimumSalePrice', parseFloat(e.target.value) || undefined)}
                  placeholder="0"
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 text-sm"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter description..."
                className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 text-sm"
                rows={2}
                disabled={saving}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            disabled={saving}
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
          {!isViewMode && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm"
              disabled={
                saving || 
                (mode === 'new' && (
                  !formData.name?.trim() || 
                  isPlotNameTaken || 
                  !formData.homebuilderId || 
                  !formData.constructionTypeId
                )) ||
                (mode === 'connect' && !formData.existingPlotId)
              }
            >
              {saving ? 'Saving...' : mode === 'new' ? 'Create Plot' : 'Connect Polygon'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {isViewMode ? `Plot Details: ${selectedPlot?.name}` : 'Create Plot Polygon'}
        </h3>
        {!isViewMode && (
          <p className="text-sm text-gray-600 mb-4">
            Polygon with {coordinates.length} points
          </p>
        )}

        {/* Mode Selection - only show in create mode */}
        {!isViewMode && (
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
        )}

        {loadingMasterData ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className={`${isViewMode ? 'grid grid-cols-2 gap-8' : ''}`}>
            {/* Left Column - Form */}
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
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
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
                    placeholder="Enter unique plot name..."
                    className={`w-full p-2 border rounded text-gray-900 placeholder-gray-400 ${
                      isPlotNameTaken ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={saving}
                  />
                  {isPlotNameTaken && (
                    <p className="text-red-600 text-sm mt-1">This plot name already exists. Please choose a unique name.</p>
                  )}
                </div>
              )}

              {/* Plot Name in View Mode */}
              {isViewMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plot Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter unique plot name..."
                    className={`w-full p-2 border rounded text-gray-900 placeholder-gray-400 ${
                      isPlotNameTaken ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={saving}
                  />
                  {isPlotNameTaken && (
                    <p className="text-red-600 text-sm mt-1">This plot name already exists. Please choose a unique name.</p>
                  )}
                </div>
              )}

              {/* Required Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homebuilder *
                  </label>
                  <select
                    value={formData.homebuilderId || ''}
                    onChange={(e) => updateFormData('homebuilderId', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
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
                    Construction Type *
                  </label>
                  <select
                    value={formData.constructionTypeId || ''}
                    onChange={(e) => updateFormData('constructionTypeId', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
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
              </div>

              {/* Optional Fields Row */}
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
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Type
                  </label>
                  <select
                    value={formData.unitTypeId || ''}
                    onChange={(e) => updateFormData('unitTypeId', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
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
              </div>

              {/* Numeric Fields Row */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.numberOfBeds || ''}
                    onChange={(e) => updateFormData('numberOfBeds', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storeys
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfStoreys || ''}
                    onChange={(e) => updateFormData('numberOfStoreys', parseInt(e.target.value) || undefined)}
                    placeholder="1"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sq Ft
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.squareFootage || ''}
                    onChange={(e) => updateFormData('squareFootage', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price (£)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.minimumSalePrice || ''}
                    onChange={(e) => updateFormData('minimumSalePrice', parseFloat(e.target.value) || undefined)}
                    placeholder="0"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400"
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
                  className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400"
                  rows={3}
                  disabled={saving}
                />
              </div>
            </div>
            
            {/* Right Column - Progression Report (only in view mode) */}
            {isViewMode && selectedPlot && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Construction Progress</h4>
                
                {selectedPlot.constructionProgress && selectedPlot.constructionProgress.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPlot.constructionProgress
                      .sort((a, b) => {
                        if (!a.constructionStage || !b.constructionStage) return 0
                        return a.constructionStage.sortOrder - b.constructionStage.sortOrder
                      })
                      .map((progress, index) => (
                        <div key={progress.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                {index + 1}
                              </span>
                              <h5 className="font-medium text-gray-900 text-sm">
                                {progress.constructionStage?.name || 'Unknown Stage'}
                              </h5>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {progress.completionPercentage || 0}%
                            </span>
                          </div>
                          
                          <div className="mb-2 h-1.5 w-full rounded-full bg-gray-200">
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${progress.completionPercentage || 0}%`,
                                backgroundColor: progress.constructionStage?.color || '#6b7280'
                              }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <div className="font-medium">Planned Start</div>
                              <div>{progress.plannedStartDate ? new Date(progress.plannedStartDate).toLocaleDateString() : 'Not set'}</div>
                            </div>
                            <div>
                              <div className="font-medium">Actual Start</div>
                              <div>{progress.actualStartDate ? new Date(progress.actualStartDate).toLocaleDateString() : 'Not started'}</div>
                            </div>
                            <div>
                              <div className="font-medium">Planned End</div>
                              <div>{progress.plannedEndDate ? new Date(progress.plannedEndDate).toLocaleDateString() : 'Not set'}</div>
                            </div>
                            <div>
                              <div className="font-medium">Actual End</div>
                              <div>{progress.actualEndDate ? new Date(progress.actualEndDate).toLocaleDateString() : 'Not completed'}</div>
                            </div>
                          </div>
                          
                          {progress.notes && (
                            <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700">
                              <div className="font-medium text-gray-900 mb-1">Notes:</div>
                              {progress.notes}
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    No construction progress data available
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={saving}
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
          {!isViewMode && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={
                saving || 
                (mode === 'new' && (
                  !formData.name?.trim() || 
                  isPlotNameTaken || 
                  !formData.homebuilderId || 
                  !formData.constructionTypeId
                )) ||
                (mode === 'connect' && !formData.existingPlotId)
              }
            >
              {saving ? 'Saving...' : mode === 'new' ? 'Create Plot' : 'Connect Polygon'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}