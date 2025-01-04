const dorenv = require('dotenv');
dorenv.config();

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

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const user = { username: username, password: password };
    users.push(user);
    res.status(201).json({ message: "User Created successfully" })
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(ele => ele.username === username);
    if (!user) {
        return res.status(400).json({ message: "User not Found" });
    }

    if (user.password !== password) {
        return res.status(400).json({ message: "Incorrect Password" });
    }

    return res.json({ message: "User successfully logged in!" })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});