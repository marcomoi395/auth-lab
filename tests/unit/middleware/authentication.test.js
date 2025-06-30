const {
    authenticateToken,
} = require('../../../src/middlewares/authentication');
const tokenService = require('../../../src/services/tokenService');
const Role = require('../../../src/models/Role');
const { AuthenticationError } = require('../../../src/utils/errors');

// Mock dependencies
jest.mock('../../../src/services/tokenService');
jest.mock('../../../src/models/Role');
jest.mock('../../../src/utils/logger', () => ({
    warn: jest.fn(),
}));

describe('Authentication Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
        };
        mockRes = {};
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    test('should authenticate valid token', async () => {
        // Setup
        mockReq.headers.authorization = 'Bearer valid_token';
        const mockPayload = {
            userId: 'user123',
            email: 'user@example.com',
            role: 'role123',
        };
        const mockRole = { roleName: 'user' };

        tokenService.verifyAccessToken.mockResolvedValue(mockPayload);
        Role.findById.mockResolvedValue(mockRole);

        // Execute
        await authenticateToken(mockReq, mockRes, mockNext);

        // Assert
        expect(tokenService.verifyAccessToken).toHaveBeenCalledWith(
            'valid_token',
        );
        expect(Role.findById).toHaveBeenCalledWith('role123');
        expect(mockReq.authenticatedUser).toEqual({
            _id: 'user123',
            email: 'user@example.com',
            role: 'user',
        });
        expect(mockNext).toHaveBeenCalledWith();
    });

    test('should handle missing authorization header', async () => {
        // Execute
        await authenticateToken(mockReq, mockRes, mockNext);

        // Assert
        expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
        expect(mockNext.mock.calls[0][0].message).toBe(
            'Authorization header missing or invalid',
        );
    });

    test('should handle invalid authorization format', async () => {
        // Setup
        mockReq.headers.authorization = 'InvalidFormat';

        // Execute
        await authenticateToken(mockReq, mockRes, mockNext);

        // Assert
        expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
        expect(mockNext.mock.calls[0][0].message).toBe(
            'Authorization header missing or invalid',
        );
    });

    test('should handle missing token', async () => {
        // Setup
        mockReq.headers.authorization = 'Bearer ';

        // Execute
        await authenticateToken(mockReq, mockRes, mockNext);

        // Assert
        expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
        expect(mockNext.mock.calls[0][0].message).toBe(
            'Access token is required',
        );
    });

    test('should handle token verification failure', async () => {
        // Setup
        mockReq.headers.authorization = 'Bearer invalid_token';
        const verificationError = new Error('Token verification failed');
        tokenService.verifyAccessToken.mockRejectedValue(verificationError);

        // Execute
        await authenticateToken(mockReq, mockRes, mockNext);

        // Assert
        expect(tokenService.verifyAccessToken).toHaveBeenCalledWith(
            'invalid_token',
        );
        expect(mockNext).toHaveBeenCalledWith(verificationError);
    });
});
