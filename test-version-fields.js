const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVersionFields() {
  try {
    console.log('Testing version fields...');
    
    // Get a sample construction progress record
    const progress = await prisma.constructionProgress.findFirst({
      include: {
        planHistory: {
          orderBy: { versionNumber: 'desc' }
        },
        plot: true,
        constructionStage: true
      }
    });

    if (progress) {
      console.log(`\nConstruction Progress for Plot: ${progress.plot.name} - ${progress.constructionStage.name}`);
      console.log(`Current Plan Version: ${progress.currentPlanVersion}`);
      console.log(`Programme Start: ${progress.programmeStartDate}`);
      console.log(`Programme End: ${progress.programmeEndDate}`);
      console.log(`Planned Start: ${progress.plannedStartDate}`);
      console.log(`Planned End: ${progress.plannedEndDate}`);
      console.log(`\nPlan History (${progress.planHistory.length} versions):`);
      
      progress.planHistory.forEach(history => {
        console.log(`  Version ${history.versionNumber}: ${history.plannedStartDate} to ${history.plannedEndDate}`);
        console.log(`    Reason: ${history.reason || 'N/A'}`);
        console.log(`    Changed by: ${history.changedBy || 'N/A'}`);
        console.log(`    Date: ${history.createdAt}`);
        console.log('');
      });
    } else {
      console.log('No construction progress records found');
    }
    
  } catch (error) {
    console.error('Error testing version fields:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVersionFields();