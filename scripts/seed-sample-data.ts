#!/usr/bin/env tsx

import { db } from '../db/drizzle';
import { churches, families, members } from '../db/schema';
import { eq } from 'drizzle-orm';

// Sample Church Data for Fruit Tree Testing
// Mix of cartoon characters and TV shows (church-appropriate)

const sampleChurch = {
  id: "church_1",
  name: "Bikini Bottom Community Church", 
  address: "124 Conch Street",
  city: "Bikini Bottom",
  state: "Ocean",
  zipCode: "00001",
  country: "US",
  phone: "(555) 123-KRAB",
  email: "info@bbcc.org",
  website: "https://bbcc.org",
  timezone: "America/New_York",
  settings: JSON.stringify({
    allowOnlineRegistration: true,
    requireBackgroundCheck: true,
    defaultMembershipStatus: "Visitor"
  })
};

const sampleFamilies = [
  // The SquarePants Family
  {
    id: "family_1",
    churchId: "church_1",
    familyName: "SquarePants Family",
    address: "124 Conch Street",
    city: "Bikini Bottom",
    state: "Ocean",
    zipCode: "00001",
    country: "US",
    homePhone: "(555) 123-4567",
    customFields: JSON.stringify({
      familyNotes: "Very active in church activities"
    })
  },
  
  // The Halpert Family  
  {
    id: "family_2", 
    churchId: "church_1",
    familyName: "Halpert Family",
    address: "1725 Slough Avenue",
    city: "Scranton",
    state: "PA",
    zipCode: "18503",
    country: "US",
    homePhone: "(570) 555-0123",
    customFields: JSON.stringify({
      familyNotes: "Jim serves on elder board, Pam helps with children's ministry"
    })
  },
  
  // The Wyatt Family (Ben as head, Leslie as member)
  {
    id: "family_3",
    churchId: "church_1", 
    familyName: "Wyatt Family",
    address: "123 Parks Department Lane",
    city: "Pawnee",
    state: "IN",
    zipCode: "47408",
    country: "US",
    homePhone: "(812) 555-WAFFLE",
    customFields: JSON.stringify({
      familyNotes: "Ben is elder, Leslie very involved in community outreach"
    })
  },
  
  // The Tentacles Family (Single Adult)
  {
    id: "family_4",
    churchId: "church_1",
    familyName: "Tentacles Household", 
    address: "122 Conch Street",
    city: "Bikini Bottom", 
    state: "Ocean",
    zipCode: "00001",
    country: "US",
    homePhone: "(555) 987-6543",
    customFields: JSON.stringify({
      familyNotes: "Single adult household, regular attender"
    })
  },
  
  // The Scott Family
  {
    id: "family_5",
    churchId: "church_1",
    familyName: "Scott Family",
    address: "1725 Slough Avenue",
    city: "Scranton",
    state: "PA", 
    zipCode: "18503",
    country: "US",
    homePhone: "(570) 555-BOSS",
    customFields: JSON.stringify({
      familyNotes: "New visitor family, pending review"
    })
  },

  // The Flintstone Family
  {
    id: "family_6",
    churchId: "church_1",
    familyName: "Flintstone Family",
    address: "345 Cave Stone Road",
    city: "Bedrock",
    state: "Stone Age",
    zipCode: "BC-001",
    country: "US",
    homePhone: "(555) YABBA-DABBA",
    customFields: JSON.stringify({
      familyNotes: "Fred is deacon, Wilma leads children's ministry"
    })
  },

  // The Schrute Family  
  {
    id: "family_7",
    churchId: "church_1",
    familyName: "Schrute Family",
    address: "Schrute Farms",
    city: "Honesdale", 
    state: "PA",
    zipCode: "18431",
    country: "US",
    homePhone: "(570) 555-BEET",
    customFields: JSON.stringify({
      familyNotes: "Dwight is pastor, Angela leads worship team"
    })
  }
];

const sampleMembers = [
  // SpongeBob SquarePants - Active Member, Young Adult
  {
    id: "member_1",
    churchId: "church_1", 
    familyId: "family_1",
    firstName: "SpongeBob",
    lastName: "SquarePants",
    email: "spongebob@krustykrab.bb",
    mobilePhone: "(555) 123-4567",
    dateOfBirth: new Date("1999-07-14"),
    gender: "Male",
    maritalStatus: "Single",
    membershipStatus: "Active",
    membershipRole: "Member",
    joinDate: new Date("2023-01-15"),
    occupation: "Fry Cook",
    employer: "Krusty Krab",
    customFields: JSON.stringify({
      baptismDate: "2023-03-12",
      allergies: "None",
      tShirtSize: "Medium",
      volunteerBackgroundCheck: true,
      ministryInterests: "Youth Ministry, Music Team",
      spiritualGifts: "Encouragement, Hospitality"
    }),
    notes: "Very enthusiastic member, always willing to help",
    isHeadOfHousehold: true
  },
  
  // Jim Halpert - Active Member, Family Man
  {
    id: "member_2", 
    churchId: "church_1",
    familyId: "family_2",
    firstName: "Jim",
    lastName: "Halpert", 
    email: "jim.halpert@dundermifflin.com",
    mobilePhone: "(570) 555-0123",
    dateOfBirth: new Date("1985-10-01"),
    gender: "Male",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Elder",
    joinDate: new Date("2022-06-01"), 
    occupation: "Sales Representative",
    employer: "Dunder Mifflin",
    customFields: JSON.stringify({
      baptismDate: "2022-08-14",
      allergies: "None",
      tShirtSize: "Large", 
      volunteerBackgroundCheck: true,
      ministryInterests: "Men's Ministry, Small Groups",
      leadershipExperience: "Elder Board"
    }),
    notes: "Elder board member, great with small groups",
    isHeadOfHousehold: true
  },
  
  // Pam Halpert - Active Member, Wife and Mom
  {
    id: "member_3",
    churchId: "church_1",
    familyId: "family_2", 
    firstName: "Pam",
    lastName: "Halpert",
    email: "pam.halpert@dundermifflin.com",
    mobilePhone: "(570) 555-0124",
    dateOfBirth: new Date("1988-03-25"),
    gender: "Female",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Member",
    joinDate: new Date("2022-06-01"),
    occupation: "Receptionist",
    employer: "Dunder Mifflin",
    customFields: JSON.stringify({
      baptismDate: "2022-08-14",
      allergies: "Shellfish",
      tShirtSize: "Medium",
      volunteerBackgroundCheck: true,
      ministryInterests: "Children's Ministry, Arts Team",
      spiritualGifts: "Teaching, Arts"
    }),
    notes: "Helps with children's ministry, artistic talents",
    isHeadOfHousehold: false
  },
  
  // Cece Halpert - Child
  {
    id: "member_4",
    churchId: "church_1",
    familyId: "family_2",
    firstName: "Cece", 
    lastName: "Halpert",
    email: "",
    dateOfBirth: new Date("2018-03-04"),
    gender: "Female",
    membershipStatus: "Active",
    membershipRole: "Member",
    joinDate: new Date("2022-06-01"),
    customFields: JSON.stringify({
      allergies: "None",
      tShirtSize: "Youth Small",
      grade: "1st Grade",
      favoriteColor: "Pink"
    }),
    notes: "Sweet little girl, loves Sunday school",
    isHeadOfHousehold: false,
    isMinor: true
  },
  
  // Leslie Knope - Active Member, Wife
  {
    id: "member_5",
    churchId: "church_1",
    familyId: "family_3",
    firstName: "Leslie", 
    lastName: "Wyatt",
    email: "leslie.wyatt@pawnee.gov",
    mobilePhone: "(812) 555-WAFFLE",
    dateOfBirth: new Date("1980-01-18"),
    gender: "Female",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Member",
    joinDate: new Date("2021-01-01"),
    occupation: "Parks Director",
    employer: "Pawnee Parks Department", 
    customFields: JSON.stringify({
      baptismDate: "2021-02-14",
      allergies: "None",
      tShirtSize: "Small",
      volunteerBackgroundCheck: true,
      ministryInterests: "Community Outreach, Event Planning, Women's Ministry",
      spiritualGifts: "Leadership, Organization"
    }),
    notes: "Incredibly organized, great at planning events",
    isHeadOfHousehold: false
  },
  
  // Squidward Tentacles - Regular Attender (not member)
  {
    id: "member_6",
    churchId: "church_1",
    familyId: "family_4",
    firstName: "Squidward",
    lastName: "Tentacles",
    email: "squidward.tentacles@clarinet.bb", 
    mobilePhone: "(555) 987-6543",
    dateOfBirth: new Date("1977-10-09"),
    gender: "Male",
    maritalStatus: "Single",
    membershipStatus: "Visitor",
    membershipRole: "Visitor",
    occupation: "Cashier",
    employer: "Krusty Krab",
    customFields: JSON.stringify({
      allergies: "Loud noises",
      tShirtSize: "Medium",
      interests: "Music, Art",
      howDidYouHear: "Neighbor invited me"
    }),
    notes: "Regular attender, interested in music ministry",
    isHeadOfHousehold: true
  },
  
  // Michael Scott - New Visitor (Pending Review Example)
  {
    id: "member_7", 
    churchId: "church_1",
    familyId: "family_5",
    firstName: "Michael",
    lastName: "Scott",
    email: "michael.scott@dundermifflin.com",
    mobilePhone: "(570) 555-BOSS",
    dateOfBirth: new Date("1973-03-15"),
    gender: "Male",
    maritalStatus: "Single",
    membershipStatus: "Visitor",
    membershipRole: "Visitor",
    occupation: "Regional Manager",
    employer: "Dunder Mifflin",
    customFields: JSON.stringify({
      allergies: "None", 
      howDidYouHear: "Connect Card form",
      prayerRequests: "New to the area, looking for community"
    }),
    notes: "PENDING REVIEW: New visitor, needs follow-up",
    isHeadOfHousehold: true
  },
  
  // Patrick Star - Inactive Member
  {
    id: "member_8",
    churchId: "church_1",
    familyId: "family_1",
    firstName: "Patrick",
    lastName: "Star", 
    email: "patrick@underrock.bb",
    mobilePhone: "(555) 555-ROCK",
    dateOfBirth: new Date("1995-02-26"),
    gender: "Male",
    maritalStatus: "Single",
    membershipStatus: "Inactive",
    membershipRole: "Member", 
    joinDate: new Date("2022-05-01"),
    occupation: "Unemployed",
    customFields: JSON.stringify({
      baptismDate: "2022-07-04",
      allergies: "None",
      tShirtSize: "Extra Large"
    }),
    notes: "Moved away for work, still considers us home church",
    isHeadOfHousehold: false
  },
  
  // Andy Dwyer - Recent Transfer (Single guy)
  {
    id: "member_9",
    churchId: "church_1", 
    familyId: null, // Single guy, no family
    firstName: "Andy",
    lastName: "Dwyer",
    email: "andy@mouserat.band", 
    mobilePhone: "(812) 555-BAND",
    dateOfBirth: new Date("1982-04-08"),
    gender: "Male",
    maritalStatus: "Single",
    membershipStatus: "Active",
    membershipRole: "Member",
    joinDate: new Date("2025-06-01"),
    occupation: "Musician",
    employer: "Mouse Rat Band",
    customFields: JSON.stringify({
      baptismDate: "2020-08-15",
      allergies: "None", 
      tShirtSize: "Large",
      volunteerBackgroundCheck: false,
      ministryInterests: "Music Ministry, Youth Group",
      previousChurch: "Eagleton Community Church"
    }),
    notes: "Recent transfer, very musical, needs background check",
    isHeadOfHousehold: true
  },

  // Ben Wyatt - Head of Household, Elder
  {
    id: "member_10",
    churchId: "church_1",
    familyId: "family_3",
    firstName: "Ben",
    lastName: "Wyatt",
    email: "ben.wyatt@pawnee.gov",
    mobilePhone: "(812) 555-CALC",
    dateOfBirth: new Date("1978-11-14"),
    gender: "Male",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Elder",
    joinDate: new Date("2020-12-01"),
    occupation: "City Manager",
    employer: "Pawnee City Hall",
    customFields: JSON.stringify({
      baptismDate: "2021-01-17",
      allergies: "None",
      tShirtSize: "Medium",
      volunteerBackgroundCheck: true,
      ministryInterests: "Men's Ministry, Finance Committee, Small Groups",
      spiritualGifts: "Administration, Teaching"
    }),
    notes: "Elder board member, handles church finances",
    isHeadOfHousehold: true
  },

  // Fred Flintstone - Head of Household, Deacon
  {
    id: "member_11",
    churchId: "church_1",
    familyId: "family_6",
    firstName: "Fred",
    lastName: "Flintstone",
    email: "fred@slaterock.bedrock",
    mobilePhone: "(555) YABBA-DABBA",
    dateOfBirth: new Date("1975-02-14"),
    gender: "Male",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Deacon",
    joinDate: new Date("2019-05-01"),
    occupation: "Quarry Worker",
    employer: "Slate Rock and Gravel Company",
    customFields: JSON.stringify({
      baptismDate: "2019-07-04",
      allergies: "None",
      tShirtSize: "Extra Large",
      volunteerBackgroundCheck: true,
      ministryInterests: "Men's Ministry, Building Committee, Bowling League",
      spiritualGifts: "Service, Leadership"
    }),
    notes: "Deacon, very practical and hands-on",
    isHeadOfHousehold: true
  },

  // Wilma Flintstone - Wife, Children's Ministry Leader
  {
    id: "member_12",
    churchId: "church_1",
    familyId: "family_6",
    firstName: "Wilma",
    lastName: "Flintstone",
    email: "wilma@slaterock.bedrock",
    mobilePhone: "(555) YABBA-DABBA",
    dateOfBirth: new Date("1977-06-18"),
    gender: "Female",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Member",
    joinDate: new Date("2019-05-01"),
    occupation: "Homemaker",
    customFields: JSON.stringify({
      baptismDate: "2019-07-04",
      allergies: "None",
      tShirtSize: "Medium",
      volunteerBackgroundCheck: true,
      ministryInterests: "Children's Ministry, Women's Ministry, VBS Coordinator",
      spiritualGifts: "Teaching, Hospitality"
    }),
    notes: "Children's ministry coordinator, excellent with kids",
    isHeadOfHousehold: false
  },

  // Pebbles Flintstone - Child
  {
    id: "member_13",
    churchId: "church_1",
    familyId: "family_6",
    firstName: "Pebbles",
    lastName: "Flintstone",
    email: "",
    dateOfBirth: new Date("2019-08-15"),
    gender: "Female",
    membershipStatus: "Active",
    membershipRole: "Member",
    joinDate: new Date("2019-08-15"),
    customFields: JSON.stringify({
      allergies: "None",
      tShirtSize: "Youth Small",
      grade: "Kindergarten",
      favoriteActivity: "Dinosaur stories"
    }),
    notes: "Loves Sunday school and dinosaur stories",
    isHeadOfHousehold: false,
    isMinor: true
  },

  // Dwight Schrute - Head of Household, Pastor
  {
    id: "member_14",
    churchId: "church_1",
    familyId: "family_7",
    firstName: "Dwight",
    lastName: "Schrute",
    email: "dwight@schrutefarms.com",
    mobilePhone: "(570) 555-BEET",
    dateOfBirth: new Date("1972-01-20"),
    gender: "Male",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Pastor",
    joinDate: new Date("2018-01-01"),
    occupation: "Farmer/Beet Farmer",
    employer: "Schrute Farms",
    customFields: JSON.stringify({
      baptismDate: "2018-02-18",
      allergies: "None",
      tShirtSize: "Large",
      volunteerBackgroundCheck: true,
      ministryInterests: "Preaching, Discipleship, Farm Ministry, Security",
      spiritualGifts: "Preaching, Leadership, Discernment"
    }),
    notes: "Lead pastor, takes security very seriously",
    isHeadOfHousehold: true
  },

  // Angela Schrute - Wife, Worship Leader
  {
    id: "member_15",
    churchId: "church_1",
    familyId: "family_7",
    firstName: "Angela",
    lastName: "Schrute",
    email: "angela@schrutefarms.com",
    mobilePhone: "(570) 555-CATS",
    dateOfBirth: new Date("1980-11-11"),
    gender: "Female",
    maritalStatus: "Married",
    membershipStatus: "Active",
    membershipRole: "Staff",
    joinDate: new Date("2018-06-01"),
    occupation: "Worship Leader",
    employer: "Bikini Bottom Community Church",
    customFields: JSON.stringify({
      baptismDate: "2018-08-05",
      allergies: "Dog hair",
      tShirtSize: "Small",
      volunteerBackgroundCheck: true,
      ministryInterests: "Worship Team, Women's Ministry, Event Planning",
      spiritualGifts: "Music, Organization"
    }),
    notes: "Worship leader, very detail-oriented",
    isHeadOfHousehold: false
  }
];

// Custom Field Definitions (what the church has set up)
const customFieldDefinitions = [
  {
    id: "baptismDate",
    name: "Baptism Date", 
    type: "date",
    required: false,
    category: "Spiritual"
  },
  {
    id: "allergies",
    name: "Allergies/Medical Notes",
    type: "text", 
    required: false,
    category: "Health & Safety"
  },
  {
    id: "tShirtSize", 
    name: "T-Shirt Size",
    type: "dropdown",
    options: ["Youth Small", "Youth Medium", "Youth Large", "Small", "Medium", "Large", "Extra Large", "2XL"],
    required: false,
    category: "Events"
  },
  {
    id: "volunteerBackgroundCheck",
    name: "Background Check Complete",
    type: "checkbox", 
    required: false,
    category: "Volunteering"
  },
  {
    id: "ministryInterests",
    name: "Ministry Interests",
    type: "text",
    required: false,
    category: "Involvement"
  },
  {
    id: "howDidYouHear",
    name: "How did you hear about us?",
    type: "text",
    required: false, 
    category: "Connection"
  },
  {
    id: "prayerRequests",
    name: "Prayer Requests",
    type: "textarea",
    required: false,
    category: "Pastoral Care"
  },
  {
    id: "spiritualGifts",
    name: "Spiritual Gifts",
    type: "textarea",
    required: false,
    category: "Spiritual"
  }
];

async function seedSampleData() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (be careful in production!)
    console.log("🧹 Clearing existing data...");
    await db.delete(members);
    await db.delete(families); 
    await db.delete(churches);

    // Insert church
    console.log("🏛️ Inserting church...");
    await db.insert(churches).values(sampleChurch);

    // Insert families
    console.log("👨‍👩‍👧‍👦 Inserting families...");
    await db.insert(families).values(sampleFamilies);

    // Insert members
    console.log("👥 Inserting members...");
    await db.insert(members).values(sampleMembers);

    console.log("✅ Sample data seeded successfully!");
    console.log(`   📊 Inserted: 1 church, ${sampleFamilies.length} families, ${sampleMembers.length} members`);
    console.log("   🔍 Check the People section to see your data!");
    console.log("   ⏳ Michael Scott is pending review for testing");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedSampleData, customFieldDefinitions };