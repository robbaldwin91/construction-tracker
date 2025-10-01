import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const homebuilders = await prisma.homebuilder.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(homebuilders)
  } catch (error) {
    console.error('Error fetching homebuilders:', error)
    return NextResponse.json({ error: 'Failed to fetch homebuilders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const homebuilder = await prisma.homebuilder.create({
      data: {
        name: body.name,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        address: body.address,
        website: body.website,
      }
    })

    return NextResponse.json(homebuilder, { status: 201 })
  } catch (error) {
    console.error('Error creating homebuilder:', error)
    return NextResponse.json({ error: 'Failed to create homebuilder' }, { status: 500 })
  }
}