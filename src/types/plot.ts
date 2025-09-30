export type PlotStatus = 'completed' | 'in-progress' | 'not-started' | 'on-hold'

export interface Plot {
  id: string
  name: string
  status: PlotStatus
  progress: number
  coordinates: [number, number]
  description?: string
  startDate?: string
  endDate?: string
  contractor?: string
  notes?: string
}