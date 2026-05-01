const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("dotenv").config({ path: "../../.env" });

const SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT;
// Simulamos base de datos
const dataBaseUsuarios = [
{ id: 1, username: "user1", email: "user1@gmail.com", password: "$2b$10$lfEf9aeep5fUkybs0Lyg0OCcJDoad/VTogbGK7ZF4fZcX.EUVP.u2", role: "moderator", active: true , loginAttempts: 0,blockedUntil: null}, // 1234
{ id: 2, username: "user2", email: "user2@gmail.com", password: "$2b$10$T0F6eR9JoekNofa0u3olMuxDXWVkCC2zRbHXjloPvKOmqSzRHt4Zq", role: "user", active: false , loginAttempts: 0,blockedUntil: null}, // abcd
{ id: 3, username: "user3", email: "user3@gmail.com", password: "$2b$10$7yMXPbJGuxSX4OyZoJPFTehWWad2e4XfwnlD8Wg00SrDv3sK/XsZW", role: "user", active: true, loginAttempts: 0 ,blockedUntil: null}, // pass123
{ id: 4, username: "admin", email: "admin@gmail.com", password: "$2b$10$YBwQfrNjgB7K2CFy6akYL.uoPkt1lo3XRfkBJx1nukNsBGpNuo9La", role: "admin", active: true , loginAttempts: 0,blockedUntil: null} // admin
];

function verifyToken( req, res, next) {
    
    // Check Token
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Acceso denegado. No hay token" });

    // Verify token
    try {
        const decoded = jwt.verify(token, SECRET);
        // Keep
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({error:"Invalid token or token expired"})
    }
};

// Middleware checkRole

function checkRole(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.role)) return res.status(403).json({ error: "Access denied" });
        next();
        };
};

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Complete required fields" });

    const user = dataBaseUsuarios.find(e => e.email === email);
    if (!user) return res.status(404).json({ error: "User not found" });

    
    if (user.blockedUntil && user.blockedUntil > Date.now()) {
        return res.status(403).json({ error: "User temporaly blocked", timeRest: Math.ceil((user.blockedUntil - Date.now()) / 1000) })
    }
    if (user.blockedUntil && user.blockedUntil < Date.now()) {
        user.blockedUntil = null;
        user.loginAttempts = 0;
        user.active = true;
    }
    // Check if the account is desactived manually
    if (!user.active) return res.status(403).json({ error: "Disabled user by an administrator" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        user.loginAttempts++;
        if (user.loginAttempts >= 3) {
            user.active = false;
            // Block for a minute
            user.blockedUntil = Date.now() + (60 * 1000);
            return res.status(404).json({ error: "User blocked for entering the wrong password 3 times.Block for a minute" });
        }
        return res.status(401).json({ error: "Incorrect Password", intentos: user.loginAttempts });
    }
    // Successful login
    user.loginAttempts = 0;
    user.blockedUntil = null;


    // Create JWT
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role },
        SECRET,
        { expiresIn: "1h" }
    );

    // Send 
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 36000000
    });

    res.status(200).json({ message: "Successful Login", user: { username: user.username, role: user.role } });
});

// Protected Routes
app.get("/profile", verifyToken, (req, res) => {
    return res.status(200).json({ message: "Welcome to your profile", user: req.user });
})

app.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
    return res.status(200).json({ message: "Welcome to the admin panel" });
})

app.get("/staff", verifyToken, checkRole("admin", "moderator"), (req, res) => {
    return res.status(200).json({ message: "Welcome to the staff panel" })
});

app.listen(PORT, () => {
    console.log("Server is running ... http://localhost:3000");
});