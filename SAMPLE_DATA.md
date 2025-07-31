# Sample Church Data for Fruit Tree

This document describes the sample data that has been loaded into the Fruit Tree application for testing the People management system.

## Quick Start

To load the sample data:

```bash
npm run seed
```

To verify the data was loaded correctly:

```bash
npm run verify
```

## Sample Church: Bikini Bottom Community Church

**Address:** 124 Conch Street, Bikini Bottom, Ocean 00001  
**Phone:** (555) 123-KRAB  
**Email:** info@bbcc.org

## Sample Families (7 families, 15 members total)

### 1. SquarePants Family
- **SpongeBob SquarePants** - Active Member, Head of Household
- **Patrick Star** - Inactive Member (moved away)

### 2. Halpert Family 
- **Jim Halpert** - Elder, Head of Household
- **Pam Halpert** - Active Member
- **Cece Halpert** - Child (7 years old)

### 3. Wyatt Family
- **Ben Wyatt** - Elder, Head of Household  
- **Leslie Wyatt** - Active Member

### 4. Tentacles Household (Single Adult)
- **Squidward Tentacles** - Visitor (regular attender)

### 5. Scott Family (NEW - For Testing Pending Reviews)
- **Michael Scott** - Visitor, **PENDING REVIEW** ⏳

### 6. Flintstone Family
- **Fred Flintstone** - Deacon, Head of Household
- **Wilma Flintstone** - Active Member
- **Pebbles Flintstone** - Child (6 years old)

### 7. Schrute Family (Leadership)
- **Dwight Schrute** - Pastor, Head of Household
- **Angela Schrute** - Staff (Worship Leader)

### 8. Individual Member
- **Andy Dwyer** - New Member (recent transfer, no family)

## Member Status Distribution

- **Active Members:** 12
- **Visitors:** 2  
- **Inactive:** 1

## Leadership Roles

- **Pastor:** Dwight Schrute
- **Elders:** Jim Halpert, Ben Wyatt
- **Deacon:** Fred Flintstone
- **Staff:** Angela Schrute (Worship Leader)

## Features to Test

### 1. Member Search & Filtering
- Search by name: "SpongeBob", "Halpert", "Schrute"
- Filter by status: Active, Visitor, Inactive
- Filter by role: Pastor, Elder, Deacon, Staff, Member

### 2. Family Relationships
- View family pages at `/dashboard/people/families`
- See family groupings and head of household
- Mixed families (adults + children)

### 3. Member Profiles
- Click any member to view detailed profile
- **Custom Fields** include:
  - Baptism dates
  - T-shirt sizes
  - Ministry interests
  - Allergies/medical notes
  - Background check status
  - Spiritual gifts

### 4. Pending Reviews
- Visit `/dashboard/people/pending` 
- **Michael Scott** appears as pending review
- Test approve/reject workflow

### 5. Custom Fields Examples
- **SpongeBob:** Youth Ministry, Music Team
- **Jim:** Men's Ministry, Small Groups, Elder Board
- **Pam:** Children's Ministry, Arts Team
- **Dwight:** Preaching, Discipleship, Security
- **Fred:** Building Committee, Bowling League

### 6. Children & Families
- **Cece Halpert** (7) - 1st Grade, Favorite Color: Pink
- **Pebbles Flintstone** (6) - Kindergarten, Loves Dinosaurs

### 7. Different Life Stages
- **Singles:** SpongeBob, Squidward, Patrick, Andy, Michael
- **Married Couples:** Halpert, Wyatt, Flintstone, Schrute families
- **Families with Children:** Halpert, Flintstone
- **Leadership:** Pastor, Elders, Deacon

## Test Scenarios

### New Visitor Workflow
1. **Michael Scott** is marked as "PENDING REVIEW"
2. Visit Pending Reviews page
3. Review his information
4. Approve or reject the application

### Family Management
1. View the Halpert family
2. See Jim as head of household, Pam as spouse, Cece as child
3. Check family relationships and roles

### Search Functionality
1. Search "Schrute" → Find Dwight & Angela
2. Filter by "Pastor" role → Find Dwight
3. Filter by "Child" status → Find Cece & Pebbles

### Custom Fields
1. View SpongeBob's profile
2. Check Custom Fields tab
3. See baptism date, ministry interests, background check status

## Database Details

- **Church ID:** church_1
- **Family IDs:** family_1 through family_7  
- **Member IDs:** member_1 through member_15
- **All timestamps:** Properly formatted for SQLite
- **Custom fields:** Stored as JSON strings
- **Relationships:** Proper foreign keys between churches → families → members

## Resetting Data

To clear and reload the sample data:

```bash
npm run seed
```

This will:
1. Clear existing churches, families, and members
2. Insert fresh sample data
3. Verify relationships are correct

The sample data provides a realistic church directory for testing all People management features!