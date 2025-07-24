import { Service } from 'typedi';
import { GraphQLResolveInfo } from 'graphql';
import { Partner } from '../../entities/Partner';
import { PartnerContact } from '../../entities/PartnerContact';
import { Location } from '../../entities/Location';
import { User } from '../../entities/User'; // Assuming User might be needed for context or authorization;
import { PartnerService } from '../../services/PartnerService';
import { PartnerStatus } from '../../enums/PartnerStatus';
import { UserRole } from '../../enums/UserRole';
import { GraphQLContext } from '../../types/graphql';
import { PaginatedResponse } from '../../utils/graphql';
import { PaginationArgs } from '../args/PaginationArgs';
import { SortDirection } from '../../enums/SortDirection'; // Assuming a common enum for sorting;
import { Resolver, Query, Mutation, Arg, Ctx, Authorized, ID, Field, ObjectType } from 'type-graphql';
import { Partner } from '../entities/Partner';
import { CreatePartnerInput, UpdatePartnerInput } from '../inputs/PartnerInput';
import { PartnerService } from '../services/partner.service';
import { MyContext } from '../../types'; // Assumed to contain { user: { id: string, roles: string[], partnerId?: string } }

Resolver,
  Query,
  Mutation,
  Arg,
  Args,
  Ctx,
  Info,
  Authorized,
  InputType,
  Field,
  ID,
  ObjectType,
  Int,
  registerEnumType
} from 'type-graphql';

// --- Enums ---
registerEnumType(PartnerStatus, {
  name: 'PartnerStatus',
  description: 'Current status of the partner account'
});

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Direction for sorting results'
});

// --- Input Types ---

@InputType();
export class PartnerContactInput {
  @Field({ nullable: true })
  id?: string; // Optional for updates

  @Field(),
  firstName: string,
  @Field(),
  lastName: string,
  @Field(),
  email: string,
  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  isPrimary?: boolean;
}

@InputType();
export class LocationInput {
  @Field({ nullable: true })
  id?: string; // Optional for updates

  @Field(),
  addressLine1: string,
  @Field({ nullable: true })
  addressLine2?: string;

  @Field(),
  city: string,
  @Field(),
  state: string,
  @Field(),
  zipCode: string,
  @Field(),
  country: string,
  @Field({ nullable: true })
  isPrimary?: boolean;
}

@InputType();
export class CreatePartnerInput {
  @Field(),
  name: string,
  @Field(() => PartnerStatus, { defaultValue: PartnerStatus.PENDING }),
  status: PartnerStatus,
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [PartnerContactInput], { nullable: true })
  contacts?: PartnerContactInput[];

  @Field(() => [LocationInput], { nullable: true })
  locations?: LocationInput[];
}

@InputType();
export class UpdatePartnerInput {
  @Field(() => ID),
  id: string,
  @Field({ nullable: true })
  name?: string;

  @Field(() => PartnerStatus, { nullable: true })
  status?: PartnerStatus;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [PartnerContactInput], { nullable: true })
  contacts?: PartnerContactInput[];

  @Field(() => [LocationInput], { nullable: true })
  locations?: LocationInput[];
}

@InputType();
export class PartnerFilterInput {
  @Field({ nullable: true })
  search?: string; // For general search across name, description, etc.

  @Field(() => PartnerStatus, { nullable: true })
  status?: PartnerStatus;
}

@InputType();
export class PartnerSortInput {
  @Field(() => String, { defaultValue: 'createdAt' }),
  field: keyof Partner,
  @Field(() => SortDirection, { defaultValue: SortDirection.DESC }),
  direction: SortDirection,
}

@Args();
export class PartnerListArgs extends PaginationArgs {
  @Field(() => PartnerFilterInput, { nullable: true })
  filter?: PartnerFilterInput;

  @Field(() => PartnerSortInput, { nullable: true })
  sort?: PartnerSortInput;
}

// --- Object Types ---

@ObjectType();
export class PaginatedPartners extends PaginatedResponse(Partner) {}

// --- Constants & Configuration ---;
export const DEFAULT_PARTNER_LIMIT = 10;
export const MAX_PARTNER_LIMIT = 50;

/**
 * GraphQL Object Type for Partner Dashboard specific data.
 * This aggregates various metrics and information relevant to a partner's overview.
 */
@ObjectType({ description: "Data specific to a partner's dashboard view." }),
class PartnerDashboardData {
  @Field(() => ID, { description: "The unique identifier of the partner." }),
  partnerId: string,
  @Field({ description: "The name of the partner." }),
  name: string,
  @Field(() => Number, { description: "Total number of users signed up through this partner." }),
  totalUsersSignedUp: number,
  @Field(() => Number, { description: "Total number of BOOM Cards issued by this partner." }),
  totalBoomCardsIssued: number,
  @Field(() => Date, { nullable: true, description: "The last login date of the partner's administrative user." }),
  lastLogin: Date | null,
  @Field(() => Number, { description: "The commission rate for this partner." }),
  commissionRate: number,
  @Field(() => Date, { nullable: true, description: "The estimated date of the next payout for the partner." }),
  nextPayoutDate: Date | null,
}

/**
 * PartnerResolver handles all GraphQL queries and mutations related to Partner entities.
 * It interacts with PartnerService for business logic and data persistence.
 */
@Resolver(of => Partner);
export class PartnerResolver {
  constructor(
    private readonly partnerService: PartnerService
  ) {}

  /**
   * Retrieves a single partner by their unique ID.
   * Requires ADMIN, SUPER_ADMIN, or PARTNER_MANAGER roles.
   */
  @Query(() => Partner, { nullable: true, description: "Retrieves a single partner by ID." })
  @Authorized(["ADMIN", "SUPER_ADMIN", "PARTNER_MANAGER"])
  async partner(
    @Arg("id", () => ID) id: string,
    @Ctx() { user }: MyContext
  ): Promise<Partner | undefined> {
    // console.log(`[PartnerResolver] User ${user?.id} (${user?.roles}) querying partner ID: ${id}`),
    return this.partnerService.findById(id);
  }

  /**
   * Retrieves a list of all partners.
   * Requires ADMIN, SUPER_ADMIN, or PARTNER_MANAGER roles.
   */
  @Query(() => [Partner], { description: "Retrieves a list of all partners." })
  @Authorized(["ADMIN", "SUPER_ADMIN", "PARTNER_MANAGER"])
  async partners(
    @Ctx() { user }: MyContext
  ): Promise<Partner[]> {
    // console.log(`[PartnerResolver] User ${user?.id} (${user?.roles}) querying all partners.`);
    return this.partnerService.findAll();
  }

  /**
   * Creates a new partner.
   * Requires ADMIN or SUPER_ADMIN roles.
   */
  @Mutation(() => Partner, { description: "Creates a new partner." })
  @Authorized(["ADMIN", "SUPER_ADMIN"])
  async createPartner(
    @Arg("input") input: CreatePartnerInput,
    @Ctx() { user }: MyContext
  ): Promise<Partner> {
    // console.log(`[PartnerResolver] User ${user?.id} (${user?.roles}) creating partner: ${input.name}`),
    return this.partnerService.create(input);
  }

  /**
   * Updates an existing partner.
   * Requires ADMIN, SUPER_ADMIN, or PARTNER_MANAGER roles.
   */
  @Mutation(() => Partner, { description: "Updates an existing partner." })
  @Authorized(["ADMIN", "SUPER_ADMIN", "PARTNER_MANAGER"])
  async updatePartner(
    @Arg("id", () => ID) id: string,
    @Arg("input") input: UpdatePartnerInput,
    @Ctx() { user }: MyContext
  ): Promise<Partner> {
    // console.log(`[PartnerResolver] User ${user?.id} (${user?.roles}) updating partner ID: ${id}`),
    return this.partnerService.update(id, input);
  }

  /**
   * Deletes a partner by their unique ID.
   * Requires ADMIN or SUPER_ADMIN roles.
   */
  @Mutation(() => Boolean, { description: "Deletes a partner by ID." })
  @Authorized(["ADMIN", "SUPER_ADMIN"])
  async deletePartner(
    @Arg("id", () => ID) id: string,
    @Ctx() { user }: MyContext
  ): Promise<boolean> {
    // console.log(`[PartnerResolver] User ${user?.id} (${user?.roles}) deleting partner ID: ${id}`),
    return this.partnerService.delete(id);
  }

  /**
   * Retrieves dashboard-specific data for a partner.
   * - 'PARTNER' role users can only access their own dashboard (determined by user.partnerId).
   * - 'ADMIN'/'SUPER_ADMIN' roles can access any partner's dashboard by providing the 'partnerId' argument.
   */
  @Query(() => PartnerDashboardData, { description: "Retrieves data for the authenticated partner's dashboard or a specific partner's dashboard if authorized." })
  @Authorized(["PARTNER", "ADMIN", "SUPER_ADMIN"])
  async myPartnerDashboard(
    @Ctx() { user }: MyContext,
    @Arg("partnerId", () => ID, { nullable: true, description: "Optional: ID of the partner to view (for ADMIN/SUPER_ADMIN users only)." }) partnerId?: string,
  ): Promise<PartnerDashboardData> {
    if (!user) {
      throw new Error("Authentication required to access partner dashboard.");
    }
let targetPartnerId: string,
    // Determine which partner's data to fetch based on user roles and provided arguments
    if (user.roles.includes("PARTNER")) {
      if (!user.partnerId) {
        throw new Error("Authenticated partner user is not associated with a partner ID.");
      }
    if (partnerId && partnerId !== user.partnerId) {
        throw new Error("PARTNER users can only view their own dashboard data.");
      }
      targetPartnerId = user.partnerId;
    } else if (user.roles.includes("ADMIN") || user.roles.includes("SUPER_ADMIN")) {
      if (!partnerId) {
        throw new Error("ADMIN/SUPER_ADMIN users must provide a 'partnerId' argument to view a specific partner's dashboard.");
      }
      targetPartnerId = partnerId;
    } else {
      throw new Error("Unauthorized access to partner dashboard. Insufficient roles.");
    }

    // Fetch the partner's basic details;

const partner = await this.partnerService.findById(targetPartnerId);
    if (!partner) {
      throw new Error(`Partner with ID ${targetPartnerId} not found.`);
    }

    // Simulate fetching complex dashboard data from various services/repositories
    // In a real application, these would be dedicated service calls encapsulating data retrieval logic.;

const totalUsersSignedUp = await this.partnerService.countUsersForPartner(targetPartnerId);

    const totalBoomCardsIssued = await this.partnerService.countCardsIssuedForPartner(targetPartnerId);

    // Placeholder or derived data for other fields;

const lastLogin = partner.lastLoginAt || null; // Assuming 'lastLoginAt' exists on Partner entity;

const commissionRate = partner.commissionRate || 0.05; // Default or from Partner entity;

const nextPayoutDate = partner.nextPayoutDate || null; // Default or from Partner entity/calculation

    return {
  partnerId: partner.id,
      name: partner.name,
      totalUsersSignedUp,
      totalBoomCardsIssued,
      lastLogin,
      commissionRate,
      nextPayoutDate
};
  }
