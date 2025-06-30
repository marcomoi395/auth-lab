const userService = require('../../../src/services/userService');
const User = require('../../../src/models/User');
const { ValidationError, ConflictError } = require('../../../src/utils/errors');

jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Role');
jest.mock('../../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

describe('User Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserProfileById', () => {
        const userId = 'user123';

        it('should return user profile for valid user ID', async () => {
            const mockUser = {
                _id: userId,
                username: 'testuser',
                email: 'test@example.com',
                role: 'user_role',
            };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await userService.getUserProfileById(userId);

            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw ValidationError if user not found', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            await expect(
                userService.getUserProfileById(userId),
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('updateUserProfile', () => {
        const userId = 'user123';
        const mockUser = {
            _id: userId,
            email: 'test@example.com',
            username: 'testuser',
        };

        it('should update user profile with valid data', async () => {
            const updateData = { username: 'updated_username' };
            const updatedUser = {
                _id: userId,
                username: 'updated_username',
                email: 'test@example.com',
                role: 'user_role',
            };

            User.findByIdAndUpdate.mockReturnValue({
                select: jest.fn().mockResolvedValue(updatedUser),
            });

            const result = await userService.updateUserProfile(
                mockUser,
                updateData,
            );

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUser._id,
                { $set: updateData },
                { new: true },
            );
            expect(result).toEqual(updatedUser);
        });

        it('should throw ConflictError if updating email to one that already exists', async () => {
            const updateData = { email: 'existing@example.com' };

            User.findOne.mockResolvedValue({ email: 'existing@example.com' });

            await expect(
                userService.updateUserProfile(mockUser, updateData),
            ).rejects.toThrow(ConflictError);
            expect(User.findOne).toHaveBeenCalledWith({
                email: updateData.email,
            });
        });

        it('should allow updating to the same email', async () => {
            const updateData = { email: 'test@example.com' }; // Same as current email
            const updatedUser = {
                _id: userId,
                username: 'testuser',
                email: 'test@example.com',
                role: 'user_role',
            };

            User.findByIdAndUpdate.mockReturnValue({
                select: jest.fn().mockResolvedValue(updatedUser),
            });

            const result = await userService.updateUserProfile(
                mockUser,
                updateData,
            );

            // Email check should be skipped since it's the same email
            expect(User.findOne).not.toHaveBeenCalled();
            expect(result).toEqual(updatedUser);
        });
    });

    describe('getAllUsersWithPagination', () => {
        it('should return paginated users with default params', async () => {
            const mockUsers = [
                { _id: 'user1', email: 'user1@example.com' },
                { _id: 'user2', email: 'user2@example.com' },
            ];

            User.countDocuments.mockResolvedValue(2);
            User.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue(mockUsers),
            });

            const result = await userService.getAllUsersWithPagination({});

            expect(User.countDocuments).toHaveBeenCalled();
            expect(User.find).toHaveBeenCalled();
            expect(result).toEqual({
                users: mockUsers,
                total: 2,
                currentPage: 1,
                totalPages: 1,
            });
        });

        it('should apply filter parameters correctly', async () => {
            const query = {
                page: 2,
                limit: 10,
                search: 'test',
                role: 'userRole',
                status: 'active',
                sortBy: 'email',
                sortOrder: 1,
            };

            const expectedFilter = {
                role: 'userRole',
                status: 'active',
                $or: [
                    { email: { $regex: 'test', $options: 'i' } },
                    { fullName: { $regex: 'test', $options: 'i' } },
                ],
            };

            User.countDocuments.mockResolvedValue(15);
            User.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue([]),
            });

            await userService.getAllUsersWithPagination(query);

            expect(User.countDocuments).toHaveBeenCalledWith(expectedFilter);
            expect(User.find).toHaveBeenCalledWith(expectedFilter);
        });
    });

    describe('getUserByIdForAdmin', () => {
        const userId = 'user123';

        it('should return detailed user info for admins', async () => {
            const mockUser = {
                _id: userId,
                username: 'testuser',
                email: 'test@example.com',
                role: 'role123',
                createdAt: new Date(),
            };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await userService.getUserByIdForAdmin(userId);

            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw ValidationError if user not found', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            await expect(
                userService.getUserByIdForAdmin(userId),
            ).rejects.toThrow(ValidationError);
        });
    });
});
