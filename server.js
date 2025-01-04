const dorenv = require('dotenv');
dorenv.config();

const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const PORT = process.env.PORT;
app.use(express.json());

const users = [];

app.get("/", (req, res) => {
    res.send("Hello World");
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

    try {
        const user = users.find(ele => ele.username === username);
        if (!user) {
            return res.status(400).json({ message: "User not Found" });
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).json({ message: "Incorrect Password" });
        }

        return res.json({ message: "User successfully logged in!" })
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});