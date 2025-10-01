'use client'

import React, { useState, useRef, useEffect } from 'react'

interface DateRangePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onDateChange: (startDate: Date | null, endDate: Date | null) => void
  onClose: () => void
  className?: string
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  onClose,
  className = ''
}: DateRangePickerProps) {
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate || null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate || null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSelectingEnd, setIsSelectingEnd] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false
    return date1.toDateString() === date2.toDateString()
  }

  const isInRange = (date: Date) => {
    if (!tempStartDate || !tempEndDate) return false
    return date >= tempStartDate && date <= tempEndDate
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (!isSelectingEnd && !tempStartDate) {
      // First click - set start date
      setTempStartDate(clickedDate)
      setIsSelectingEnd(true)
    } else if (isSelectingEnd) {
      // Second click - set end date
      if (tempStartDate && clickedDate < tempStartDate) {
        // If end date is before start date, swap them
        setTempEndDate(tempStartDate)
        setTempStartDate(clickedDate)
      } else {
        setTempEndDate(clickedDate)
      }
      setIsSelectingEnd(false)
    } else {
      // Reset and start over
      setTempStartDate(clickedDate)
      setTempEndDate(null)
      setIsSelectingEnd(true)
    }
  }

  const handleSave = () => {
    onDateChange(tempStartDate, tempEndDate)
    onClose()
  }

  const handleClear = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    setIsSelectingEnd(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isStart = isSameDay(date, tempStartDate)
      const isEnd = isSameDay(date, tempEndDate)
      const inRange = isInRange(date)
      const isToday = isSameDay(date, new Date())

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            h-8 w-8 text-sm rounded hover:bg-blue-100 transition-colors
            ${isStart || isEnd ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
            ${inRange && !isStart && !isEnd ? 'bg-blue-100 text-blue-800' : ''}
            ${isToday && !isStart && !isEnd && !inRange ? 'bg-gray-200 font-semibold' : ''}
            ${!isStart && !isEnd && !inRange && !isToday ? 'text-gray-700 hover:text-gray-900' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 ${className}`}
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <h3 className="font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {renderCalendar()}
      </div>

      {/* Selected Range Display */}
      {(tempStartDate || tempEndDate) && (
        <div className="mb-4 text-sm text-gray-600">
          <div>Start: {tempStartDate?.toLocaleDateString() || 'Not selected'}</div>
          <div>End: {tempEndDate?.toLocaleDateString() || 'Not selected'}</div>
          {isSelectingEnd && <div className="text-blue-600">Click to select end date</div>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleClear}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear
        </button>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}