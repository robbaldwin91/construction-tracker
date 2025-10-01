# Update construction dates to start shortly after today with realistic timelines
# This script updates both ConstructionProgress and ConstructionPlanHistory tables

$scriptContent = @"
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateConstructionDates() {
  console.log('🏗️ Updating construction dates to realistic timeline starting after today...')
  
  // Base date - October 15, 2025 (2 weeks from today)
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
  
  // Define realistic stage durations (in days)
  const stageDurations = {
    'Foundations': 14,
    'Ground Floor Slab': 7,
    'Brickwork to DPC': 10,
    'First Floor Structure': 12,
    'Roof Structure': 10,
    'Roof Covering': 8,
    'External Walls': 21,
    'Internal Walls': 14,
    'First Fix': 21,
    'Plastering': 14,
    'Second Fix': 21,
    'Kitchen & Bathroom': 14,
    'Flooring': 7,
    'External Works': 10,
    'Final Inspections': 5
  }
  
  // Get all construction stages in order
  const stages = await prisma.constructionStage.findMany({
    orderBy: { order: 'asc' }
  })
  
  let plotStartOffset = 0
  
  for (const [plotIndex, plot] of plots.entries()) {
    console.log(`Updating Plot ${plot.name}...`)
    
    // Create realistic plot variability profiles
    const plotProfiles = [
      { type: 'smooth', replans: 0, delays: 'minimal', description: 'Dream project - on track' },
      { type: 'typical', replans: 1, delays: 'normal', description: 'Standard delays' },
      { type: 'problematic', replans: 3, delays: 'significant', description: 'Multiple issues' },
      { type: 'disaster', replans: 6, delays: 'major', description: 'Everything went wrong' },
      { type: 'early', replans: 1, delays: 'ahead', description: 'Ahead of schedule' }
    ]
    
    // Assign plot profiles with realistic distribution
    let plotProfile
    const profileRand = Math.random()
    if (profileRand < 0.15) plotProfile = plotProfiles[0] // 15% smooth
    else if (profileRand < 0.55) plotProfile = plotProfiles[1] // 40% typical  
    else if (profileRand < 0.80) plotProfile = plotProfiles[2] // 25% problematic
    else if (profileRand < 0.95) plotProfile = plotProfiles[3] // 15% disaster
    else plotProfile = plotProfiles[4] // 5% early
    
    console.log(`  Profile: ${plotProfile.type} (${plotProfile.description})`)
    
    // Stagger plot start dates with more variation
    const plotStartDate = new Date(baseStartDate)
    plotStartDate.setDate(plotStartDate.getDate() + plotStartOffset)
    plotStartOffset += Math.floor(Math.random() * 21) + 7 // 1-4 weeks between plots
    
    let currentDate = new Date(plotStartDate)
    let cumulativeDelay = 0
    
    for (const progress of plot.constructionProgress) {
      const stage = stages.find(s => s.id === progress.stageId)
      if (!stage) continue
      
      const baseDuration = stageDurations[stage.name] || 14
      let duration = baseDuration
      
      // Apply plot profile delays
      if (plotProfile.delays === 'minimal') {
        duration += Math.floor(Math.random() * 2) // 0-1 days
      } else if (plotProfile.delays === 'normal') {
        duration += Math.floor(Math.random() * 5) // 0-4 days
      } else if (plotProfile.delays === 'significant') {
        duration += Math.floor(Math.random() * 10) + 2 // 2-11 days
        cumulativeDelay += Math.floor(Math.random() * 3) // Cumulative effects
      } else if (plotProfile.delays === 'major') {
        duration += Math.floor(Math.random() * 20) + 5 // 5-24 days
        cumulativeDelay += Math.floor(Math.random() * 7) // Major cumulative effects
      } else if (plotProfile.delays === 'ahead') {
        duration = Math.max(duration - Math.floor(Math.random() * 3), Math.floor(duration * 0.7)) // Faster
      }
      
      const startDate = new Date(currentDate)
      startDate.setDate(startDate.getDate() + cumulativeDelay)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + duration)
      
      // Programme dates (original baseline - always the same)
      const programmeStartDate = new Date(currentDate)
      const programmeEndDate = new Date(currentDate)
      programmeEndDate.setDate(programmeEndDate.getDate() + baseDuration)
      
      // Determine number of replans for this stage
      const maxReplans = plotProfile.replans
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
        if (plotProfile.delays === 'ahead') {
          actualStartDate.setDate(actualStartDate.getDate() - Math.floor(Math.random() * 2))
        } else if (plotProfile.delays !== 'minimal') {
          actualStartDate.setDate(actualStartDate.getDate() + Math.floor(Math.random() * 3))
        }
        
        // If end date has passed, it's complete
        if (endDate < today) {
          actualEndDate = new Date(actualStartDate)
          if (plotProfile.delays === 'ahead') {
            actualEndDate.setDate(actualEndDate.getDate() + Math.max(duration - Math.floor(Math.random() * 4), Math.floor(duration * 0.8)))
          } else {
            actualEndDate.setDate(actualEndDate.getDate() + duration + Math.floor(Math.random() * 5))
          }
        }
      }
      
      // Update construction progress
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
            // Subsequent versions: Progressive delays and adjustments
            const delayDays = Math.floor(Math.random() * 14) + 2 // 2-15 days delay per replan
            versionStartDate.setDate(versionStartDate.getDate() + delayDays)
            
            let newDuration = baseDuration
            if (plotProfile.delays === 'significant' || plotProfile.delays === 'major') {
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
              createdAt: new Date(Date.now() - (totalVersions - version) * 10 * 24 * 60 * 60 * 1000) // Stagger creation dates
            }
          })
        }
      }
      
      // Move to next stage start date (with buffer)
      currentDate = new Date(programmeEndDate)
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }
  
  console.log('✅ Construction dates updated successfully!')
  console.log('📅 Projects now start from October 15, 2025 with realistic timelines')
  console.log('🏗️ Each plot has varying profiles:')
  console.log('   📗 15% Smooth projects (0 replans, minimal delays)')
  console.log('   📘 40% Typical projects (1 replan, normal delays)')  
  console.log('   � 25% Problematic projects (3 replans, significant delays)')
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
"@

# Write the JavaScript content to a temporary file
$scriptContent | Out-File -FilePath "update-dates.js" -Encoding UTF8

# Run the script
Write-Host "🏗️ Updating construction dates to realistic timeline..." -ForegroundColor Green
node update-dates.js

# Clean up
Remove-Item "update-dates.js" -Force

Write-Host "✅ Construction dates updated!" -ForegroundColor Green
Write-Host "📅 All projects now start from October 15, 2025" -ForegroundColor Yellow
Write-Host "🔄 Each plot has realistic stage durations and staggered start dates" -ForegroundColor Yellow