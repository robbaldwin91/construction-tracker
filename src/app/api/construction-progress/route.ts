import { NextRequest, NextResponse } from 'next/server'

// @ts-ignore - Prisma types not updated yet
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { plotId, stageId, completionPercentage } = body

    if (!plotId || !stageId || completionPercentage === undefined) {
      return NextResponse.json({ error: 'plotId, stageId, and completionPercentage are required' }, { status: 400 })
    }

    // Validate percentage is between 0-100
    const percentage = Math.max(0, Math.min(100, parseInt(completionPercentage)))

    // Find existing progress record or create new one
    const existingProgress = await prisma.constructionProgress.findUnique({
      where: {
        plot_stage_unique: {
          plotId,
          constructionStageId: stageId,
        },
      },
    })

    let progress

    if (existingProgress) {
      progress = await prisma.constructionProgress.update({
        where: { id: existingProgress.id },
        data: {
          completionPercentage: percentage,
          updatedAt: new Date(),
        },
      })
    } else {
      progress = await prisma.constructionProgress.create({
        data: {
          plotId,
          constructionStageId: stageId,
          completionPercentage: percentage,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, completionPercentage: percentage }, { status: 200 })
  } catch (error) {
    console.error('Error updating completion percentage:', error)
    return NextResponse.json({ error: 'Failed to update completion percentage' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      plotId,
      stageId,
      programmeStartDate,
      programmeEndDate,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      completionPercentage,
      notes,
      recordedBy,
      planChangeReason,
    } = body

    if (!plotId || !stageId) {
      return NextResponse.json({ error: 'plotId and stageId are required' }, { status: 400 })
    }

    // Find existing progress record or create new one
    const existingProgress = await prisma.constructionProgress.findUnique({
      where: {
        plot_stage_unique: {
          plotId,
          constructionStageId: stageId,
        },
      },
    })

    let progress

    if (existingProgress) {
      // Check if planned dates are changing to create history
      const planningChanged = 
        (plannedStartDate && plannedStartDate !== existingProgress.plannedStartDate?.toISOString()) ||
        (plannedEndDate && plannedEndDate !== existingProgress.plannedEndDate?.toISOString())

      // Update existing record and increment version if planning changed
      progress = await prisma.constructionProgress.update({
        where: { id: existingProgress.id },
        data: {
          programmeStartDate: programmeStartDate ? new Date(programmeStartDate) : undefined,
          programmeEndDate: programmeEndDate ? new Date(programmeEndDate) : undefined,
          plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : undefined,
          plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
          currentPlanVersion: planningChanged ? existingProgress.currentPlanVersion + 1 : undefined,
          actualStartDate: actualStartDate ? new Date(actualStartDate) : undefined,
          actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined,
          completionPercentage: completionPercentage !== undefined ? completionPercentage : undefined,
          notes: notes || undefined,
          recordedBy: recordedBy || undefined,
          updatedAt: new Date(),
        },
        include: {
          plot: true,
          constructionStage: true,
        },
      })

      // Create plan history if planning changed
      if (planningChanged && (plannedStartDate || plannedEndDate)) {
        await prisma.constructionPlanHistory.create({
          data: {
            constructionProgressId: progress.id,
            versionNumber: progress.currentPlanVersion,
            plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : null,
            plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : null,
            reason: planChangeReason || 'Plan updated',
            changedBy: recordedBy,
          },
        })
      }
    } else {
      // Create new progress record
      progress = await prisma.constructionProgress.create({
        data: {
          plotId,
          constructionStageId: stageId,
          programmeStartDate: programmeStartDate ? new Date(programmeStartDate) : null,
          programmeEndDate: programmeEndDate ? new Date(programmeEndDate) : null,
          plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : null,
          plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : null,
          actualStartDate: actualStartDate ? new Date(actualStartDate) : null,
          actualEndDate: actualEndDate ? new Date(actualEndDate) : null,
          completionPercentage: completionPercentage || 0,
          notes: notes || null,
          recordedBy: recordedBy || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          plot: true,
          constructionStage: true,
        },
      })

      // Create initial plan history if dates provided
      if (plannedStartDate || plannedEndDate) {
        await prisma.constructionPlanHistory.create({
          data: {
            constructionProgressId: progress.id,
            versionNumber: 1,
            plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : null,
            plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : null,
            reason: planChangeReason || 'Initial plan',
            changedBy: recordedBy,
          },
        })
      }
    }

    return NextResponse.json(progress, { status: 201 })
  } catch (error) {
    console.error('Error recording construction progress:', error)
    return NextResponse.json({ error: 'Failed to record construction progress' }, { status: 500 })
  }
}
