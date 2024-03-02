const {verify} = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const accessToken = req.header('Authorization');
    if (!accessToken) {
        // If no access token is provided, continue to the next middleware
        return next();
    }
    try {
        const token = accessToken.split(' ')[1]; // Extract token from 'Bearer <token>'
        const valid = verify(token, "secret");
        if(valid) {
            req.user = valid;
            return next();
        }
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = { validateToken };