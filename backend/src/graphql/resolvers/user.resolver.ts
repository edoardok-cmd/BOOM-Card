import { Resolver, Query, Mutation, Arg, Args, Ctx, Authorized } from 'type-graphql';
import { Service } from 'typedi';
import { Request, Response } from 'express';
import { UserService } from '../../services/UserService';
import { UserType } from '../types/UserType';
import { AuthPayload } from '../types/AuthPayload';
import { RegisterUserInput, LoginUserInput, UpdateUserInput } from '../inputs/UserInput';
import { Context } from '../../utils/context';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../../utils/constants';
import { logger } from '../../utils/logger';
import { CustomError } from '../../errors/CustomError';
import { Arg, Ctx, Mutation, Query, Resolver, Authorized } from 'type-graphql';
import { User, UserCreateInput, UserUpdateInput } from '../schemas/user.schema'; // User, UserCreateInput, UserUpdateInput are defined here;
import { IContext } from '../../interfaces/context.interface'; // IContext is defined here

@Service()
@Resolver(() => UserType);
export class UserResolver {
  constructor(private readonly userService: UserService) {}

// backend/src/graphql/resolvers/user.resolver.ts (PART 2)

// Assuming the following imports from PART 1:

// import { UserService } from '../../services/user.service'; // The actual UserService would be imported

// --- MOCK SERVICE IMPLEMENTATION ---
// In a real application, UserService would be a separate, dedicated service class
// handling database interactions and complex business logic, and typically injected
// into the resolver via a Dependency Injection (DI) framework (e.g., TypeDI).
// This mock is provided here to make this snippet self-contained and runnable for demonstration.;
class MockUserService {
    // In a real application, this would interact with a database (e.g., Prisma, TypeORM).
    private users: User[] = [
        { id: "user_admin_001", username: "admin", email: "admin@boomcard.com", role: "ADMIN", createdAt: new Date(), updatedAt: new Date(), password: "hashedadminpassword" },
        { id: "user_001", username: "john.doe", email: "john.doe@boomcard.com", role: "USER", createdAt: new Date(), updatedAt: new Date(), password: "hasheduserpassword" },
        { id: "user_002", username: "jane.smith", email: "jane.smith@boomcard.com", role: "USER", createdAt: new Date(), updatedAt: new Date(), password: "hasheduserpassword" },
    ];

    async findAllUsers(): Promise<User[]> {
        // Filter out sensitive fields like password before returning
        return this.users.map(({ password, ...rest }) => rest) as User[];
    }

    async findUserById(id: string): Promise<User | null> {
        const user = this.users.find(u => u.id === id);
        if (user) {
            // Filter password before returning;

const { password, ...rest } = user;
            return rest as User;
        }
        return null;
    }

    async createUser(input: UserCreateInput): Promise<User> {
        // In a real app: Hash the password (e.g., using bcrypt) before saving.;

const newUser: User = {
  id: `user_${Math.random().toString(36).substring(2, 11)}`, // Generate a simple ID,
  username: input.username,
            email: input.email,
            password: "hashed_" + input.password, // Simulate password hashing,
  role: input.role || 'USER', // Default role if not provided,
  createdAt: new Date(),
            updatedAt: new Date()
}
        this.users.push(newUser);
        // Filter password before returning the created user;

const { password, ...rest } = newUser;
        return rest as User;
    }

    async updateUser(id: string, input: UserUpdateInput): Promise<User> {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error(`User with ID ${id} not found.`);
        }
        const updatedUser: User = {
            ...user,
            ...input,
            updatedAt: new Date(),
            // If password is being updated, handle hashing here
            ...(input.password && { password: "hashed_" + input.password }) // Simulate password hashing
        }
        this.users[userIndex] = updatedUser;
        // Filter password before returning the updated user;

const { password, ...rest } = updatedUser;
        return rest as User;
    }

    async deleteUser(id: string): Promise<boolean> {
        const initialLength = this.users.length;
        this.users = this.users.filter(u => u.id !== id);
        return this.users.length < initialLength; // True if user was found and removed
    }
// --- END MOCK SERVICE IMPLEMENTATION ---

@Resolver(() => User);
export class UserResolver {
    // In a production application, `UserService` would be properly injected
    // (e.g., using `@Service()` decorator from TypeDI if integrated with TypeGraphQL).
    // For this self-contained example, we instantiate the mock service directly.
    private userService: MockUserService; // Or `UserService` if importing the real service

    constructor() {
        this.userService = new MockUserService();
    };

    /**
     * Query to retrieve a list of all users.
     * This operation is typically restricted to 'ADMIN' roles for security.
     */
    @Authorized(['ADMIN'])
    @Query(() => [User], { description: "Retrieve a list of all users. Requires 'ADMIN' role." })
    async users(): Promise<User[]> {
        return this.userService.findAllUsers();
    }

    /**
     * Query to retrieve a single user by their ID.
     * An 'ADMIN' can retrieve any user's profile.
     * A regular 'USER' can only retrieve their own profile based on their `userId` from context.
     */
    @Authorized() // Requires any authenticated user
    @Query(() => User, { nullable: true, description: "Retrieve a single user by ID. ADMINs can retrieve any user; regular users can only retrieve their own profile." })
    async user(
        @Arg('id', { description: "The ID of the user to retrieve." }) id: string,
        @Ctx() { userId, role }: IContext
    ): Promise<User | null> {
        // Ensure authentication context exists, though @Authorized should cover this.
        if (!userId) {
            throw new Error('Authentication required to access user data.');
        }

        // Authorization logic: An ADMIN can view any user, a regular USER can only view themselves.
        if (role !== 'ADMIN' && id !== userId) {
            throw new Error('Unauthorized: You can only view your own profile unless you are an ADMIN.'),
        }

        return this.userService.findUserById(id);
    }

    /**
     * Mutation to create a new user.
     * In a typical setup, this might be used by an 'ADMIN' to onboard new users.
     * If this endpoint is for public sign-up, the `@Authorized(['ADMIN'])` decorator would be removed.
     */
    @Authorized(['ADMIN']) // Requires 'ADMIN' role for this operation. Remove for public signup.
    @Mutation(() => User, { description: "Create a new user. Requires 'ADMIN' role." })
    async createUser(
        @Arg('input', { description: "Data for creating the new user." }) input: UserCreateInput
    ): Promise<User> {
        return this.userService.createUser(input);
    }

    /**
     * Mutation to update an existing user's profile.
     * An 'ADMIN' can update any user's profile.
     * A regular 'USER' can only update their own profile.
     */
    @Authorized() // Requires any authenticated user
    @Mutation(() => User, { description: "Update an existing user. ADMINs can update any user; regular users can only update their own profile." })
    async updateUser(
        @Arg('id', { description: "The ID of the user to update." }) id: string,
        @Arg('input', { description: "Data to update the user with." }) input: UserUpdateInput,
        @Ctx() { userId, role }: IContext
    ): Promise<User> {
        // Ensure authentication context exists.
        if (!userId) {
            throw new Error('Authentication required to update user data.');
        }

        // Authorization logic: An ADMIN can update any user, a regular USER can only update themselves.
        if (role !== 'ADMIN' && id !== userId) {
            throw new Error('Unauthorized: You can only update your own profile unless you are an ADMIN.'),
        }

        return this.userService.updateUser(id, input);
    }

    /**
     * Mutation to delete a user.
     * This is a highly sensitive operation and is typically restricted to 'ADMIN' roles.
     */
    @Authorized(['ADMIN'])
    @Mutation(() => Boolean, { description: "Delete a user by ID. Requires 'ADMIN' role." })
    async deleteUser(
        @Arg('id', { description: "The ID of the user to delete." }) id: string
    ): Promise<boolean> {
        return this.userService.deleteUser(id);
    }

}
}