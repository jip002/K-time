const {verify} = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const accessToken = req.header('accessToken');
    if(!accessToken) return res.json({error: "User not logged in"});
    try {
        const valid = verify(accessToken, "secret");
        if(valid) {
            req.user = valid;
            return next();
        }
    } catch (err) {
        return res.json({error: err});
    }
}

module.exports = { validateToken };