const authController = require('../../../src/controllers/AuthController');
const authService = require('../../../src/services/authService');
const { SuccessResponse } = require('../../../src/utils/responseHelper');

// Mock dependencies
jest.mock('../../../src/services/authService');
jest.mock('../../../src/utils/responseHelper');

describe('AuthController', () => {
    let req;
    let res;
    let next;
    let mockSuccessResponse;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup request, response and next function mocks
        req = {
            body: {
                email: 'test@example.com',
                password: 'Password123!',
                refreshToken: 'valid-refresh-token',
            },
            authenticatedUser: {
                userId: 'user123',
                email: 'test@example.com',
                _id: 'user123',
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

    describe('register', () => {
        it('should register user successfully', async () => {
            // Mock service response
            const mockResult = { userId: 'user123', email: 'test@example.com' };
            authService.registerNewUserWithEmailVerification.mockResolvedValue(
                mockResult,
            );

            // Call the method
            await authController.register(req, res, next);

            // Assertions
            expect(
                authService.registerNewUserWithEmailVerification,
            ).toHaveBeenCalledWith(req.body, req);
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Registration successful. Please verify your email.',
                data: mockResult,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle registration errors', async () => {
            // Mock service error
            const error = new Error('Email already exists');
            authService.registerNewUserWithEmailVerification.mockRejectedValue(
                error,
            );

            // Call the method
            await authController.register(req, res, next);

            // Assertions
            expect(next).toHaveBeenCalledWith(error);
            expect(mockSuccessResponse.send).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            // Mock service response
            const mockResult = {
                accessToken: 'jwt-token',
                refreshToken: 'refresh-token',
                user: { id: 'user123', email: 'test@example.com' },
            };
            authService.loginUserWithEmailAndPassword.mockResolvedValue(
                mockResult,
            );

            // Call the method
            await authController.login(req, res, next);

            // Assertions
            expect(
                authService.loginUserWithEmailAndPassword,
            ).toHaveBeenCalledWith(req.body, req);
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Login successful',
                data: mockResult,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle login errors', async () => {
            const error = new Error('Invalid credentials');
            authService.loginUserWithEmailAndPassword.mockRejectedValue(error);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            authService.logoutUser.mockResolvedValue(true);

            await authController.logout(req, res, next);

            expect(authService.logoutUser).toHaveBeenCalledWith(
                'user123',
                'test@example.com',
                'valid-refresh-token',
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Logout successful',
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle logout errors', async () => {
            const error = new Error('Logout failed');
            authService.logoutUser.mockRejectedValue(error);

            await authController.logout(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            const mockResult = { accessToken: 'new-jwt-token' };
            authService.refreshAccessToken.mockResolvedValue(mockResult);

            await authController.refreshToken(req, res, next);

            expect(authService.refreshAccessToken).toHaveBeenCalledWith(
                'valid-refresh-token',
            );
            expect(SuccessResponse).toHaveBeenCalledWith({
                message: 'Token refreshed',
                data: mockResult,
            });
            expect(mockSuccessResponse.send).toHaveBeenCalledWith(res);
        });

        it('should handle token refresh errors', async () => {
            const error = new Error('Invalid refresh token');
            authService.refreshAccessToken.mockRejectedValue(error);

            await authController.refreshToken(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
