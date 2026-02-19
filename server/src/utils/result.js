/**
 * Return standardized API response
 * Created By: ThinhBui
 * Created Date: 17/02/2026
 */

const returnResult = (req, res, options = {}) => {
  const { code = 200, message = "Success", data = null } = options;

  return res.status(code).json({
    code,
    message,
    data,
    timestamp: new Date().toISOString(),
    path: req.originalUrl, 
  });
};

module.exports = { returnResult };