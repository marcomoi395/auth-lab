const { requireRole } = require('../../../src/middlewares/authorization');
const { AuthenticationError } = require('../../../src/utils/errors');

// Mock dependencies
jest.mock('../../../src/utils/logger', () => ({
    warn: jest.fn(),
}));

describe('Authorization Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {};
        mockRes = {};
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    test('should authorize user with required role', () => {
        // Setup
        mockReq.authenticatedUser = {
            _id: 'user123',
            email: 'user@example.com',
            role: 'admin',
        };
        const middleware = requireRole('admin');

        // Execute
        middleware(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
    });

    test('should authorize user with any of the required roles', () => {
        // Setup
        mockReq.authenticatedUser = {
            _id: 'user123',
            email: 'user@example.com',
            role: 'editor',
        };
        const middleware = requireRole(['admin', 'editor', 'moderator']);

        // Execute
        middleware(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
    });

    test('should handle missing authenticatedUser', () => {
        // Setup - no authenticatedUser
        const middleware = requireRole('admin');

        // Execute
        middleware(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
        expect(mockNext.mock.calls[0][0].message).toBe(
            'Authentication required',
        );
    });

    test('should reject user with insufficient role', () => {
        // Setup
        mockReq.authenticatedUser = {
            _id: 'user123',
            email: 'user@example.com',
            role: 'user',
        };
        const middleware = requireRole('admin');

        // Execute
        middleware(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
        expect(mockNext.mock.calls[0][0].message).toBe(
            'Insufficient permissions',
        );
    });

    test('should reject user not in list of required roles', () => {
        // Setup
        mockReq.authenticatedUser = {
            _id: 'user123',
            email: 'user@example.com',
            role: 'guest',
        };
        const middleware = requireRole(['admin', 'editor', 'moderator']);

        // Execute
        middleware(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
        expect(mockNext.mock.calls[0][0].message).toBe(
            'Insufficient permissions',
        );
    });
});
