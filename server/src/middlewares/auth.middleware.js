const jwt = require("jsonwebtoken");

/**
 * Auth Middleware
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */

const verifyAccessToken = (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Access token not found" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    return res.status(403).json({ message: "Invalid access token" });
  }
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.roleCode)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

module.exports = { verifyAccessToken, verifyRole };
