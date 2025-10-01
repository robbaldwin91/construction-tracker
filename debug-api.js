const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugAPIResponse() {
  console.log('🔍 Debugging API response for n3-bx plot...')
  
  // Simulate the API call exactly as the frontend does
  const plots = await prisma.plot.findMany({
    include: {
      homebuilder: true,
      constructionType: {
        include: {
          constructionStages: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      unitType: true,
      constructionProgress: {
        include: {
          constructionStage: true,
          planHistory: {
            orderBy: { versionNumber: 'desc' }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  const n3bxPlot = plots.find(p => p.name === 'n3-bx')
  
  if (!n3bxPlot) {
    console.log('❌ n3-bx plot not found in API response')
    return
  }
  
  console.log(`\n📊 API Response for n3-bx:`)
  console.log(`Name: ${n3bxPlot.name}`)
  console.log(`Construction Progress Records: ${n3bxPlot.constructionProgress.length}`)
  
  console.log('\n🏗️ Construction Progress Details:')
  n3bxPlot.constructionProgress.forEach((progress, index) => {
    console.log(`\n${index + 1}. Stage: ${progress.constructionStage.name}`)
    console.log(`   Stage ID: ${progress.constructionStage.id}`)
    console.log(`   Progress ID: ${progress.id}`)
    console.log(`   Programme: ${progress.programmeStartDate} → ${progress.programmeEndDate}`)
    console.log(`   Planned: ${progress.plannedStartDate} → ${progress.plannedEndDate}`)
    console.log(`   Actual: ${progress.actualStartDate} → ${progress.actualEndDate}`)
    console.log(`   Plan History: ${progress.planHistory.length} versions`)
    
    if (progress.planHistory.length > 0) {
      console.log(`   Versions: ${progress.planHistory.map(p => `v${p.versionNumber}`).join(', ')}`)
    }
  })
  
  console.log('\n🎯 Construction Type Stages:')
  if (n3bxPlot.constructionType?.constructionStages) {
    n3bxPlot.constructionType.constructionStages.forEach((stage, index) => {
      console.log(`${index + 1}. ${stage.name} (ID: ${stage.id}, Sort: ${stage.sortOrder})`)
    })
  }
  
  // Check if there are any orphaned stages
  const allStages = await prisma.constructionStage.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  
  console.log('\n📋 All Construction Stages in DB:')
  allStages.forEach((stage, index) => {
    const hasProgress = n3bxPlot.constructionProgress.some(p => p.constructionStage.id === stage.id)
    console.log(`${index + 1}. ${stage.name} (ID: ${stage.id}) - ${hasProgress ? '✅ Has Progress' : '❌ No Progress'}`)
  })
  
  await prisma.$disconnect()
}

debugAPIResponse().catch(console.error)