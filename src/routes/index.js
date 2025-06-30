const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');

const router = Router();

// Health check route
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Auth Lab API - Service is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// Mount route modules
router.use('/v1/api/auth', authRoutes);
router.use('/v1/api/user', userRoutes);
router.use('/v1/api/admin', adminRoutes);

// 404 handler for undefined routes
router.use(/(.*)/, (req, res, next) => {
    const error = new Error('Resource not found');
    error.status = 404;
    next(error);
});

module.exports = router;
