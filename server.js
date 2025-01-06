const dorenv = require('dotenv');
dorenv.config();

const express = require('express');
const jwt = require('jsonwebtoken')
const app = express();
const PORT = process.env.PORT1; // 5000
const SECRET = process.env.ACCESS_TOKEN_SECRET;
app.use(express.json());

app.get("/", authenticateToken, (req, res) => {
    res.json({ message: `Hello ${req.user.username}` })
});


function authenticateToken(req, res, next) {
    // console.log(req.headers);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);

    if (!token) {
        return res.status(400).json({ message: "You need To login!" });
    }

    // After Verify it call a callback for checking error
    jwt.verify(token, SECRET, function (err, token_data) {
        if (err) return res.status(400).json({ message: "Forbidden", error: err });

        req.user = token_data.user;
        next();
    });
}

app.listen(PORT, () => {
    console.log(`Server Dev running on port ${PORT}`);
});