

export interface Homebuilder {
  id: string
  name: string
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
  website?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ConstructionType {
  id: string
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
  constructionStages?: ConstructionStage[]
}

export interface ConstructionStage {
  id: string
  constructionTypeId: string
  name: string
  description?: string | null
  sortOrder: number
  color: string
  createdAt: Date
  updatedAt: Date
  constructionType?: ConstructionType
}

export interface UnitType {
  id: string
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ConstructionPlanHistory {
  id: string
  constructionProgressId: string
  versionNumber: number
  plannedStartDate?: Date | null
  plannedEndDate?: Date | null
  reason?: string | null
  changedBy?: string | null
  createdAt: Date
}

export interface ConstructionProgress {
  id: string
  plotId: string
  constructionStageId: string
  
  // Programme dates (baseline - never change once set)
  programmeStartDate?: Date | null
  programmeEndDate?: Date | null
  
  // Current planned dates (latest plan - can change multiple times)
  plannedStartDate?: Date | null
  plannedEndDate?: Date | null
  currentPlanVersion: number
  
  // Actual dates (facts - cannot be changed once set)
  actualStartDate?: Date | null
  actualEndDate?: Date | null
  
  // Legacy field for percentage tracking
  completionPercentage: number
  
  notes?: string | null
  recordedBy?: string | null
  createdAt: Date
  updatedAt: Date
  constructionStage?: ConstructionStage
  planHistory?: ConstructionPlanHistory[]
}

export interface Plot {
  id: string
  mapId: string
  name: string
  latitude: number
  longitude: number
  coordinates?: [number, number][] | null
  description?: string | null
  startDate?: Date | null
  endDate?: Date | null
  contractor?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  // New fields
  streetAddress?: string | null
  homebuilderId?: string | null
  homebuilder?: Homebuilder | null
  constructionTypeId?: string | null
  constructionType?: ConstructionType | null
  unitTypeId?: string | null
  unitType?: UnitType | null
  numberOfBeds?: number | null
  numberOfStoreys?: number | null
  squareFootage?: number | null
  minimumSalePrice?: number | null
  // Relations
  constructionProgress?: ConstructionProgress[]
}

