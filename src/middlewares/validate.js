const validate = (schema) => (req, res, next) => {
    try {
        // Validate the request against the schema
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // If validation fails, return error response
        if (!result.success) {
            const formattedErrors = result.error.errors.map((error) => ({
                path: error.path.join('.'),
                message: error.message,
            }));

            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: formattedErrors,
            });
        }

        // Optional: replace req properties with validated data
        if (result.data.body) req.body = result.data.body;
        if (result.data.query) req.query = result.data.query;
        if (result.data.params) req.params = result.data.params;

        return next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during validation',
            detail: error.message,
        });
    }
};

module.exports = {
    validate,
};
