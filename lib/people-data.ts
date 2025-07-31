import { db } from '@/db/drizzle';
import { churches, families, members } from '@/db/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';

export interface MemberWithFamily {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string | null;
  workPhone?: string | null;
  membershipStatus: string;
  membershipRole: string;
  familyName: string;
  joinDate: Date | null;
  photoUrl?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  maritalStatus?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  occupation?: string | null;
  employer?: string | null;
  notes?: string | null;
  customFields?: string | null;
  isHeadOfHousehold?: boolean | null;
  isMinor?: boolean | null;
}

export interface FamilyWithMembers {
  id: string;
  familyName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  homePhone?: string | null;
  members: MemberWithFamily[];
  memberCount: number;
}

export async function getAllMembers(): Promise<MemberWithFamily[]> {
  try {
    // Use raw SQL to bypass Drizzle JSON processing issues
    const result = await db.all(sql`
      SELECT 
        m.id,
        m.firstName,
        m.lastName,
        m.email,
        m.mobilePhone,
        m.workPhone,
        m.membershipStatus,
        m.membershipRole,
        COALESCE(f.familyName, 'No Family') as familyName,
        m.joinDate,
        m.photoUrl,
        m.dateOfBirth,
        m.gender,
        m.maritalStatus,
        f.address,
        f.city,
        f.state,
        f.zipCode,
        m.emergencyContactName,
        m.emergencyContactPhone,
        m.occupation,
        m.employer,
        m.notes,
        m.customFields,
        m.isHeadOfHousehold,
        m.isMinor
      FROM members m
      LEFT JOIN families f ON m.familyId = f.id
      ORDER BY m.lastName, m.firstName
    `);
    
    // Convert timestamps to Date objects
    return result.map((member: any) => ({
      ...member,
      joinDate: member.joinDate ? new Date(member.joinDate * 1000) : null,
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth * 1000) : null,
      isHeadOfHousehold: Boolean(member.isHeadOfHousehold),
      isMinor: Boolean(member.isMinor),
    })) as MemberWithFamily[];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

export async function searchMembers(searchTerm: string, statusFilter?: string, roleFilter?: string): Promise<MemberWithFamily[]> {
  try {
    let whereConditions: any[] = [];

    // Search conditions
    if (searchTerm) {
      whereConditions.push(
        or(
          like(members.firstName, `%${searchTerm}%`),
          like(members.lastName, `%${searchTerm}%`),
          like(members.email, `%${searchTerm}%`),
          like(members.mobilePhone, `%${searchTerm}%`)
        )
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      whereConditions.push(eq(members.membershipStatus, statusFilter));
    }

    // Role filter
    if (roleFilter && roleFilter !== 'all') {
      whereConditions.push(eq(members.membershipRole, roleFilter));
    }

    const result = await db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
        mobilePhone: members.mobilePhone,
        workPhone: members.workPhone,
        membershipStatus: members.membershipStatus,
        membershipRole: members.membershipRole,
        familyName: families.familyName,
        joinDate: members.joinDate,
        photoUrl: members.photoUrl,
        dateOfBirth: members.dateOfBirth,
        gender: members.gender,
        maritalStatus: members.maritalStatus,
        address: members.address,
        city: members.city,
        state: members.state,
        zipCode: members.zipCode,
        emergencyContactName: members.emergencyContactName,
        emergencyContactPhone: members.emergencyContactPhone,
        occupation: members.occupation,
        employer: members.employer,
        notes: members.notes,
        customFields: members.customFields,
        isHeadOfHousehold: members.isHeadOfHousehold,
        isMinor: members.isMinor,
      })
      .from(members)
      .leftJoin(families, eq(members.familyId, families.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(members.lastName, members.firstName);
    
    return result.map(member => ({
      ...member,
      familyName: member.familyName || 'No Family',
    }));
  } catch (error) {
    console.error('Error searching members:', error);
    return [];
  }
}

export async function getAllFamilies(): Promise<FamilyWithMembers[]> {
  try {
    const result = await db
      .select({
        familyId: families.id,
        familyName: families.familyName,
        familyAddress: families.address,
        familyCity: families.city,
        familyState: families.state,
        familyZipCode: families.zipCode,
        familyHomePhone: families.homePhone,
        memberId: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        membershipStatus: members.membershipStatus,
        membershipRole: members.membershipRole,
        isHeadOfHousehold: members.isHeadOfHousehold,
      })
      .from(families)
      .leftJoin(members, eq(families.id, members.familyId))
      .orderBy(families.familyName, members.isHeadOfHousehold);

    // Group by family
    const familiesMap = new Map<string, FamilyWithMembers>();
    
    result.forEach(row => {
      if (!familiesMap.has(row.familyId)) {
        familiesMap.set(row.familyId, {
          id: row.familyId,
          familyName: row.familyName,
          address: row.familyAddress,
          city: row.familyCity,
          state: row.familyState,
          zipCode: row.familyZipCode,
          homePhone: row.familyHomePhone,
          members: [],
          memberCount: 0,
        });
      }
      
      const family = familiesMap.get(row.familyId)!;
      
      if (row.memberId) {
        family.members.push({
          id: row.memberId,
          firstName: row.firstName!,
          lastName: row.lastName!,
          membershipStatus: row.membershipStatus!,
          membershipRole: row.membershipRole!,
          isHeadOfHousehold: row.isHeadOfHousehold,
          // Add other fields as needed for the family view
        } as MemberWithFamily);
        family.memberCount++;
      }
    });

    return Array.from(familiesMap.values());
  } catch (error) {
    console.error('Error fetching families:', error);
    return [];
  }
}

export async function getMemberById(id: string): Promise<MemberWithFamily | null> {
  try {
    const result = await db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
        mobilePhone: members.mobilePhone,
        workPhone: members.workPhone,
        membershipStatus: members.membershipStatus,
        membershipRole: members.membershipRole,
        familyName: families.familyName,
        joinDate: members.joinDate,
        photoUrl: members.photoUrl,
        dateOfBirth: members.dateOfBirth,
        gender: members.gender,
        maritalStatus: members.maritalStatus,
        address: members.address,
        city: members.city,
        state: members.state,
        zipCode: members.zipCode,
        emergencyContactName: members.emergencyContactName,
        emergencyContactPhone: members.emergencyContactPhone,
        occupation: members.occupation,
        employer: members.employer,
        notes: members.notes,
        customFields: members.customFields,
        isHeadOfHousehold: members.isHeadOfHousehold,
        isMinor: members.isMinor,
      })
      .from(members)
      .leftJoin(families, eq(members.familyId, families.id))
      .where(eq(members.id, id))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const member = result[0];
    return {
      ...member,
      familyName: member.familyName || 'No Family',
    };
  } catch (error) {
    console.error('Error fetching member:', error);
    return null;
  }
}

export async function getFamilyMembers(familyId: string): Promise<MemberWithFamily[]> {
  try {
    const result = await db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
        mobilePhone: members.mobilePhone,
        workPhone: members.workPhone,
        membershipStatus: members.membershipStatus,
        membershipRole: members.membershipRole,
        familyName: families.familyName,
        joinDate: members.joinDate,
        photoUrl: members.photoUrl,
        dateOfBirth: members.dateOfBirth,
        gender: members.gender,
        maritalStatus: members.maritalStatus,
        isHeadOfHousehold: members.isHeadOfHousehold,
        isMinor: members.isMinor,
      })
      .from(members)
      .leftJoin(families, eq(members.familyId, families.id))
      .where(eq(members.familyId, familyId))
      .orderBy(
        sql`CASE WHEN ${members.isHeadOfHousehold} THEN 0 ELSE 1 END`,
        members.dateOfBirth
      );
    
    return result.map(member => ({
      ...member,
      familyName: member.familyName || 'No Family',
    }));
  } catch (error) {
    console.error('Error fetching family members:', error);
    return [];
  }
}

// Get pending members for review
export async function getPendingMembers(): Promise<MemberWithFamily[]> {
  try {
    const result = await db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
        mobilePhone: members.mobilePhone,
        workPhone: members.workPhone,
        membershipStatus: members.membershipStatus,
        membershipRole: members.membershipRole,
        familyName: families.familyName,
        joinDate: members.joinDate,
        photoUrl: members.photoUrl,
        dateOfBirth: members.dateOfBirth,
        gender: members.gender,
        maritalStatus: members.maritalStatus,
        notes: members.notes,
        customFields: members.customFields,
        createdAt: members.createdAt,
      })
      .from(members)
      .leftJoin(families, eq(members.familyId, families.id))
      .where(like(members.notes, '%PENDING REVIEW%'))
      .orderBy(members.createdAt);
    
    return result.map(member => ({
      ...member,
      familyName: member.familyName || 'No Family',
    }));
  } catch (error) {
    console.error('Error fetching pending members:', error);
    return [];
  }
}