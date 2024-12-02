const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  if (!authHeaders) {
    return res.json({ message: "Denied" });
  }
  const token = authHeaders.split(" ")[1];
  if (!token) {
    return res.json({ message: "Forbidden" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded.userId;
    next();
  } catch (err) {
    return res.json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
