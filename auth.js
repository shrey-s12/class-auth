const dorenv = require('dotenv');
dorenv.config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const app = express();
const PORT = process.env.PORT2; // 5001
const SECRET = process.env.ACCESS_TOKEN_SECRET;
app.use(express.json());

// db
const users = [];

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
    const token = jwt.sign(userInfo, SECRET, { expiresIn: "30s" });

    return res.json(token);
});

app.delete("/logout", (req, res) => {
    res.json({ message: "User successfully logged out" })
});

app.listen(PORT, () => {
    console.log(`Server Auth running on port ${PORT}`);
});