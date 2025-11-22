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

module.exports = authMiddleware;
