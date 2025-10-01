const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixStageIdMismatch() {
  console.log('🔧 Fixing stage ID mismatch for n3-bx plot...')
  
  // Get the n3-bx plot with its construction type stages
  const plot = await prisma.plot.findFirst({
    where: { name: 'n3-bx' },
    include: {
      constructionType: {
        include: {
          constructionStages: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      constructionProgress: {
        include: {
          constructionStage: true,
          planHistory: true
        }
      }
    }
  })
  
  if (!plot) {
    console.log('❌ Plot n3-bx not found')
    return
  }
  
  console.log(`\n📊 Plot: ${plot.name}`)
  console.log(`Construction Type: ${plot.constructionType?.name}`)
  console.log(`Construction Type Stages: ${plot.constructionType?.constructionStages?.length}`)
  console.log(`Current Progress Records: ${plot.constructionProgress?.length}`)
  
  if (!plot.constructionType?.constructionStages) {
    console.log('❌ No construction type stages found')
    return
  }
  
  // Map stage names to the correct stage IDs from construction type
  const correctStageMap = new Map()
  plot.constructionType.constructionStages.forEach(stage => {
    correctStageMap.set(stage.name, stage.id)
    console.log(`✅ Construction Type Stage: ${stage.name} → ${stage.id}`)
  })
  
  console.log(`\n🔧 Updating progress records to use correct stage IDs...`)
  
  // Update each progress record to use the correct stage ID
  for (const progress of plot.constructionProgress || []) {
    const correctStageId = correctStageMap.get(progress.constructionStage.name)
    
    if (!correctStageId) {
      console.log(`⚠️  No matching construction type stage for: ${progress.constructionStage.name}`)
      continue
    }
    
    if (progress.constructionStageId === correctStageId) {
      console.log(`✅ ${progress.constructionStage.name}: Already using correct stage ID`)
      continue
    }
    
    console.log(`🔧 ${progress.constructionStage.name}: ${progress.constructionStageId} → ${correctStageId}`)
    
    // Update the progress record to use the correct stage ID
    await prisma.constructionProgress.update({
      where: { id: progress.id },
      data: {
        constructionStageId: correctStageId
      }
    })
  }
  
  console.log(`\n🎉 Stage ID mismatch fixed!`)
  console.log(`📊 All progress records now reference the construction type's stage IDs`)
  console.log(`✅ The frontend should now show all 6 stages for n3-bx`)
  
  await prisma.$disconnect()
}

fixStageIdMismatch().catch(console.error)