const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization; // Extract the token from the Authorization header
    // Check if token exists

    console.log("Token: ", req.headers.authorization)


    if (!token) {
        return res.status(401).json("token required");
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json("token invalid");
        }
        req.decodedUser = decoded; 
        next();
    });
};



