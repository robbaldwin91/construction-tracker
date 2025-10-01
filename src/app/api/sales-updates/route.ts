import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plotId = searchParams.get('plotId')

    const where = plotId ? { plotId } : {}

    const salesUpdates = await prisma.salesUpdate.findMany({
      where,
      include: {
        plot: {
          select: {
            name: true,
            id: true
          }
        },
        plannedDeliveryDates: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { plotId: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(salesUpdates)
  } catch (error) {
    console.error('Error fetching sales updates:', error)
    return NextResponse.json({ error: 'Failed to fetch sales updates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const salesUpdate = await prisma.salesUpdate.create({
      data: {
        plotId: body.plotId,
        programmedDeliveryDate: body.programmedDeliveryDate ? new Date(body.programmedDeliveryDate) : null,
        actualDeliveryDate: body.actualDeliveryDate ? new Date(body.actualDeliveryDate) : null,
        notes: body.notes,
        createdBy: body.createdBy,
      },
      include: {
        plot: {
          select: {
            name: true,
            id: true
          }
        },
        plannedDeliveryDates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // If there are planned delivery dates, create them
    if (body.plannedDeliveryDates && Array.isArray(body.plannedDeliveryDates)) {
      await Promise.all(
        body.plannedDeliveryDates.map((plannedDate: any) =>
          prisma.plannedDeliveryDate.create({
            data: {
              salesUpdateId: salesUpdate.id,
              plannedDate: new Date(plannedDate.plannedDate),
              reason: plannedDate.reason,
            }
          })
        )
      )

      // Fetch the updated sales update with planned dates
      const updatedSalesUpdate = await prisma.salesUpdate.findUnique({
        where: { id: salesUpdate.id },
        include: {
          plot: {
            select: {
              name: true,
              id: true
            }
          },
          plannedDeliveryDates: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      return NextResponse.json(updatedSalesUpdate, { status: 201 })
    }

    return NextResponse.json(salesUpdate, { status: 201 })
  } catch (error) {
    console.error('Error creating sales update:', error)
    return NextResponse.json({ error: 'Failed to create sales update' }, { status: 500 })
  }
}