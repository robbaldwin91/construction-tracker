import { NextRequest, NextResponse } from 'next/server'

// @ts-ignore - Prisma types not updated yet
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching plots...')
    
    const plots = await prisma.plot.findMany({
      include: {
        homebuilder: true,
        constructionType: {
          include: {
            constructionStages: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        unitType: true,
        constructionProgress: {
          include: {
            constructionStage: true,
            planHistory: {
              orderBy: { versionNumber: 'desc' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    console.log(`Found ${plots.length} plots`)
    return NextResponse.json(plots)
  } catch (error) {
    console.error('Error fetching plots:', error)
    return NextResponse.json({ error: 'Failed to fetch plots', details: String(error) }, { status: 500 })
  }
}
