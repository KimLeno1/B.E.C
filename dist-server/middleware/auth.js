import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const extractToken = (req, cookieKeys) => {
    for (const key of cookieKeys) {
        if (req.cookies && req.cookies[key])
            return req.cookies[key];
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return undefined;
};
export const authenticate = (req, res, next) => {
    const token = extractToken(req, ['ck_user_token', 'ck_admin_token']);
    if (!token)
        return res.status(401).json({ success: false, message: 'User authentication required' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
        return res.status(401).json({ success: false, message: 'Token issue', code });
    }
};
export const authenticateAdmin = (req, res, next) => {
    const token = extractToken(req, ['ck_admin_token']);
    if (!token)
        return res.status(401).json({ success: false, message: 'Admin authentication required' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
        return res.status(401).json({ success: false, message: 'Token issue', code });
    }
};
export const authenticateSupplier = (req, res, next) => {
    const token = extractToken(req, ['ck_supplier_token', 'ck_admin_token']);
    if (!token)
        return res.status(401).json({ success: false, message: 'Supplier authentication required' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
        return res.status(401).json({ success: false, message: 'Token issue', code });
    }
};
export const authenticateAny = (req, res, next) => {
    const token = extractToken(req, ['ck_user_token', 'ck_admin_token', 'ck_supplier_token']);
    if (!token)
        return res.status(401).json({ success: false, message: 'Authentication required' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
        return res.status(401).json({ success: false, message: 'Token issue', code });
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
        next();
    };
};
export const checkRole = authorize;
export const authenticateOrGuest = (req, res, next) => {
    const token = extractToken(req, ['ck_user_token', 'ck_admin_token', 'ck_supplier_token']);
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            return next();
        }
        catch (e) {
            // Continue to guest evaluation if token expired or invalid
        }
    }
    // Assign secure rate-limited guest identity based on guest header, cookie, or IP
    const guestHeader = req.headers['x-guest-session'] || req.cookies?.['ck_guest_id'];
    const ip = req.ip || req.socket.remoteAddress || 'guest';
    const cleanGuestId = typeof guestHeader === 'string' && guestHeader
        ? guestHeader.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48)
        : `gst_${Buffer.from(String(ip)).toString('hex').slice(0, 16)}`;
    req.user = {
        id: `guest_${cleanGuestId}`,
        email: 'guest@closetkraze.top',
        role: 'GUEST'
    };
    next();
};
export const optionalAuth = (req, res, next) => {
    const token = extractToken(req, ['ck_user_token', 'ck_admin_token', 'ck_supplier_token']);
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        catch (e) {
            // Ignore errors for optional auth
        }
    }
    next();
};
