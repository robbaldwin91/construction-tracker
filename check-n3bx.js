const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkN3BXPlot() {
  console.log('🔍 Checking n3-bx plot construction progress...')
  
  const plot = await prisma.plot.findFirst({
    where: { name: 'n3-bx' },
    include: {
      constructionProgress: {
        include: {
          constructionStage: true,
          planHistory: {
            orderBy: { versionNumber: 'asc' }
          }
        },
        orderBy: { constructionStage: { sortOrder: 'asc' } }
      }
    }
  })
  
  if (!plot) {
    console.log('❌ Plot n3-bx not found')
    return
  }
  
  console.log(`\n📊 Plot: ${plot.name}`)
  console.log(`Found ${plot.constructionProgress.length} construction stages`)
  
  plot.constructionProgress.forEach((progress, index) => {
    console.log(`\n${index + 1}. ${progress.constructionStage.name}:`)
    console.log(`   Programme: ${progress.programmeStartDate?.toISOString().split('T')[0]} → ${progress.programmeEndDate?.toISOString().split('T')[0]}`)
    console.log(`   Planned: ${progress.plannedStartDate?.toISOString().split('T')[0]} → ${progress.plannedEndDate?.toISOString().split('T')[0]}`)
    console.log(`   Actual: ${progress.actualStartDate?.toISOString().split('T')[0]} → ${progress.actualEndDate?.toISOString().split('T')[0] || 'ongoing'}`)
    console.log(`   Completion: ${progress.completionPercentage}%`)
    console.log(`   Plan versions: ${progress.planHistory.length}`)
    
    if (progress.planHistory.length > 0) {
      progress.planHistory.forEach(plan => {
        console.log(`     v${plan.versionNumber}: ${plan.plannedStartDate?.toISOString().split('T')[0]} → ${plan.plannedEndDate?.toISOString().split('T')[0]}`)
      })
    }
  })
  
  await prisma.$disconnect()
}

checkN3BXPlot().catch(console.error)