import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { topology } from 'topojson-server'
type Params = { slug: string }

function calculatePlotProgress(constructionProgress: any[]): number {
  if (!constructionProgress || constructionProgress.length === 0) {
    return 0
  }

  // Find the most recent stage with actual progress (started or completed)
  let currentStage = null
  let lastCompletedStage = null

  // Sort stages by their typical order
  const sortedProgress = [...constructionProgress].sort((a, b) => {
    return a.constructionStageId.localeCompare(b.constructionStageId)
  })

  for (const progress of sortedProgress) {
    // If stage has been started (has actual start date)
    if (progress.actualStartDate) {
      currentStage = progress
      
      // If stage is also completed (has actual end date)
      if (progress.actualEndDate) {
        lastCompletedStage = progress
      }
    }
  }

  // Use current in-progress stage, or fall back to last completed stage
  const stageToUse = currentStage || lastCompletedStage

  if (!stageToUse) {
    return 0
  }

  return stageToUse.completionPercentage || 0
}

function calculatePlotStatus(constructionProgress: any[]): string {
  if (!constructionProgress || constructionProgress.length === 0) {
    return 'NOT_STARTED'
  }

  const hasStarted = constructionProgress.some(progress => progress.actualStartDate)
  if (!hasStarted) {
    return 'NOT_STARTED'
  }

  const allCompleted = constructionProgress.every(progress => 
    progress.actualEndDate || (progress.completionPercentage === 100)
  )
  if (allCompleted) {
    return 'COMPLETED'
  }

  return 'IN_PROGRESS'
}

function normaliseCoordinates(value: unknown): [number, number][] | null {
  if (!Array.isArray(value)) return null
  const points: [number, number][] = []
  for (const candidate of value) {
    if (Array.isArray(candidate) && candidate.length === 2) {
      const [x, y] = candidate
      if (typeof x === 'number' && typeof y === 'number') {
        points.push([x, y])
      }
    }
  }
  return points.length > 0 ? points : null
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { slug } = await params

    const map = await prisma.map.findUnique({
      where: { slug },
      include: {
        plots: {
          include: {
            constructionProgress: {
              include: {
                constructionStage: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!map) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 })
    }

    const features = map.plots
      .map((plot) => {
        const coordinates = normaliseCoordinates(plot.coordinates as unknown)
        if (!coordinates) return null

        const status = calculatePlotStatus(plot.constructionProgress || [])
        const progress = calculatePlotProgress(plot.constructionProgress || [])

        return {
          type: 'Feature' as const,
          properties: {
            id: plot.id,
            name: plot.name,
            status: status,
            progress: progress,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [coordinates],
          },
        }
      })
      .filter((feature): feature is {
        type: 'Feature'
        properties: {
          id: string
          name: string
          status: string
          progress: number
        }
        geometry: { type: 'Polygon'; coordinates: [number, number][][] }
      } => feature !== null)

    const geoJson = {
      type: 'FeatureCollection' as const,
      features,
    }

    const topologyPayload =
      features.length > 0 ? topology({ plots: geoJson }) : null

    return NextResponse.json({
      map: {
        id: map.id,
        name: map.name,
        slug: map.slug,
        imagePath: map.imagePath,
        naturalWidth: map.naturalWidth,
        naturalHeight: map.naturalHeight,
        createdAt: map.createdAt,
        updatedAt: map.updatedAt,
      },
      plots: map.plots.map((plot) => ({
        ...plot,
        coordinates: normaliseCoordinates(plot.coordinates as unknown),
      })),
      topojson: topologyPayload,
      geojson: geoJson,
    })
  } catch (error) {
    console.error('Error fetching map topology:', error)
    return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 })
  }
}
