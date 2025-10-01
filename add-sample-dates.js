const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSampleDates() {
  try {
    console.log('🗓️  Adding sample planned dates to construction progress...\n')

    // Get all plots with their stages
    const plots = await prisma.plot.findMany({
      include: {
        constructionType: {
          include: {
            constructionStages: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    })

    let addedCount = 0

    for (const plot of plots) {
      if (!plot.constructionType?.constructionStages) continue

      console.log(`📋 Plot: ${plot.name} (${plot.constructionType.name})`)

      let currentDate = new Date('2025-10-01') // Start date

      for (const stage of plot.constructionType.constructionStages) {
        // Calculate duration based on stage (different stages take different times)
        const duration = stage.sortOrder === 1 ? 7 : // Piling: 1 week
                        stage.sortOrder === 2 ? 10 : // Oversite: 1.5 weeks  
                        stage.sortOrder === 3 ? 14 : // Main work: 2 weeks
                        stage.sortOrder === 4 ? 7 :  // Roof: 1 week
                        stage.sortOrder === 5 ? 10 : // Brickwork: 1.5 weeks
                        7 // Build complete: 1 week

        const startDate = new Date(currentDate)
        const endDate = new Date(currentDate)
        endDate.setDate(endDate.getDate() + duration)

        // Create or update construction progress
        await prisma.constructionProgress.upsert({
          where: {
            plot_stage_unique: {
              plotId: plot.id,
              constructionStageId: stage.id
            }
          },
          update: {
            plannedStartDate: startDate,
            plannedEndDate: endDate
          },
          create: {
            plotId: plot.id,
            constructionStageId: stage.id,
            plannedStartDate: startDate,
            plannedEndDate: endDate,
            completionPercentage: 0,
            notes: `Initial plan for ${stage.name}`,
            recordedBy: 'System'
          }
        })

        // Add plan history
        await prisma.constructionPlanHistory.create({
          data: {
            constructionProgressId: (await prisma.constructionProgress.findUnique({
              where: {
                plot_stage_unique: {
                  plotId: plot.id,
                  constructionStageId: stage.id
                }
              }
            }))?.id,
            plannedStartDate: startDate,
            plannedEndDate: endDate,
            reason: 'Initial project timeline',
            changedBy: 'Project Manager'
          }
        })

        console.log(`   ✅ ${stage.name}: ${startDate.toDateString()} → ${endDate.toDateString()}`)

        // Move to next stage start date (with 2 day gap)
        currentDate = new Date(endDate)
        currentDate.setDate(currentDate.getDate() + 2)
        addedCount++
      }

      console.log('')
    }

    // Add some actual dates for demo (mark first few stages as started/completed)
    console.log('📅 Adding some actual dates for demo...\n')

    const firstPlot = plots[0]
    if (firstPlot?.constructionType?.constructionStages) {
      const firstStage = firstPlot.constructionType.constructionStages[0]
      
      await prisma.constructionProgress.update({
        where: {
          plot_stage_unique: {
            plotId: firstPlot.id,
            constructionStageId: firstStage.id
          }
        },
        data: {
          actualStartDate: new Date('2025-09-28'), // Started early
          completionPercentage: 75
        }
      })

      console.log(`✅ ${firstPlot.name} - ${firstStage.name}: Started on Sep 28 (75% complete)`)

      // Mark second stage as started but behind schedule
      if (firstPlot.constructionType.constructionStages[1]) {
        const secondStage = firstPlot.constructionType.constructionStages[1]
        
        await prisma.constructionProgress.update({
          where: {
            plot_stage_unique: {
              plotId: firstPlot.id,
              constructionStageId: secondStage.id
            }
          },
          data: {
            actualStartDate: new Date('2025-10-03'), // Started late
            completionPercentage: 30
          }
        })

        console.log(`⚠️  ${firstPlot.name} - ${secondStage.name}: Started late on Oct 3 (30% complete)`)
      }
    }

    console.log(`\n🎉 Added planned dates for ${addedCount} stage entries!`)
    console.log('The matrix dashboard should now show the timeline with:')
    console.log('  - Grey: Not started')
    console.log('  - Green: On time')
    console.log('  - Yellow: Slight delay')
    console.log('  - Red: Major delay/overdue')
    console.log('  - Blue: Completed')

  } catch (error) {
    console.error('❌ Error adding sample dates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleDates()