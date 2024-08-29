const {
  ApiError,
  ApiResponse,
  InternalError,
} = require("../utils/responses.js");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken");
const pool = require("../config/db.config.js");

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const token = req.cookies.token;

    if (!token && req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }

    if (!token) {
      throw new ApiError(401, "Login first to access");
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    let userData;
    if (decoded.role === "student") {
      userData = (
        await client.query(
          `select s.id, s.credential_id, c.email, c.role from main.student s 
join main.credentials c on c.credential_id = s.credential_id where s.id = $1`,
          [decoded.id]
        )
      ).rows[0];
    } else if (decoded.role === "teacher") {
      userData = (
        await client.query(
          `select t.id, t.credential_id, c.email, c.role from main.teacher t 
join main.credentials c on c.credential_id = t.credential_id where t.id = $1`,
          [decoded.id]
        )
      ).rows[0];
    }
    req.user.userData;

    console.log("req.user:", req.user);
    next();
  } catch (error) {
    return ApiError(res, 401, "Unauthorized access");
  } finally {
    client.release();
  }
});

export const customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You are not allowed for this resource");
    }
    next();
  };
};
