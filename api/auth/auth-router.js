const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateUserData, usernameTaken, userExists,correctPassword } = require("../middleware/auth-middleware");
const db = require("../../data/dbConfig");

router.post("/register", validateUserData, usernameTaken, async (req, res) => {
    const { username, password } = req.user;
    try {
        // Hash the password with bcryptjs
        const saltRounds = 10; // Recommended number of salt rounds
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            username,
            password: hashedPassword,
        };
        const [id] = await db("users").insert(newUser);


        res.status(201).json({...newUser, id});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", validateUserData, userExists,correctPassword, (req, res) => {
    const { id, username, password } = req.user;

    // Generate JWT Token
    const token = jwt.sign({ id, username, password }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: "1h",
    });

    // Respond with success message and token
    res.status(200).json({
        message: `welcome, ${username}`,
        token,
    });
});

module.exports = router;

 /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */