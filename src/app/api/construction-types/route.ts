import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const constructionTypes = await prisma.constructionType.findMany({
      include: {
        constructionStages: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(constructionTypes)
  } catch (error) {
    console.error('Error fetching construction types:', error)
    return NextResponse.json({ error: 'Failed to fetch construction types' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const constructionType = await prisma.constructionType.create({
      data: {
        name: body.name,
        description: body.description,
      },
      include: {
        constructionStages: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(constructionType, { status: 201 })
  } catch (error) {
    console.error('Error creating construction type:', error)
    return NextResponse.json({ error: 'Failed to create construction type' }, { status: 500 })
  }
}