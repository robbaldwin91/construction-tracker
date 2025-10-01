'use client'

import React from 'react'
import { Plot } from '@/types/plot'

interface MapPlotCardProps {
  plot: Plot
  position: [number, number]
  plotColor: string
  plotProgress: number
  currentStage: string
  onClick: () => void
}

export default function MapPlotCard({
  plot,
  position,
  plotColor,
  plotProgress,
  currentStage,
  onClick
}: MapPlotCardProps) {
  return (
    <div
      className="absolute cursor-pointer rounded-md shadow-md font-medium flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.03]"
      style={{
        left: position[0],
        top: position[1],
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        width: '80px', // Fixed width to accommodate "Timber Frame"
        background: 'rgba(255, 255, 255, 0.9)',
        border: `5px solid ${plotColor}`,
        borderImage: `linear-gradient(90deg, ${plotColor} ${plotProgress}%, rgba(200, 200, 200, 0.5) ${plotProgress}%) 1`,
        borderRadius: '6px',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <div className="px-1 py-0.5 w-full">
        <div className="text-[10px] text-gray-800 font-semibold leading-tight truncate" title={plot.name}>
          {plot.name}
        </div>
        <div className="text-[8px] text-gray-600">
          {plotProgress}%
        </div>
        <div className="text-[7px] text-gray-500 leading-tight truncate" title={currentStage}>
          {currentStage}
        </div>
      </div>
    </div>
  )
}