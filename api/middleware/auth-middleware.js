const db = require("../../data/dbConfig");

function validateUserData(req, res, next) {
    console.log("Validating User Data");
    let { username, password } = req.body;

    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "username and password required" });
    }
    if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "username and password required" });
    }

    username = username.trim();
    password = password.trim();
    req.user = { username, password };
    next();
}

async function usernameTaken(req, res, next) {
    const users = await db("users");
    const userExists = users.find((user) => user.username === req.user.username);
    if (userExists) {
        return res.status(400).json({ message: "username taken" });
    }
    next();
}

async function userExists(req, res, next) {
    const { username } = req.user;
    const users = await db("users");
    const userExists = users.find((user) => user.username === username);
    if (!userExists) {
        return res.status(401).json({ message: "invalid credentials" });
    }
    req.user = await db("users").where({ username }).first();
    next();
}

module.exports = { validateUserData, usernameTaken, userExists };
