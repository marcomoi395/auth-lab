const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const tokenService = require('../../../src/services/tokenService');
const User = require('../../../src/models/User');
const TokenBlacklist = require('../../../src/models/TokenBlacklist');
const {
    AuthenticationError,
    ValidationError,
} = require('../../../src/utils/errors');

jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/TokenBlacklist');
jest.mock('../../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

describe('Token Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.PRIVATE_KEY = 'test_private_key';
        process.env.PUBLIC_KEY = 'test_public_key';
        process.env.JWT_EXPIRES_IN = '1h';
        process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    });

    describe('generateJwtTokenPair', () => {
        const mockUser = {
            _id: 'user123',
            email: 'test@example.com',
            role: 'user_role_id',
        };

        it('should generate access and refresh tokens', async () => {
            jwt.sign
                .mockReturnValueOnce('access_token')
                .mockReturnValueOnce('refresh_token');

            const result = await tokenService.generateJwtTokenPair(mockUser);

            expect(jwt.sign).toHaveBeenCalledTimes(2);
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: mockUser._id,
                    email: mockUser.email,
                    role: mockUser.role,
                }),
                process.env.PRIVATE_KEY,
                expect.objectContaining({
                    algorithm: 'RS256',
                    expiresIn: '1h',
                }),
            );
            expect(result).toEqual({
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            });
        });
    });

    describe('verifyAccessToken', () => {
        const accessToken = 'valid_access_token';
        const decodedToken = {
            userId: 'user123',
            email: 'test@example.com',
            role: 'user_role_id',
        };

        it('should verify and return payload for valid token', async () => {
            jwt.verify.mockReturnValue(decodedToken);
            User.findById.mockResolvedValue({
                _id: 'user123',
                email: 'test@example.com',
                deleted: false,
            });

            const result = await tokenService.verifyAccessToken(accessToken);

            expect(jwt.verify).toHaveBeenCalledWith(
                accessToken,
                process.env.PUBLIC_KEY,
            );
            expect(User.findById).toHaveBeenCalledWith(decodedToken.userId);
            expect(result).toEqual(decodedToken);
        });

        it('should throw AuthenticationError if token is invalid', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(
                tokenService.verifyAccessToken(accessToken),
            ).rejects.toThrow(AuthenticationError);
        });

        it('should throw AuthenticationError if user is inactive', async () => {
            jwt.verify.mockReturnValue(decodedToken);
            User.findById.mockResolvedValue({ deleted: true });

            await expect(
                tokenService.verifyAccessToken(accessToken),
            ).rejects.toThrow(AuthenticationError);
        });

        it('should throw AuthenticationError if user not found', async () => {
            jwt.verify.mockReturnValue(decodedToken);
            User.findById.mockResolvedValue(null);

            await expect(
                tokenService.verifyAccessToken(accessToken),
            ).rejects.toThrow(AuthenticationError);
        });
    });

    describe('verifyRefreshToken', () => {
        const refreshToken = 'valid_refresh_token';
        const decodedToken = { userId: 'user123', email: 'test@example.com' };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('returns user and tokenDoc for valid refresh token', async () => {
            jwt.verify.mockReturnValue(decodedToken);
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                refreshToken,
            };
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await tokenService.verifyRefreshToken(refreshToken);

            expect(result).toEqual({
                user: mockUser,
                tokenDoc: { refreshToken },
            });
        });

        it('throws AuthenticationError if refresh token is invalid', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(
                tokenService.verifyRefreshToken(refreshToken),
            ).rejects.toThrow(AuthenticationError);
        });

        it('throws AuthenticationError if user is not found', async () => {
            jwt.verify.mockReturnValue(decodedToken);
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            await expect(
                tokenService.verifyRefreshToken(refreshToken),
            ).rejects.toThrow(AuthenticationError);
        });

        it("throws AuthenticationError if refresh token does not match user's token", async () => {
            jwt.verify.mockReturnValue(decodedToken);
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                refreshToken: 'different_token',
            };
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await expect(
                tokenService.verifyRefreshToken(refreshToken),
            ).rejects.toThrow(AuthenticationError);
        });
    });

    describe('refreshAccessToken', () => {
        const mockUser = {
            _id: 'user123',
            email: 'test@example.com',
            role: 'user',
            save: jest.fn().mockResolvedValue(true),
        };

        beforeEach(() => {
            jest.spyOn(tokenService, 'generateJwtTokenPair').mockResolvedValue({
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
            });
        });

        it('should generate new tokens and update user refresh token', async () => {
            const result = await tokenService.refreshAccessToken(mockUser);

            expect(tokenService.generateJwtTokenPair).toHaveBeenCalledWith(
                mockUser,
            );
            expect(mockUser.refreshToken).toBe('new_refresh_token');
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toEqual({
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
            });
        });

        it('should throw an error if user save fails', async () => {
            mockUser.save.mockRejectedValueOnce(new Error('Database error'));

            await expect(
                tokenService.refreshAccessToken(mockUser),
            ).rejects.toThrow('Database error');
            expect(tokenService.generateJwtTokenPair).toHaveBeenCalledWith(
                mockUser,
            );
            expect(mockUser.refreshToken).toBe('new_refresh_token');
        });

        it('should throw an error if token generation fails', async () => {
            tokenService.generateJwtTokenPair.mockRejectedValueOnce(
                new Error('Token generation failed'),
            );

            await expect(
                tokenService.refreshAccessToken(mockUser),
            ).rejects.toThrow('Token generation failed');
            expect(mockUser.save).not.toHaveBeenCalled();
        });
    });

    describe('revokeToken', () => {
        it('should add token to blacklist', async () => {
            const token = 'token_to_revoke';
            const userId = 'user123';

            TokenBlacklist.create.mockResolvedValue({ token, user: userId });

            await tokenService.revokeToken(token, userId);

            expect(TokenBlacklist.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    token,
                    user: userId,
                    createdAt: expect.any(Date),
                }),
            );
        });
    });

    describe('revokeAllUserTokens', () => {
        it('should remove refresh token from user document', async () => {
            const userId = 'user123';

            User.updateOne.mockResolvedValue({ nModified: 1 });

            await tokenService.revokeAllUserTokens(userId);

            expect(User.updateOne).toHaveBeenCalledWith(
                { _id: userId },
                { $unset: { refreshToken: 1 } },
            );
        });
    });

    describe('generatePasswordResetToken', () => {
        it('should generate plain and hashed reset tokens with expiry', async () => {
            const mockUser = { email: 'test@example.com' };
            const mockPlainToken = 'plain_reset_token';
            const mockHashedToken = 'hashed_reset_token';

            crypto.randomBytes.mockReturnValue({
                toString: jest.fn().mockReturnValue(mockPlainToken),
            });

            crypto.createHash.mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(mockHashedToken),
            });

            const result =
                await tokenService.generatePasswordResetToken(mockUser);

            expect(crypto.randomBytes).toHaveBeenCalledWith(32);
            expect(crypto.createHash).toHaveBeenCalledWith('sha256');
            expect(result).toHaveProperty('plainToken', mockPlainToken);
            expect(result).toHaveProperty('hashedToken', mockHashedToken);
            expect(result).toHaveProperty('expiry');
        });
    });

    describe('verifyPasswordResetToken', () => {
        const plainToken = 'plain_reset_token';
        const hashedToken = 'hashed_reset_token';

        it('should verify and return user for valid reset token', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                resetToken: hashedToken,
                resetTokenExpiry: Date.now() + 3600000, // 1 hour in the future
                save: jest.fn().mockResolvedValue(true),
            };

            crypto.createHash.mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(hashedToken),
            });

            User.findOne.mockResolvedValue(mockUser);

            const result =
                await tokenService.verifyPasswordResetToken(plainToken);

            expect(crypto.createHash).toHaveBeenCalledWith('sha256');
            expect(User.findOne).toHaveBeenCalledWith({
                resetToken: hashedToken,
                resetTokenExpiry: { $gt: expect.any(Number) },
            });
            expect(mockUser.resetToken).toBeUndefined();
            expect(mockUser.resetTokenExpiry).toBeUndefined();
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should throw ValidationError if token is invalid or expired', async () => {
            crypto.createHash.mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(hashedToken),
            });

            User.findOne.mockResolvedValue(null);

            await expect(
                tokenService.verifyPasswordResetToken(plainToken),
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('generateEmailVerificationToken', () => {
        it('should generate a JWT verification token', async () => {
            const mockUser = { _id: 'user123', email: 'test@example.com' };
            const mockToken = 'verification_token';

            jwt.sign.mockReturnValue(mockToken);

            const result =
                await tokenService.generateEmailVerificationToken(mockUser);

            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: mockUser._id, email: mockUser.email },
                process.env.PRIVATE_KEY,
                { expiresIn: '1d' },
            );
            expect(result).toBe(mockToken);
        });
    });

    describe('verifyEmailVerificationToken', () => {
        const token = 'verification_token';
        const decodedToken = { userId: 'user123', email: 'test@example.com' };

        it('should verify and return user for valid verification token', async () => {
            const mockUser = { _id: 'user123', email: 'test@example.com' };

            jwt.verify.mockReturnValue(decodedToken);
            User.findById.mockResolvedValue(mockUser);

            const result =
                await tokenService.verifyEmailVerificationToken(token);

            expect(jwt.verify).toHaveBeenCalledWith(
                token,
                process.env.PUBLIC_KEY,
            );
            expect(User.findById).toHaveBeenCalledWith(decodedToken.userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw ValidationError if token is invalid', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(
                tokenService.verifyEmailVerificationToken(token),
            ).rejects.toThrow(ValidationError);
        });

        it('should throw ValidationError if user not found', async () => {
            jwt.verify.mockReturnValue(decodedToken);
            User.findById.mockResolvedValue(null);

            await expect(
                tokenService.verifyEmailVerificationToken(token),
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('isTokenBlacklisted', () => {
        it('should return true if token is in blacklist', async () => {
            const token = 'blacklisted_token';

            TokenBlacklist.findOne.mockResolvedValue({ token });

            const result = await tokenService.isTokenBlacklisted(token);

            expect(TokenBlacklist.findOne).toHaveBeenCalledWith({ token });
            expect(result).toBe(true);
        });

        it('should return false if token is not blacklisted', async () => {
            const token = 'valid_token';

            TokenBlacklist.findOne.mockResolvedValue(null);

            const result = await tokenService.isTokenBlacklisted(token);

            expect(TokenBlacklist.findOne).toHaveBeenCalledWith({ token });
            expect(result).toBe(false);
        });
    });
});
