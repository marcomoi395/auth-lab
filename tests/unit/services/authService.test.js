const bcrypt = require('bcrypt');
const authService = require('../../../src/services/authService');
const User = require('../../../src/models/User');
const Role = require('../../../src/models/Role');
const tokenService = require('../../../src/services/tokenService');
const {
    AuthenticationError,
    ValidationError,
    ConflictError,
} = require('../../../src/utils/errors');

jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Role');
jest.mock('../../../src/services/tokenService');
jest.mock('../../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));
jest.mock('bcrypt');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
}));
jest.mock('../../../src/utils', () => ({
    convertToObjectId: jest.fn((id) => id),
}));

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loginUserWithEmailAndPassword', () => {
        const mockLoginData = {
            email: 'test@example.com',
            password: 'Password123',
        };
        const mockUser = {
            _id: 'user123',
            email: 'test@example.com',
            password: 'hashed_password',
            toObject: jest.fn(() => ({
                _id: 'user123',
                email: 'test@example.com',
                password: 'hashed_password',
                resetToken: 'token123',
                role: 'user',
            })),
            save: jest.fn().mockResolvedValue(true),
        };
        const mockReq = {};

        it('should authenticate user with valid credentials', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            tokenService.generateJwtTokenPair.mockResolvedValue({
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            });

            const result = await authService.loginUserWithEmailAndPassword(
                mockLoginData,
                mockReq,
            );

            expect(User.findOne).toHaveBeenCalledWith({
                email: mockLoginData.email,
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockLoginData.password,
                mockUser.password,
            );
            expect(tokenService.generateJwtTokenPair).toHaveBeenCalledWith(
                mockUser,
            );
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken', 'access_token');
            expect(result).toHaveProperty('refreshToken', 'refresh_token');
        });

        it('should throw ValidationError if validation fails', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Invalid email' }],
            });

            await expect(
                authService.loginUserWithEmailAndPassword(
                    mockLoginData,
                    mockReq,
                ),
            ).rejects.toThrow(ValidationError);
        });

        it('should throw AuthenticationError if user not found', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            User.findOne.mockResolvedValue(null);

            await expect(
                authService.loginUserWithEmailAndPassword(
                    mockLoginData,
                    mockReq,
                ),
            ).rejects.toThrow(AuthenticationError);
            expect(User.findOne).toHaveBeenCalledWith({
                email: mockLoginData.email,
            });
        });

        it('should throw AuthenticationError if password is invalid', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(
                authService.loginUserWithEmailAndPassword(
                    mockLoginData,
                    mockReq,
                ),
            ).rejects.toThrow(AuthenticationError);
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockLoginData.password,
                mockUser.password,
            );
        });
    });

    describe('logoutUser', () => {
        it('should update user and blacklist token', async () => {
            const userId = 'user123';
            const email = 'test@example.com';
            const refreshToken = 'refresh_token';

            User.updateOne.mockResolvedValue({ nModified: 1 });
            tokenService.revokeToken.mockResolvedValue(true);

            await authService.logoutUser(userId, email, refreshToken);

            expect(User.updateOne).toHaveBeenCalledWith(
                { _id: userId },
                { $set: { refreshToken: null } },
            );
            expect(tokenService.revokeToken).toHaveBeenCalledWith(
                refreshToken,
                userId,
            );
        });
    });

    describe('registerNewUserWithEmailVerification', () => {
        const mockRegistrationData = {
            email: 'new@example.com',
            password: 'Password123',
            username: 'newuser',
        };
        const mockReq = {};
        const mockUserRole = { _id: 'role123', roleName: 'user' };

        it('should register a new user successfully', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed_password');
            Role.findOne.mockResolvedValue(mockUserRole);

            const mockSavedUser = {
                _id: 'user123',
                email: mockRegistrationData.email,
                username: mockRegistrationData.username,
            };
            User.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);

            const result =
                await authService.registerNewUserWithEmailVerification(
                    mockRegistrationData,
                    mockReq,
                );

            expect(User.findOne).toHaveBeenCalledWith({
                email: mockRegistrationData.email,
            });
            expect(bcrypt.hash).toHaveBeenCalled();
            expect(Role.findOne).toHaveBeenCalledWith({ roleName: 'user' });
            expect(User.prototype.save).toHaveBeenCalled();
            expect(result).toHaveProperty('userId');
            expect(result).toHaveProperty('message');
        });

        it('should throw ValidationError if validation fails', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Invalid email format' }],
            });

            await expect(
                authService.registerNewUserWithEmailVerification(
                    mockRegistrationData,
                    mockReq,
                ),
            ).rejects.toThrow(ValidationError);
        });

        it('should throw ConflictError if email already exists', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            User.findOne.mockResolvedValue({
                email: mockRegistrationData.email,
            });

            await expect(
                authService.registerNewUserWithEmailVerification(
                    mockRegistrationData,
                    mockReq,
                ),
            ).rejects.toThrow(ConflictError);
            expect(User.findOne).toHaveBeenCalledWith({
                email: mockRegistrationData.email,
            });
        });

        it('should throw Error if user role is not found', async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed_password');
            Role.findOne.mockResolvedValue(null);

            await expect(
                authService.registerNewUserWithEmailVerification(
                    mockRegistrationData,
                    mockReq,
                ),
            ).rejects.toThrow('Role "user" not found');
        });
    });

    describe('refreshAccessToken', () => {
        const refreshToken = 'refresh_token';
        const mockUser = { _id: 'user123', email: 'test@example.com' };
        const mockTokenDoc = { refreshToken };

        it('should refresh access token successfully', async () => {
            tokenService.isTokenBlacklisted.mockResolvedValue(false);
            tokenService.verifyRefreshToken.mockResolvedValue({
                user: mockUser,
                tokenDoc: mockTokenDoc,
            });
            tokenService.refreshAccessToken.mockResolvedValue({
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
            });

            const result = await authService.refreshAccessToken(refreshToken);

            expect(tokenService.isTokenBlacklisted).toHaveBeenCalledWith(
                refreshToken,
            );
            expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(
                refreshToken,
            );
            expect(tokenService.refreshAccessToken).toHaveBeenCalledWith(
                mockUser,
            );
            expect(tokenService.revokeToken).toHaveBeenCalledWith(
                refreshToken,
                mockUser._id,
            );
            expect(result).toEqual({
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
            });
        });

        it('should throw AuthenticationError if token is blacklisted', async () => {
            tokenService.isTokenBlacklisted.mockResolvedValue(true);
            tokenService.verifyRefreshToken.mockResolvedValue({
                user: mockUser,
            });

            await expect(
                authService.refreshAccessToken(refreshToken),
            ).rejects.toThrow(AuthenticationError);
            expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(
                mockUser._id,
            );
        });
    });
});
