const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

const dataBaseUsuarios = [
{ id: 1, username: "user1", email: "user1@gmail.com", password: "$2b$10$lfEf9aeep5fUkybs0Lyg0OCcJDoad/VTogbGK7ZF4fZcX.EUVP.u2", role: "user", active: true , loginAttempts: 0,blockedUntil: null}, // 1234
{ id: 2, username: "user2", email: "user2@gmail.com", password: "$2b$10$T0F6eR9JoekNofa0u3olMuxDXWVkCC2zRbHXjloPvKOmqSzRHt4Zq", role: "user", active: false , loginAttempts: 0,blockedUntil: null}, // abcd
{ id: 3, username: "user3", email: "user3@gmail.com", password: "$2b$10$7yMXPbJGuxSX4OyZoJPFTehWWad2e4XfwnlD8Wg00SrDv3sK/XsZW", role: "user", active: true, loginAttempts: 0 ,blockedUntil: null}, // pass123
{ id: 4, username: "admin", email: "admin@gmail.com", password: "$2b$10$YBwQfrNjgB7K2CFy6akYL.uoPkt1lo3XRfkBJx1nukNsBGpNuo9La", role: "admin", active: true , loginAttempts: 0,blockedUntil: null} // admin
];

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = dataBaseUsuarios.find(e => e.email === email);

        
        // Valicaciones basicas
        if (!email || !password) {
            return res.status(400).json({ error: "LLenar los dos campos" });
        };

        if (!user) {
            return res.status(404).json({ error: "Usuario no existe" });
        };

        if (user.active === false) {
            return res.status(403).json({ error: "Usuario bloqueado" });
        };

        const isValid = await bcrypt.compare(password, user.password);

        // Bloquear si introduce mal la constraseña 3 veces
        if (!isValid) {
            user.loginAttempts++
            if (user.loginAttempts > 3) {
                user.active = false;
                return res.status(403).json({ error: "Usuario bloqueado por intentos" })
            }
            return res.status(401).json({ error: "Contraseña incorrecta", intentos: user.loginAttempts });
        } else {
            user.loginAttempts = 0;
            return res.status(200).json({
                "message": "Login correcto",
                "user": user.username
            });
        }
    } catch (eroor) {
        return res.status(500).json({ error: "Error del servidor" })
    }
});

app.listen(4344, () => { console.log("Server is running...") });
