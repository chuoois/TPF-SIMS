const jwt = require("jsonwebtoken");
/**
 * Generate Access Token
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};
/**
 * Generate Refresh Token
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
