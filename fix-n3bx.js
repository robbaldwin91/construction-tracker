const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixN3BXPlot() {
  console.log('🔧 Fixing n3-bx plot construction progress...')
  
  const TODAY = new Date('2025-10-01')
  
  // Get the n3-bx plot
  const plot = await prisma.plot.findFirst({
    where: { name: 'n3-bx' }
  })
  
  if (!plot) {
    console.log('❌ Plot n3-bx not found')
    return
  }
  
  // Get all stages for this plot
  const progressRecords = await prisma.constructionProgress.findMany({
    where: { plotId: plot.id },
    include: {
      constructionStage: true,
      planHistory: true
    },
    orderBy: { constructionStage: { sortOrder: 'asc' } }
  })
  
  console.log(`Found ${progressRecords.length} stages to fix`)
  
  // Define the corrected timeline for n3-bx
  const correctedTimeline = [
    {
      stage: 'Piling',
      programme: { start: '2025-08-10', end: '2025-08-20' },
      planned: { start: '2025-08-12', end: '2025-08-23' },
      actual: { start: '2025-08-12', end: '2025-08-22' },
      completion: 100,
      versions: [
        { v: 1, start: '2025-08-10', end: '2025-08-20' },
        { v: 2, start: '2025-08-12', end: '2025-08-22' },
        { v: 3, start: '2025-08-12', end: '2025-08-23' }
      ]
    },
    {
      stage: 'Oversite', 
      programme: { start: '2025-08-23', end: '2025-08-31' },
      planned: { start: '2025-08-25', end: '2025-09-03' },
      actual: { start: '2025-08-25', end: '2025-09-02' },
      completion: 100,
      versions: [
        { v: 1, start: '2025-08-23', end: '2025-08-31' },
        { v: 2, start: '2025-08-25', end: '2025-09-02' },
        { v: 3, start: '2025-08-25', end: '2025-09-03' }
      ]
    },
    {
      stage: 'Timber frame',
      programme: { start: '2025-09-01', end: '2025-09-13' },
      planned: { start: '2025-09-04', end: '2025-09-17' },
      actual: { start: '2025-09-04', end: '2025-09-16' },
      completion: 100,
      versions: [
        { v: 1, start: '2025-09-01', end: '2025-09-13' },
        { v: 2, start: '2025-09-03', end: '2025-09-16' },
        { v: 3, start: '2025-09-04', end: '2025-09-17' }
      ]
    },
    {
      stage: 'Brickwork',
      programme: { start: '2025-09-14', end: '2025-10-02' },
      planned: { start: '2025-09-18', end: '2025-10-08' },
      actual: { start: '2025-09-18', end: null }, // In progress, covers today
      completion: 65,
      versions: [
        { v: 1, start: '2025-09-14', end: '2025-10-02' },
        { v: 2, start: '2025-09-16', end: '2025-10-05' },
        { v: 3, start: '2025-09-18', end: '2025-10-07' },
        { v: 4, start: '2025-09-18', end: '2025-10-08' }
      ]
    },
    {
      stage: 'Roof tiling',
      programme: { start: '2025-10-03', end: '2025-10-09' },
      planned: { start: '2025-10-09', end: '2025-10-16' },
      actual: { start: null, end: null }, // Future
      completion: 0,
      versions: [
        { v: 1, start: '2025-10-03', end: '2025-10-09' },
        { v: 2, start: '2025-10-06', end: '2025-10-13' },
        { v: 3, start: '2025-10-09', end: '2025-10-16' }
      ]
    },
    {
      stage: 'Build',
      programme: { start: '2025-10-10', end: '2025-11-04' },
      planned: { start: '2025-10-17', end: '2025-11-12' },
      actual: { start: null, end: null }, // Future
      completion: 0,
      versions: [
        { v: 1, start: '2025-10-10', end: '2025-11-04' },
        { v: 2, start: '2025-10-14', end: '2025-11-09' },
        { v: 3, start: '2025-10-17', end: '2025-11-12' }
      ]
    }
  ]
  
  // Update each stage
  for (const progress of progressRecords) {
    const stageData = correctedTimeline.find(t => t.stage === progress.constructionStage.name)
    if (!stageData) {
      console.log(`⚠️  No correction data for stage: ${progress.constructionStage.name}`)
      continue
    }
    
    console.log(`🔧 Fixing ${stageData.stage}...`)
    
    // Update construction progress
    await prisma.constructionProgress.update({
      where: { id: progress.id },
      data: {
        programmeStartDate: new Date(stageData.programme.start),
        programmeEndDate: new Date(stageData.programme.end),
        plannedStartDate: new Date(stageData.planned.start),
        plannedEndDate: new Date(stageData.planned.end),
        actualStartDate: stageData.actual.start ? new Date(stageData.actual.start) : null,
        actualEndDate: stageData.actual.end ? new Date(stageData.actual.end) : null,
        completionPercentage: stageData.completion,
        currentPlanVersion: stageData.versions.length
      }
    })
    
    // Delete existing plan history
    await prisma.constructionPlanHistory.deleteMany({
      where: { constructionProgressId: progress.id }
    })
    
    // Create new plan history
    for (const version of stageData.versions) {
      await prisma.constructionPlanHistory.create({
        data: {
          constructionProgressId: progress.id,
          versionNumber: version.v,
          plannedStartDate: new Date(version.start),
          plannedEndDate: new Date(version.end),
          createdAt: new Date(Date.now() - (stageData.versions.length - version.v) * 14 * 24 * 60 * 60 * 1000)
        }
      })
    }
    
    console.log(`   ✅ Updated with ${stageData.versions.length} plan versions, ${stageData.completion}% complete`)
  }
  
  console.log('\n🎉 n3-bx plot timeline fixed!')
  console.log('📊 Timeline now shows:')
  console.log('   ✅ Piling, Oversite, Timber frame: COMPLETED')
  console.log('   🚧 Brickwork: IN PROGRESS (65% complete, covers today)')
  console.log('   ⏳ Roof tiling, Build: FUTURE with proper planned dates')
  console.log('   📋 All stages have 3-4 realistic plan versions')
  
  await prisma.$disconnect()
}

fixN3BXPlot().catch(console.error)