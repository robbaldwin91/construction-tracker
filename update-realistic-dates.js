const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateConstructionDates() {
  console.log('🏗️ Updating construction dates with realistic variability...')
  
  const baseStartDate = new Date('2025-10-15')
  
  // Get all plots with their construction progress
  const plots = await prisma.plot.findMany({
    include: {
      constructionProgress: {
        include: {
          planHistory: true
        }
      }
    }
  })
  
  console.log(`Found ${plots.length} plots to update`)
  
  // Get all construction stages in order
  const stages = await prisma.constructionStage.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  
  // Define plot profiles with realistic distribution
  const profiles = [
    { type: 'smooth', replans: 0, delays: 'minimal', description: 'Dream project - on track' },
    { type: 'typical', replans: 1, delays: 'normal', description: 'Standard delays' },
    { type: 'problematic', replans: 3, delays: 'significant', description: 'Multiple issues' },
    { type: 'disaster', replans: 6, delays: 'major', description: 'Everything went wrong' },
    { type: 'early', replans: 1, delays: 'ahead', description: 'Ahead of schedule' }
  ]
  
  let plotStartOffset = 0
  
  for (const plot of plots) {
    console.log(`Updating Plot ${plot.name}...`)
    
    // Assign plot profiles with realistic distribution
    const rand = Math.random()
    let profile
    if (rand < 0.15) profile = profiles[0] // 15% smooth
    else if (rand < 0.55) profile = profiles[1] // 40% typical  
    else if (rand < 0.80) profile = profiles[2] // 25% problematic
    else if (rand < 0.95) profile = profiles[3] // 15% disaster
    else profile = profiles[4] // 5% early
    
    console.log(`  Profile: ${profile.type} (${profile.description})`)
    
    // Stagger plot start dates
    const plotStartDate = new Date(baseStartDate)
    plotStartDate.setDate(plotStartDate.getDate() + plotStartOffset)
    plotStartOffset += Math.floor(Math.random() * 21) + 7 // 1-4 weeks between plots
    
    let currentDate = new Date(plotStartDate)
    let cumulativeDelay = 0
    
    for (const progress of plot.constructionProgress) {
      const stage = stages.find(s => s.id === progress.stageId)
      if (!stage) continue
      
      const baseDuration = 14 // Default 2 weeks per stage
      let duration = baseDuration
      
      // Apply plot profile delays
      if (profile.delays === 'minimal') {
        duration += Math.floor(Math.random() * 2) // 0-1 days
      } else if (profile.delays === 'normal') {
        duration += Math.floor(Math.random() * 5) // 0-4 days
      } else if (profile.delays === 'significant') {
        duration += Math.floor(Math.random() * 10) + 2 // 2-11 days
        cumulativeDelay += Math.floor(Math.random() * 3) // Cumulative effects
      } else if (profile.delays === 'major') {
        duration += Math.floor(Math.random() * 20) + 5 // 5-24 days
        cumulativeDelay += Math.floor(Math.random() * 7) // Major cumulative effects
      } else if (profile.delays === 'ahead') {
        duration = Math.max(duration - Math.floor(Math.random() * 3), Math.floor(duration * 0.7)) // Faster
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
      
      // Actual dates - realistic completion patterns
      let actualStartDate = null
      let actualEndDate = null
      const today = new Date('2025-10-01')
      
      if (startDate < today) {
        // Stage should have started
        actualStartDate = new Date(startDate)
        if (profile.delays === 'ahead') {
          actualStartDate.setDate(actualStartDate.getDate() - Math.floor(Math.random() * 2))
        } else if (profile.delays !== 'minimal') {
          actualStartDate.setDate(actualStartDate.getDate() + Math.floor(Math.random() * 3))
        }
        
        // If end date has passed, it's complete
        if (endDate < today) {
          actualEndDate = new Date(actualStartDate)
          if (profile.delays === 'ahead') {
            actualEndDate.setDate(actualEndDate.getDate() + Math.max(duration - Math.floor(Math.random() * 4), Math.floor(duration * 0.8)))
          } else {
            actualEndDate.setDate(actualEndDate.getDate() + duration + Math.floor(Math.random() * 5))
          }
        }
      }
      
      // Update construction progress with better error handling
      try {
        await prisma.constructionProgress.update({
          where: { id: progress.id },
          data: {
            programmeStartDate,
            programmeEndDate,
            plannedStartDate,
            plannedEndDate,
            actualStartDate,
            actualEndDate,
            currentPlanVersion: totalVersions
          }
        })
        console.log(`    ✅ Updated stage ${stage.name}: ${programmeStartDate.toISOString().split('T')[0]} to ${programmeEndDate.toISOString().split('T')[0]}`)
      } catch (error) {
        console.error(`    ❌ Failed to update stage ${stage.name}:`, error)
      }
      
      // Delete existing plan history
      await prisma.constructionPlanHistory.deleteMany({
        where: { progressId: progress.id }
      })
      
      // Create realistic plan history with varying delays
      if (totalVersions > 0) {
        let versionStartDate = new Date(programmeStartDate)
        let versionEndDate = new Date(programmeEndDate)
        
        for (let version = 1; version <= totalVersions; version++) {
          if (version === 1) {
            // Version 1: Original programme dates
            versionStartDate = new Date(programmeStartDate)
            versionEndDate = new Date(programmeEndDate)
          } else {
            // Subsequent versions: Progressive delays
            const delayDays = Math.floor(Math.random() * 14) + 2 // 2-15 days delay per replan
            versionStartDate.setDate(versionStartDate.getDate() + delayDays)
            
            let newDuration = baseDuration
            if (profile.delays === 'significant' || profile.delays === 'major') {
              newDuration += Math.floor(Math.random() * 8) + 1 // 1-8 extra days
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
              progressId: progress.id,
              versionNumber: version,
              plannedStartDate: new Date(versionStartDate),
              plannedEndDate: new Date(versionEndDate),
              createdAt: new Date(Date.now() - (totalVersions - version) * 10 * 24 * 60 * 60 * 1000)
            }
          })
        }
      }
      
      // Move to next stage start date
      currentDate = new Date(programmeEndDate)
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }
  
  console.log('✅ Construction dates updated successfully!')
  console.log('📅 Projects now start from October 15, 2025 with realistic timelines')
  console.log('🏗️ Each plot has varying profiles:')
  console.log('   📗 15% Smooth projects (0 replans, minimal delays)')
  console.log('   📘 40% Typical projects (1 replan, normal delays)')  
  console.log('   📙 25% Problematic projects (3 replans, significant delays)')
  console.log('   📕 15% Disaster projects (6 replans, major delays)')
  console.log('   📔 5% Early projects (1 replan, ahead of schedule)')
  console.log('🔄 Plan history reflects real construction variability')
  console.log('⏰ Some stages complete, some in progress, some future')
}

updateConstructionDates()
  .catch((e) => {
    console.error('❌ Error updating construction dates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })