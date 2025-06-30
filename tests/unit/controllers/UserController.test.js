const userController = require('../../../src/controllers/UserController');
const userService = require('../../../src/services/userService');
const { SuccessResponse } = require('../../../src/utils/responseHelper');

// Mock dependencies
jest.mock('../../../src/services/userService');
jest.mock('../../../src/utils/responseHelper');

describe('UserController', () => {
    let req;
    let res;
    let next;
    let mockSuccessResponse;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup request, response and next function mocks
        req = {
            authenticatedUser: {
                _id: 'user123',
                email: 'test@example.com',
            },
            body: {
                name: 'Updated Name',
                bio: 'New bio',
            },
        };

        res = {};
        next = jest.fn();

        // Mock SuccessResponse
        mockSuccessResponse = {
            send: jest.fn(),
        };
        SuccessResponse.mockImplementation(() => mockSuccessResponse);
    });

    describe('getProfile', () => {
        it('should fetch user profile successfully', async () => {
            // Mock service response
            const mockProfile = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
            };
            userService.getUserProfileById.mockResolvedValue(mockProfile);

            // Call the method
            await userController.getProfile(req, res, next);

            // Assertions
            expect(userService.getUserProfileById).toHaveBeenCalledWith(
                'user123',
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Profile fetched successfully',
                data: mockProfile,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle errors when fetching profile', async () => {
            // Mock service error
            const error = new Error('User not found');
            userService.getUserProfileById.mockRejectedValue(error);

            // Call the method
            await userController.getProfile(req, res, next);

            // Assertions
            expect(next).toHaveBeenCalledWith(error);
            expect(mockSuccessResponse.send).not.toHaveBeenCalled();
        });
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            // Mock service response
            const mockUpdatedProfile = {
                _id: 'user123',
                name: 'Updated Name',
                email: 'test@example.com',
                bio: 'New bio',
            };
            userService.updateUserProfile.mockResolvedValue(mockUpdatedProfile);

            // Call the method
            await userController.updateProfile(req, res, next);

            // Assertions
            expect(userService.updateUserProfile).toHaveBeenCalledWith(
                req.authenticatedUser,
                req.body,
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Profile updated successfully',
                data: mockUpdatedProfile,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle errors when updating profile', async () => {
            const error = new Error('Update failed');
            userService.updateUserProfile.mockRejectedValue(error);

            await userController.updateProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(mockSuccessResponse.send).not.toHaveBeenCalled();
        });
    });
});
