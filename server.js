const dorenv = require('dotenv');
dorenv.config();

const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());

// db
const users = [];
// server
const sessions = new Map();

app.get("/", authMiddleware, (req, res) => {
    res.json({ message: `Hello ${req.user.username}` })
});

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

    const sessionId = crypto.randomUUID()
    sessions.set(sessionId, user);

    res.cookie("sessionId", sessionId);

    return res.json({ message: "User successfully logged in!" })
});

app.delete("/logout", (req, res) => {
    sessions.delete(req.cookies.sessionId);
    res.json({ message: "User successfully logged out" })
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function authMiddleware(req, res, next) {
    const user = sessions.get(req.cookies.sessionId);
    if (!user) {
        return res.status(400).json({ message: "Unauthorized" })
    }
    req.user = user;
    next();
}