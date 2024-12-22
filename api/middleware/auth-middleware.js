function validateUserData(req, res, next) {

    console.log("Validating User Data")
    let { username, password } = req.body;


    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Name is required and must be a string" });
    }
    if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Password is required and must be a string" });
    }
    
    username=username.trim()
    password=password.trim()
    req.user={username,password}
    next();
}

module.exports = { validateUserData };