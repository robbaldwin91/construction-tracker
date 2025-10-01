const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDates() {
  console.log('Checking database dates...')
  
  const progress = await prisma.constructionProgress.findFirst({
    include: { 
      planHistory: {
        orderBy: { versionNumber: 'asc' }
      }
    }
  })
  
  if (progress) {
    console.log('✅ Found construction progress data:')
    console.log('Programme Start:', progress.programmeStartDate)
    console.log('Planned Start:', progress.plannedStartDate)
    console.log('Actual Start:', progress.actualStartDate)
    console.log('Current Plan Version:', progress.currentPlanVersion)
    console.log('Plan History Count:', progress.planHistory?.length || 0)
    
    if (progress.planHistory && progress.planHistory.length > 0) {
      console.log('Plan History Versions:')
      progress.planHistory.forEach(p => {
        console.log(`  v${p.versionNumber}: ${p.plannedStartDate} - ${p.plannedEndDate}`)
      })
    }
  } else {
    console.log('❌ No construction progress found')
  }
  
  await prisma.$disconnect()
}

checkDates().catch(console.error)