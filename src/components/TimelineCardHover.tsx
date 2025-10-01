'use client'

import React, { useState } from 'react'

interface TimelineCardHoverProps {
  children: React.ReactNode
  cardType: 'programme' | 'planned' | 'actual'
  stageName: string
  startDate?: Date | null
  endDate?: Date | null
  version?: number
  stageColor: string
  className?: string
  planHistory?: any[] // All plan versions for showing previous versions
}

const TimelineCardHover: React.FC<TimelineCardHoverProps> = ({
  children,
  cardType,
  stageName,
  startDate,
  endDate,
  version,
  stageColor,
  className = '',
  planHistory = []
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true)
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isHovered) {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
  }

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'Not set'
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getCardTypeLabel = (type: string): string => {
    switch (type) {
      case 'programme': return 'Programme (Baseline)'
      case 'planned': return `Planned (v${version || 'N/A'})`
      case 'actual': return 'Actual Progress'
      default: return type
    }
  }

  const getCardTypeColor = (type: string): string => {
    switch (type) {
      case 'programme': return 'bg-blue-600'
      case 'planned': return 'bg-orange-600'
      case 'actual': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const calculateDuration = (start: Date | null | undefined, end: Date | null | undefined): string => {
    if (!start || !end) return 'Duration not available'
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    
    if (diffWeeks > 0) {
      const remainingDays = diffDays % 7
      return `${diffWeeks}w ${remainingDays}d (${diffDays} days)`
    }
    return `${diffDays} days`
  }

  const truncateNotes = (notes: string | null | undefined): string => {
    if (!notes) return ''
    
    // Split by lines and take first two lines
    const lines = notes.split('\n').slice(0, 2)
    let truncated = lines.join('\n')
    
    // If there are more lines or the text is very long, add ellipsis
    if (notes.split('\n').length > 2 || truncated.length > 100) {
      truncated = truncated.length > 100 ? truncated.substring(0, 100) + '...' : truncated + '...'
    }
    
    return truncated
  }

  return (
    <>
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {children}
      </div>
      
      {isHovered && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: mousePosition.x > window.innerWidth - 500 ? 'translateX(-100%) translateX(-20px)' : 'none'
          }}
        >
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-lg">
            {/* Header with card type */}
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stageColor }}
              />
              <div className="text-xs font-semibold text-gray-800">
                {getCardTypeLabel(cardType)}
              </div>
            </div>
            
            {/* Stage name */}
            <div className="text-sm font-medium text-gray-900 mb-2">
              {stageName}
            </div>
            
            {/* Current version info and notes for planned cards */}
            {cardType === 'planned' && version && planHistory && planHistory.length > 0 && (() => {
              const currentPlan = planHistory.find(plan => plan.versionNumber === version)
              return (
                <div className="grid grid-cols-[1fr,2fr] gap-4 text-xs mb-2">
                  {/* Left column: Dates and Duration */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-semibold text-xs text-white px-1 rounded"
                        style={{ backgroundColor: stageColor }}
                      >
                        v{version}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Current</span>
                    </div>
                    
                    <div className="space-y-1 text-gray-700">
                      <div>
                        <span className="font-medium text-gray-600">Start:</span> {formatDate(startDate)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">End:</span> {formatDate(endDate)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Duration:</span> {calculateDuration(startDate, endDate)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column: Notes */}
                  <div>
                    {currentPlan?.changeReason ? (
                      <div>
                        <span className="font-medium text-gray-600 block mb-1">Notes:</span>
                        <div className="leading-tight whitespace-pre-line text-gray-700">
                          {truncateNotes(currentPlan.changeReason)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic text-xs">No notes</div>
                    )}
                  </div>
                </div>
              )
            })()}
            
            {/* Date information for non-planned cards */}
            {cardType !== 'planned' && (
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Start:</span>
                  <span>{formatDate(startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">End:</span>
                  <span>{formatDate(endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{calculateDuration(startDate, endDate)}</span>
                </div>
              </div>
            )}
              
              {/* Previous version info for planned cards */}
              {cardType === 'planned' && version && planHistory && planHistory.length > 1 && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Previous Versions:</div>
                  <div className="space-y-2">
                    {planHistory
                      .filter(plan => plan.versionNumber !== version) // Exclude current version
                      .sort((a, b) => b.versionNumber - a.versionNumber)
                      .map((plan, index) => {
                        const planStartDate = plan.plannedStartDate ? new Date(plan.plannedStartDate) : null
                        const planEndDate = plan.plannedEndDate ? new Date(plan.plannedEndDate) : null
                        return (
                          <div key={plan.versionNumber} className="pl-2 border-l-2 border-gray-200">
                            <div className="grid grid-cols-[1fr,2fr] gap-4 text-xs">
                              {/* Left column: Dates and Duration */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="font-semibold text-xs text-white px-1 rounded opacity-70"
                                    style={{ backgroundColor: stageColor }}
                                  >
                                    v{plan.versionNumber}
                                  </span>
                                </div>
                                
                                <div className="space-y-1 text-gray-700">
                                  <div>
                                    <span className="font-medium text-gray-600">Start:</span> {formatDate(planStartDate)}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">End:</span> {formatDate(planEndDate)}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">Duration:</span> {calculateDuration(planStartDate, planEndDate)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right column: Notes */}
                              <div>
                                {plan.changeReason ? (
                                  <div>
                                    <span className="font-medium text-gray-600 block mb-1">Notes:</span>
                                    <div className="leading-tight whitespace-pre-line text-gray-600 text-xs">
                                      {truncateNotes(plan.changeReason)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 italic text-xs">No notes</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
              
            {/* Status info for actual cards */}
            {cardType === 'actual' && (
              <div className="flex justify-between border-t pt-1 mt-2">
                <span className="font-medium">Status:</span>
                <span className={`font-semibold ${endDate ? 'text-green-600' : 'text-orange-600'}`}>
                  {endDate ? 'Completed' : 'In Progress'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default TimelineCardHover