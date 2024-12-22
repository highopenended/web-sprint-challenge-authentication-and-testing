const db = require("../../data/dbConfig");

function validateUserData(req, res, next) {
    console.log("Validating User Data");
    let { username, password } = req.body;

    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Name is required and must be a string" });
    }
    if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Password is required and must be a string" });
    }

    username = username.trim();
    password = password.trim();
    req.user = { username, password };
    next();
}

async function checkUserExists(req, res, next) {
    console.log("Checking if user exists... : ", req.user.username);
    const users = await db("users");
    const userExists = users.find((user) => user.username === req.user.username);
    if (userExists) {
        return res.status(400).json("username taken");
    }
    next();
}
module.exports = { validateUserData, checkUserExists };
