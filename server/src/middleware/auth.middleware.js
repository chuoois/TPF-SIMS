const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

    // Gắn user info vào request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token đã hết hạn" });
    }

    return res.status(403).json({ message: "Access token không hợp lệ" });
  }
};

module.exports = { verifyAccessToken };
