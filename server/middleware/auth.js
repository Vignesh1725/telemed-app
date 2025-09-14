const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token =  req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if(!token) return res.status(401).json({ msg: "No token. Access denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ msg: "Token invalid" });
    }
};

const requireRole = (role) => {
    return function (req, res, next) {
        if (req.user.role !== role) {
            return res.status(403).json({ msg: `Access only for ${role}s.`});
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };