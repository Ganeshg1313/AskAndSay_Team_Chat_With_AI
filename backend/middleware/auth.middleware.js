// Role: Authenticate incoming requests by validating JWT and checking logout blacklist

import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    // 1. Extract JWT from cookie or Authorization header
    const token =
      req.cookies.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      // No token provided
      return res.status(401).json({ error: "Unauthorized User" });
    }

    // 2. Check if token has been invalidated (user logged out)
    const isBlackListed = await redisClient.get(token);
    if (isBlackListed) {
      // Clear cookie to prevent further reuse
      res.cookie("token", "", { httpOnly: true });
      return res.status(401).json({ error: "Unauthorized User" });
    }

    // 3. Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach decoded payload (e.g., user email) to request for downstream handlers
    req.user = decoded;

    // 5. Proceed to next middleware or route handler
    next();
  } catch (err) {
    // Any error implies invalid or expired token
    return res.status(401).json({ error: "Unauthorized User" });
  }
};
