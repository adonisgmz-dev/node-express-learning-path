const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Simulamos base de datos
const dataBaseUsuarios = [
{ id: 1, username: "user1", email: "user1@gmail.com", password: "$2b$10$lfEf9aeep5fUkybs0Lyg0OCcJDoad/VTogbGK7ZF4fZcX.EUVP.u2", role: "user", active: true , loginAttempts: 0,blockedUntil: null}, // 1234
{ id: 2, username: "user2", email: "user2@gmail.com", password: "$2b$10$T0F6eR9JoekNofa0u3olMuxDXWVkCC2zRbHXjloPvKOmqSzRHt4Zq", role: "user", active: false , loginAttempts: 0,blockedUntil: null}, // abcd
{ id: 3, username: "user3", email: "user3@gmail.com", password: "$2b$10$7yMXPbJGuxSX4OyZoJPFTehWWad2e4XfwnlD8Wg00SrDv3sK/XsZW", role: "user", active: true, loginAttempts: 0 ,blockedUntil: null}, // pass123
{ id: 4, username: "admin", email: "admin@gmail.com", password: "$2b$10$YBwQfrNjgB7K2CFy6akYL.uoPkt1lo3XRfkBJx1nukNsBGpNuo9La", role: "admin", active: true , loginAttempts: 0,blockedUntil: null} // admin
];

// Empezar aqui despues con mas ejercicios pasarlo al .env
const SECRET = "mi_clave_secreta";

app.post("/login", async (req, res) => {
    
    try {
        const { email, password } = req.body;
    // Validar datos
    if (!email || !password) {
        return res.status(400).json({ error: "Email y passwrod obligatorios" });
    };
    // Buscamos usuario
    const user = dataBaseUsuarios.find(e => e.email === email);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    };

    if (user.active === false) {
        return res.status(403).json({ error: "Usuario desactivado" });
    };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({error:"Contraseña incorrecta"})
    };

    // Si todo salio bien generar el token
    const token = jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    },
        SECRET,
    {expiresIn: "1h"});

    res.status(200).json({
        message: "Login correcto",
        token : token
    })

    } catch (error) {
        return res.status(500).json({error:"Error interno en el servidor"})
}


})