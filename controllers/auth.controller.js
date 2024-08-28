const asyncHandler = require("../utils/asyncHandler");
const { ApiResponse, ApiError, InternalError } = require("../utils/responses");
const pool = require("../config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginUser = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return ApiError(res, 400, "Please provide email and password");
    }

    const existingUser = (
      await client.query(`select * from main.credentials where email = $1`, [
        email,
      ])
    ).rows;

    console.log("existing user:", existingUser);

    if (existingUser.length === 0) {
      return ApiError(res, 400, "User does not exist");
    }

    if (role !== existingUser[0].role) {
      return ApiError(res, 400, "No email found with this role");
    }

    let isValidPassword = await bcrypt.compare(
      password,
      existingUser[0].password
    );

    if (!isValidPassword) {
      return ApiError(res, 400, "Invalid password");
    }

    let userData;
    if (role === "student") {
      userData = (
        await client.query(
          `select * from eb.student where credential_id = ${existingUser[0].id}`
        )
      ).rows[0];
    } else if (role === "teacher") {
      userData = (
        await client.query(
          `select * from eb.teacher where credential_id = ${existingUser[0].id}`
        )
      ).rows[0];
    }

    // create a token
    const payload = {
      id: userData.id,
      email: existingUser[0].email,
      role: existingUser[0].role,
    };

    const options = {
      expiresIn: "7d", // Token expiry time: 7 days
    };
    const token = await jwt.sign(payload, process.env.SECRET_KEY, options);

    console.log("token:", token);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 days in milliseconds

    return ApiResponse(res, 200, "User logged in successfully", {
      token: token,
      userData: payload,
    });
  } catch (error) {
    console.log(error);
    InternalError(res);
  } finally {
    client.release();
  }
});

exports.logoutUser = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token");
    return ApiResponse(res, 200, "User logged out successfully");
  } catch (error) {
    console.log("logutUser err:", error);
    return InternalError(res);
  }
});
