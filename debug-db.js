const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugDatabase() {
  console.log('🔍 Debugging database structure...')
  
  // Check plots
  const plots = await prisma.plot.findMany({
    select: { id: true, name: true }
  })
  console.log('Plots found:', plots)
  
  // Check stages  
  const stages = await prisma.constructionStage.findMany({
    select: { id: true, name: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' }
  })
  console.log('Stages found:', stages)
  
  // Check construction progress
  const progress = await prisma.constructionProgress.findMany({
    include: {
      plot: { select: { name: true } },
      constructionStage: { select: { name: true } }
    }
  })
  console.log('Construction Progress records:', progress.length)
  progress.forEach(p => {
    console.log(`  ${p.plot.name} - ${p.constructionStage.name}: Programme=${p.programmeStartDate}, Planned=${p.plannedStartDate}`)
  })
  
  await prisma.$disconnect()
}

debugDatabase().catch(console.error)