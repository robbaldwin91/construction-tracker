import React from 'react'

interface TimelineWeek {
  weekStart: Date
  weekEnd: Date
  weekNumber: number
  year: number
  weekLabel: string
  dateLabel: string
}

interface TimelineCardProps {
  startDate: Date | null
  endDate: Date | null
  color: string
  opacity?: number
  timelineWeeks: TimelineWeek[]
  className?: string
  children?: React.ReactNode
  height?: string
  zIndex?: number
}

const TimelineCard: React.FC<TimelineCardProps> = ({ 
  startDate, 
  endDate, 
  color, 
  opacity = 0.7, 
  timelineWeeks,
  className = '',
  children,
  height = 'h-14',
  zIndex = 5
}) => {
  if (!startDate || !endDate || timelineWeeks.length === 0) return null

  // Calculate start position using same logic as current date indicator
  const timelineStartDate = timelineWeeks[0].weekStart
  const timelineEndDate = timelineWeeks[timelineWeeks.length - 1].weekEnd
  
  // Check if dates are within timeline range
  if (startDate > timelineEndDate || endDate < timelineStartDate) return null

  // Calculate pixel positions (48px per week like the timeline cells)
  const startOffsetMs = Math.max(0, startDate.getTime() - timelineStartDate.getTime())
  const startWeekOffset = startOffsetMs / (7 * 24 * 60 * 60 * 1000)
  const startPixels = startWeekOffset * 48
  
  // Calculate end position
  const endOffsetMs = Math.min(endDate.getTime() - timelineStartDate.getTime(), timelineEndDate.getTime() - timelineStartDate.getTime())
  const endWeekOffset = endOffsetMs / (7 * 24 * 60 * 60 * 1000)
  const endPixels = endWeekOffset * 48
  
  const cardWidth = Math.max(endPixels - startPixels, 4) // Minimum 4px width

  return (
    <div 
      className={`absolute ${className.includes('top-') ? '' : 'top-1'} ${height} rounded ${className}`}
      style={{
        left: `${startPixels}px`,
        width: `${cardWidth}px`,
        backgroundColor: color,
        opacity: opacity,
        zIndex: zIndex
      }}
    >
      {children}
    </div>
  )
}

export default TimelineCard