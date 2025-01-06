const dorenv = require('dotenv');
dorenv.config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const app = express();
const PORT = process.env.PORT2; // 5001
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
app.use(express.json());

// db
const users = [];
const sessions = new Set();

app.get("/admin", (req, res) => {
    res.send(users);
});

app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt();
        const hasPassword = await bcrypt.hash(password, salt);
        const user = { username: username, password: hasPassword };
        users.push(user);
        res.status(201).json({ message: "User Created successfully" })
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});

app.post("/token", (req, res) => {
    const refresh_token = req.body.token;
    if (!refresh_token) return res.status(401).json({ message: "Unauthorized" });
    if (!sessions.has(refresh_token)) return res.status(401).json({ message: "You need to login!" });

    jwt.verify(refresh_token, REFRESH_SECRET, function (err, token_data) {
        if (err) return res.status(403).json({ message: "Forbidden", error: err });

        // {user: token_data.user} Remove "iat"(Time Stamp) from the data
        const token = generateAccessToken({ user: token_data.user });
        return res.json({ token });
    })
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(ele => ele.username === username);
    if (!user) {
        return res.status(400).json({ message: "User not Found" });
    }
    try {
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).json({ message: "Incorrect Password" });
        }
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong" });
    }

    const userInfo = { username: user.username };
    const token_data = { user: userInfo };

    const refresh_token = jwt.sign(token_data, REFRESH_SECRET);
    sessions.add(refresh_token);

    const token = generateAccessToken(token_data);

    return res.json({ token, refresh_token });
});

app.delete("/logout", (req, res) => {
    const refresh_token = req.body.token;
    if (!sessions.has(refresh_token)) return res.status(401).json({ message: "No op" });

    sessions.delete(refresh_token);
    return res.status(200).json({ message: "Logged Out" })
});

function generateAccessToken(data) {
    return jwt.sign(data, SECRET, { expiresIn: "30s" });
}

app.listen(PORT, () => {
    console.log(`Server Auth running on port ${PORT}`);
});