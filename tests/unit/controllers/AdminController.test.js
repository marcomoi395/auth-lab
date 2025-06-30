const adminController = require('../../../src/controllers/AdminController');
const userService = require('../../../src/services/userService');
const { SuccessResponse } = require('../../../src/utils/responseHelper');

// Mock dependencies
jest.mock('../../../src/services/userService');
jest.mock('../../../src/utils/responseHelper');

describe('AdminController', () => {
    let req;
    let res;
    let next;
    let mockSuccessResponse;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup request, response and next function mocks
        req = {
            query: {},
            params: { id: 'user123' },
            body: { name: 'Updated Name' },
        };

        res = {};
        next = jest.fn();

        // Mock SuccessResponse
        mockSuccessResponse = {
            send: jest.fn(),
        };
        SuccessResponse.mockImplementation(() => mockSuccessResponse);
    });

    describe('getAllUsers', () => {
        it('should fetch users successfully', async () => {
            // Mock service response
            const mockUsers = { users: [], total: 0, page: 1, limit: 10 };
            userService.getAllUsersWithPagination.mockResolvedValue(mockUsers);

            // Call the method
            await adminController.getAllUsers(req, res, next);

            // Assertions
            expect(userService.getAllUsersWithPagination).toHaveBeenCalledWith(
                req.query,
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Fetched users successfully',
                data: mockUsers,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            // Mock service error
            const error = new Error('Database error');
            userService.getAllUsersWithPagination.mockRejectedValue(error);

            // Call the method
            await adminController.getAllUsers(req, res, next);

            // Assertions
            expect(next).toHaveBeenCalledWith(error);
            expect(mockSuccessResponse.send).not.toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {
        it('should fetch user by ID successfully', async () => {
            // Mock service response
            const mockUser = { id: 'user123', name: 'Test User' };
            userService.getUserByIdForAdmin.mockResolvedValue(mockUser);

            // Call the method
            await adminController.getUserById(req, res, next);

            // Assertions
            expect(userService.getUserByIdForAdmin).toHaveBeenCalledWith(
                'user123',
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Fetched user successfully',
                data: mockUser,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle errors when fetching user', async () => {
            const error = new Error('User not found');
            userService.getUserByIdForAdmin.mockRejectedValue(error);

            await adminController.getUserById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const mockUpdatedUser = { id: 'user123', name: 'Updated Name' };
            userService.updateUserByAdmin.mockResolvedValue(mockUpdatedUser);

            await adminController.updateUser(req, res, next);

            expect(userService.updateUserByAdmin).toHaveBeenCalledWith(
                'user123',
                req.body,
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'User updated successfully',
                data: mockUpdatedUser,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle errors when updating user', async () => {
            const error = new Error('Update failed');
            userService.updateUserByAdmin.mockRejectedValue(error);

            await adminController.updateUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            userService.softDeleteUserByAdmin.mockResolvedValue(true);

            await adminController.deleteUser(req, res, next);

            expect(userService.softDeleteUserByAdmin).toHaveBeenCalledWith(
                'user123',
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'User deleted successfully',
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle errors when deleting user', async () => {
            const error = new Error('Delete failed');
            userService.softDeleteUserByAdmin.mockRejectedValue(error);

            await adminController.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('searchUsers', () => {
        it('should search users successfully', async () => {
            const mockSearchResults = { users: [], total: 0 };
            userService.searchUsers.mockResolvedValue(mockSearchResults);

            await adminController.searchUsers(req, res, next);

            expect(userService.searchUsers).toHaveBeenCalledWith(req.query);
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Search completed',
                data: mockSearchResults,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle errors when searching users', async () => {
            const error = new Error('Search failed');
            userService.searchUsers.mockRejectedValue(error);

            await adminController.searchUsers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
