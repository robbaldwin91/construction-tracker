import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const unitTypes = await prisma.unitType.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(unitTypes)
  } catch (error) {
    console.error('Error fetching unit types:', error)
    return NextResponse.json({ error: 'Failed to fetch unit types' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const unitType = await prisma.unitType.create({
      data: {
        name: body.name,
        description: body.description,
      }
    })

    return NextResponse.json(unitType, { status: 201 })
  } catch (error) {
    console.error('Error creating unit type:', error)
    return NextResponse.json({ error: 'Failed to create unit type' }, { status: 500 })
  }
}