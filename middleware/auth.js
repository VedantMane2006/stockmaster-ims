const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Token is missing' });
        }

        // Extract token (Bearer <token>)
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'dev-secret-key');
        
        // Add user info to request
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Token is invalid' });
    }
};

const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // ADMIN always has full access (fallback to role_id === 1 for old tokens)
        if (req.user.role_name === 'ADMIN' || req.user.role_id === 1) {
            return next();
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role_name)) {
            return res.status(403).json({ error: 'Forbidden: You do not have the required role to perform this action' });
        }
        
        next();
    };
};

module.exports = { authMiddleware, authorize };
