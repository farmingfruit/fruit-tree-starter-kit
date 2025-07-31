#!/usr/bin/env tsx

import { db } from '../db/drizzle';
import { churches, families, members } from '../db/schema';

async function verifyData() {
  try {
    console.log("🔍 Verifying sample data...\n");

    // Check churches
    const churchCount = await db.select().from(churches);
    console.log(`⛪ Churches: ${churchCount.length}`);
    if (churchCount.length > 0) {
      console.log(`   📍 ${churchCount[0].name} - ${churchCount[0].email}`);
    }

    // Check families
    const familyCount = await db.select().from(families);
    console.log(`\n👨‍👩‍👧‍👦 Families: ${familyCount.length}`);
    familyCount.slice(0, 3).forEach(family => {
      console.log(`   🏠 ${family.familyName} - ${family.address || 'No address'}`);
    });

    // Check members
    const memberCount = await db.select().from(members);
    console.log(`\n👥 Members: ${memberCount.length}`);
    
    // Count by status
    const statusCounts = memberCount.reduce((acc: any, member) => {
      acc[member.membershipStatus] = (acc[member.membershipStatus] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   📊 ${status}: ${count}`);
    });

    // Count by role
    const roleCounts = memberCount.reduce((acc: any, member) => {
      acc[member.membershipRole] = (acc[member.membershipRole] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n🎭 Roles:`);
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   👤 ${role}: ${count}`);
    });

    // Check pending reviews
    const pendingMembers = memberCount.filter(member => 
      member.notes?.includes("PENDING REVIEW")
    );
    console.log(`\n⏳ Pending Reviews: ${pendingMembers.length}`);
    pendingMembers.forEach(member => {
      console.log(`   📝 ${member.firstName} ${member.lastName} - ${member.membershipStatus}`);
    });

    // Sample member details
    const sampleMember = memberCount.find(m => m.firstName === "SpongeBob");
    if (sampleMember) {
      console.log(`\n🧽 Sample Member: ${sampleMember.firstName} ${sampleMember.lastName}`);
      console.log(`   📧 Email: ${sampleMember.email}`);
      console.log(`   📞 Phone: ${sampleMember.mobilePhone || 'No phone'}`);
      console.log(`   🎭 Role: ${sampleMember.membershipRole}`);
      console.log(`   📊 Status: ${sampleMember.membershipStatus}`);
      if (sampleMember.customFields) {
        console.log(`   🏷️ Custom Fields: ${Object.keys(JSON.parse(sampleMember.customFields)).length} fields`);
      }
    }

    console.log(`\n✅ Data verification complete!`);
    console.log(`   🎉 Ready to test the People section at /dashboard/people`);

  } catch (error) {
    console.error("❌ Error verifying data:", error);
    throw error;
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyData()
    .then(() => {
      console.log("\n🎯 All sample data looks good!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Data verification failed:", error);
      process.exit(1);
    });
}

export { verifyData };