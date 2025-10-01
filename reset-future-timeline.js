const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetAndCreateRealisticTimeline() {
  console.log('🗑️ Clearing all existing construction progress and plan history...')
  
  // Delete all existing records
  await prisma.constructionPlanHistory.deleteMany({})
  await prisma.constructionProgress.deleteMany({})
  
  console.log('✅ All existing records deleted')
  console.log('🏗️ Creating realistic future construction timeline...')
  
  // Base date - October 7, 2025 (1 week from today)
  const baseStartDate = new Date('2025-10-07')
  
  // Get all plots and stages
  const plots = await prisma.plot.findMany({
    orderBy: { name: 'asc' }
  })
  
  const stages = await prisma.constructionStage.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  
  console.log(`Found ${plots.length} plots and ${stages.length} unique stages`)
  
  // Define realistic stage durations (in days) for different construction types
  const stageDurations = {
    'Piling': 10,
    'Oversite': 8,
    'Timber frame': 12,
    'Brickwork': 18,
    'Roof tiling': 6,
    'Build': 25
  }
  
  // Define plot profiles with realistic distribution
  const profiles = [
    { type: 'smooth', replans: 0, delays: 'minimal', description: 'Dream project - on track' },
    { type: 'typical', replans: 2, delays: 'normal', description: 'Standard delays' },
    { type: 'problematic', replans: 4, delays: 'significant', description: 'Multiple issues' },
    { type: 'disaster', replans: 7, delays: 'major', description: 'Everything went wrong' },
    { type: 'early', replans: 1, delays: 'ahead', description: 'Ahead of schedule' }
  ]
  
  let plotStartOffset = 0
  
  for (const plot of plots) {
    console.log(`Creating timeline for Plot ${plot.name}...`)
    
    // Assign plot profiles with realistic distribution
    const rand = Math.random()
    let profile
    if (rand < 0.20) profile = profiles[0] // 20% smooth
    else if (rand < 0.60) profile = profiles[1] // 40% typical  
    else if (rand < 0.85) profile = profiles[2] // 25% problematic
    else if (rand < 0.98) profile = profiles[3] // 13% disaster
    else profile = profiles[4] // 2% early
    
    console.log(`  Profile: ${profile.type} (${profile.description})`)
    
    // Stagger plot start dates - 2-6 weeks between plots
    const plotStartDate = new Date(baseStartDate)
    plotStartDate.setDate(plotStartDate.getDate() + plotStartOffset)
    plotStartOffset += Math.floor(Math.random() * 28) + 14 // 2-6 weeks between plots
    
    let currentDate = new Date(plotStartDate)
    let cumulativeDelay = 0
    
    // Get unique stages for this plot's construction type
    const plotStages = stages.filter((stage, index, self) => 
      index === self.findIndex(s => s.name === stage.name)
    ).sort((a, b) => a.sortOrder - b.sortOrder)
    
    for (const stage of plotStages) {
      const baseDuration = stageDurations[stage.name] || 14
      let duration = baseDuration
      
      // Apply plot profile delays
      if (profile.delays === 'minimal') {
        duration += Math.floor(Math.random() * 2) // 0-1 days
      } else if (profile.delays === 'normal') {
        duration += Math.floor(Math.random() * 4) // 0-3 days
      } else if (profile.delays === 'significant') {
        duration += Math.floor(Math.random() * 8) + 2 // 2-9 days
        cumulativeDelay += Math.floor(Math.random() * 4) // Cumulative effects
      } else if (profile.delays === 'major') {
        duration += Math.floor(Math.random() * 15) + 5 // 5-19 days
        cumulativeDelay += Math.floor(Math.random() * 7) // Major cumulative effects
      } else if (profile.delays === 'ahead') {
        duration = Math.max(duration - Math.floor(Math.random() * 4), Math.floor(duration * 0.75)) // Faster
      }
      
      const startDate = new Date(currentDate)
      startDate.setDate(startDate.getDate() + cumulativeDelay)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + duration)
      
      // Programme dates (original baseline)
      const programmeStartDate = new Date(currentDate)
      const programmeEndDate = new Date(currentDate)
      programmeEndDate.setDate(programmeEndDate.getDate() + baseDuration)
      
      // Determine number of replans for this stage
      const maxReplans = profile.replans
      const stageReplans = Math.min(maxReplans, Math.floor(Math.random() * (maxReplans + 1)))
      const totalVersions = stageReplans + 1 // Original + replans
      
      // Current planned dates (final version)
      const plannedStartDate = new Date(startDate)
      const plannedEndDate = new Date(endDate)
      
      // No actual dates yet - everything is in the future
      const actualStartDate = null
      const actualEndDate = null
      
      console.log(`    ${stage.name}: ${programmeStartDate.toISOString().split('T')[0]} → ${programmeEndDate.toISOString().split('T')[0]} (v${totalVersions})`)
      
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
          currentPlanVersion: totalVersions,
          completionPercentage: 0
        }
      })
      
      // Create realistic plan history with progressive delays
      if (totalVersions > 0) {
        let versionStartDate = new Date(programmeStartDate)
        let versionEndDate = new Date(programmeEndDate)
        
        for (let version = 1; version <= totalVersions; version++) {
          if (version === 1) {
            // Version 1: Original programme dates
            versionStartDate = new Date(programmeStartDate)
            versionEndDate = new Date(programmeEndDate)
          } else {
            // Subsequent versions: Progressive delays and adjustments
            const delayDays = Math.floor(Math.random() * 21) + 3 // 3-23 days delay per replan
            versionStartDate.setDate(versionStartDate.getDate() + delayDays)
            
            let newDuration = baseDuration
            if (profile.delays === 'significant' || profile.delays === 'major') {
              newDuration += Math.floor(Math.random() * 10) + 2 // 2-11 extra days
            }
            
            versionEndDate = new Date(versionStartDate)
            versionEndDate.setDate(versionEndDate.getDate() + newDuration)
          }
          
          // Final version matches current planned dates
          if (version === totalVersions) {
            versionStartDate = new Date(plannedStartDate)
            versionEndDate = new Date(plannedEndDate)
          }
          
          await prisma.constructionPlanHistory.create({
            data: {
              constructionProgressId: progressRecord.id,
              versionNumber: version,
              plannedStartDate: new Date(versionStartDate),
              plannedEndDate: new Date(versionEndDate),
              createdAt: new Date(Date.now() - (totalVersions - version) * 14 * 24 * 60 * 60 * 1000) // Stagger creation dates by 2 weeks
            }
          })
        }
      }
      
      // Move to next stage start date with buffer
      currentDate = new Date(programmeEndDate)
      currentDate.setDate(currentDate.getDate() + 2) // 2-day buffer between stages
    }
    
    console.log(`  ✅ Created ${plotStages.length} stages for ${plot.name}`)
  }
  
  console.log('🎉 Realistic future construction timeline created!')
  console.log('📅 All projects start from October 7, 2025 onwards')
  console.log('🏗️ Plot profiles:')
  console.log('   📗 20% Smooth projects (0 replans, minimal delays)')
  console.log('   📘 40% Typical projects (2 replans, normal delays)')  
  console.log('   📙 25% Problematic projects (4 replans, significant delays)')
  console.log('   📕 13% Disaster projects (7 replans, major delays)')
  console.log('   📔 2% Early projects (1 replan, ahead of schedule)')
  console.log('🔄 Plan history shows realistic construction evolution')
  console.log('⏰ All dates are in the future - no actual completions yet')
}

resetAndCreateRealisticTimeline()
  .catch((e) => {
    console.error('❌ Error creating timeline:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })