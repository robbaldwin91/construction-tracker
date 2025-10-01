const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createRealisticConstructionTimeline() {
  console.log('🗑️ Clearing all existing records...')
  
  // Delete all existing records
  await prisma.constructionPlanHistory.deleteMany({})
  await prisma.constructionProgress.deleteMany({})
  
  console.log('✅ All existing records deleted')
  console.log('🏗️ Creating realistic construction timeline with actuals covering today...')
  
  const TODAY = new Date('2025-10-01')
  
  // Get all plots and stages
  const plots = await prisma.plot.findMany({
    orderBy: { name: 'asc' }
  })
  
  const stages = await prisma.constructionStage.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  
  // Define realistic stage durations (in days)
  const stageDurations = {
    'Piling': 10,
    'Oversite': 8, 
    'Timber frame': 12,
    'Brickwork': 18,
    'Roof tiling': 6,
    'Build': 25
  }
  
  // Get unique stages 
  const uniqueStages = stages.filter((stage, index, self) => 
    index === self.findIndex(s => s.name === stage.name)
  ).sort((a, b) => a.sortOrder - b.sortOrder)
  
  console.log(`Creating timeline for ${plots.length} plots with ${uniqueStages.length} stages each`)
  
  // Calculate total project duration for centering
  const totalDuration = Object.values(stageDurations).reduce((sum, duration) => sum + duration, 0) + (uniqueStages.length - 1) // Add buffer days
  const halfDuration = Math.floor(totalDuration / 2)
  
  // Define different plot completion states - today is centered in each construction timeline
  const plotStates = [
    { 
      name: '28-05', 
      description: 'Mid construction - today centered in timeline',
      completedStages: 2, // Piling, Oversite done
      currentStage: 2, // Timber frame in progress (covers today)
      startOffset: -halfDuration - 5 // Center today with slight variation
    },
    {
      name: 'N3-B1',
      description: 'Mid construction - today centered in timeline', 
      completedStages: 2, // Piling, Oversite done
      currentStage: 2, // Timber frame in progress (covers today)
      startOffset: -halfDuration + 3 // Center today with slight variation
    },
    {
      name: 'n3-bx', 
      description: 'Mid construction - today centered in timeline',
      completedStages: 3, // Piling, Oversite, Timber frame done
      currentStage: 3, // Brickwork in progress (covers today)  
      startOffset: -halfDuration - 2 // Center today with slight variation
    }
  ]
  
  for (const plot of plots) {
    const plotState = plotStates.find(p => p.name === plot.name) || plotStates[0]
    console.log(`\nCreating timeline for Plot ${plot.name}: ${plotState.description}`)
    
    // Calculate plot start date
    const plotStartDate = new Date(TODAY)
    plotStartDate.setDate(plotStartDate.getDate() + plotState.startOffset)
    
    let currentDate = new Date(plotStartDate)
    
    for (let stageIndex = 0; stageIndex < uniqueStages.length; stageIndex++) {
      const stage = uniqueStages[stageIndex]
      const baseDuration = stageDurations[stage.name] || 14
      
      // Programme dates (original baseline)
      const programmeStartDate = new Date(currentDate)
      const programmeEndDate = new Date(currentDate)
      programmeEndDate.setDate(programmeEndDate.getDate() + baseDuration)
      
      // Planned dates (with some delays)
      const plannedStartDate = new Date(programmeStartDate)
      plannedStartDate.setDate(plannedStartDate.getDate() + Math.floor(Math.random() * 7)) // 0-6 days delay
      const plannedEndDate = new Date(plannedStartDate)
      plannedEndDate.setDate(plannedEndDate.getDate() + baseDuration + Math.floor(Math.random() * 5)) // 0-4 extra days
      
      // Actual dates logic
      let actualStartDate = null
      let actualEndDate = null
      let completionPercentage = 0
      
      if (stageIndex < plotState.completedStages) {
        // Completed stages
        actualStartDate = new Date(plannedStartDate)
        actualStartDate.setDate(actualStartDate.getDate() + Math.floor(Math.random() * 3)) // 0-2 days delay
        actualEndDate = new Date(actualStartDate)
        actualEndDate.setDate(actualEndDate.getDate() + baseDuration + Math.floor(Math.random() * 4)) // Some variation
        completionPercentage = 100
        
        console.log(`    ✅ ${stage.name}: COMPLETED (${actualStartDate.toISOString().split('T')[0]} → ${actualEndDate.toISOString().split('T')[0]})`)
        
      } else if (stageIndex === plotState.currentStage) {
        // Current stage in progress (MUST cover today)
        actualStartDate = new Date(plannedStartDate)
        actualStartDate.setDate(actualStartDate.getDate() + Math.floor(Math.random() * 2))
        
        // Make sure this stage spans across today
        const daysFromStart = Math.floor((TODAY - actualStartDate) / (1000 * 60 * 60 * 24))
        if (daysFromStart < 0) {
          // If start is in future, move it back to ensure it covers today
          actualStartDate = new Date(TODAY)
          actualStartDate.setDate(actualStartDate.getDate() - Math.floor(Math.random() * 5) - 3) // 3-8 days ago
        }
        
        // End date is in the future
        actualEndDate = null // Still in progress
        completionPercentage = Math.floor(Math.random() * 60) + 20 // 20-80% complete
        
        console.log(`    🚧 ${stage.name}: IN PROGRESS (${actualStartDate.toISOString().split('T')[0]} → ongoing, ${completionPercentage}%)`)
        
      } else {
        // Future stages
        actualStartDate = null
        actualEndDate = null
        completionPercentage = 0
        console.log(`    ⏳ ${stage.name}: FUTURE (${programmeStartDate.toISOString().split('T')[0]} → ${programmeEndDate.toISOString().split('T')[0]})`)
      }
      
      // Create construction progress record
      const progressRecord = await prisma.constructionProgress.create({
        data: {
          plotId: plot.id,
          constructionStageId: stage.id,
          programmeStartDate,
          programmeEndDate, 
          plannedStartDate,
          plannedEndDate,
          actualStartDate,
          actualEndDate,
          currentPlanVersion: Math.floor(Math.random() * 3) + 1, // 1-3 versions
          completionPercentage
        }
      })
      
      // Create plan history (2-3 versions per stage)
      const versions = Math.floor(Math.random() * 2) + 2 // 2-3 versions
      
      for (let version = 1; version <= versions; version++) {
        let versionStartDate = new Date(programmeStartDate)
        let versionEndDate = new Date(programmeEndDate)
        
        if (version > 1) {
          // Add progressive delays for later versions
          const delay = (version - 1) * (Math.floor(Math.random() * 7) + 3) // 3-9 days per version
          versionStartDate.setDate(versionStartDate.getDate() + delay)
          versionEndDate.setDate(versionEndDate.getDate() + delay + Math.floor(Math.random() * 3)) // Extra duration
        }
        
        // Final version matches current planned dates
        if (version === versions) {
          versionStartDate = new Date(plannedStartDate)
          versionEndDate = new Date(plannedEndDate)
        }
        
        await prisma.constructionPlanHistory.create({
          data: {
            constructionProgressId: progressRecord.id,
            versionNumber: version,
            plannedStartDate: versionStartDate,
            plannedEndDate: versionEndDate,
            createdAt: new Date(Date.now() - (versions - version) * 21 * 24 * 60 * 60 * 1000) // 3 weeks between versions
          }
        })
      }
      
      // Move to next stage
      currentDate = new Date(programmeEndDate)
      currentDate.setDate(currentDate.getDate() + 1) // 1 day buffer
    }
  }
  
  console.log('\n🎉 Realistic construction timeline created!')
  console.log('📅 All plots at different completion stages')
  console.log('🏗️ Every plot has at least one actual completion covering today (Oct 1, 2025)')
  console.log('📊 Timeline shows:')
  console.log('   📗 Programme cards: Original baseline schedules')
  console.log('   📘 Planned cards: 2-3 versions per stage showing replanning')  
  console.log('   📕 Actual cards: Real completions and work in progress')
  console.log('✅ Ready to view in the dashboard!')
}

createRealisticConstructionTimeline()
  .catch((e) => {
    console.error('❌ Error creating timeline:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })