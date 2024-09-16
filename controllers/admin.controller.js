const pool = require("../config/db.config");
const asyncHandler = require("../utils/asyncHandler");
const { InternalError, ApiResponse } = require("../utils/responses");
const bcrypt = require("bcryptjs");

exports.createNewUser = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, password, role, dateOfBirth, gender } = req.body;

    // add validations
    if (!name || !email || !password || !role || !dateOfBirth || !gender) {
      return ApiError(
        res,
        400,
        "Please provide name, email, password, role, dateOfBirth, gender"
      );
    }

    const encPassword = await bcrypt.hash(password, 10);

    await client.query("begin");
    const credentialResponse = (
      await client.query(
        `insert into main.credentials (email, password, role) values ($1, $2, $3) returning *`,
        [email, encPassword, role]
      )
    ).rows[0];

    console.log("cred:", credentialResponse);

    const userResponse = (
      await client.query(
        `insert into main.student (name, date_of_birth, gender, credential_id) values ($1, $2, $3, $4) returning *`,
        [name, dateOfBirth, gender, credentialResponse.credential_id]
      )
    ).rows[0];

    console.log("userResponse", userResponse);

    await client.query("commit");
    return ApiResponse(res, 201, "user created successfully", userResponse);
  } catch (error) {
    console.log("createNewUser err:", error.message);
    await client.query("rollback");
    InternalError(res, error.message);
  } finally {
    client.release();
  }
});
