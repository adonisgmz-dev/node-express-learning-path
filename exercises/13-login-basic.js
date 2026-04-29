const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

const dataBaseUsuarios = [
{ id: 1, username: "user1", email: "user1@gmail.com", password: "$2b$10$lfEf9aeep5fUkybs0Lyg0OCcJDoad/VTogbGK7ZF4fZcX.EUVP.u2", role: "user", active: true }, // 1234
{ id: 2, username: "user2", email: "user2@gmail.com", password: "$2b$10$T0F6eR9JoekNofa0u3olMuxDXWVkCC2zRbHXjloPvKOmqSzRHt4Zq", role: "user", active: false }, // abcd
{ id: 3, username: "user3", email: "user3@gmail.com", password: "$2b$10$7yMXPbJGuxSX4OyZoJPFTehWWad2e4XfwnlD8Wg00SrDv3sK/XsZW", role: "user", active: true }, // pass123
{ id: 4, username: "admin", email: "admin@gmail.com", password: "$2b$10$YBwQfrNjgB7K2CFy6akYL.uoPkt1lo3XRfkBJx1nukNsBGpNuo9La", role: "admin", active: true } // admin
];

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = dataBaseUsuarios.find(e => e.email === email);

        if (!email || !password) {
            return res.status(400).json({ error: "Obligatorio llenar los 2 campos" })
        };

        if (!user) {
            return res.status(404).json({ error: "Usuario no existe" });
        };

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Si esta activo o desactivo
        if (user.active === false) {
            return res.status(403).json({ error: "Este usuario esta desactivado" });
        };

        if (user.role === "admin") {
            return res.status(200).json({
            "message": "login correcto como admin",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        });
        } else {
            res.status(200).json({
            "message": "Login correcto usuario",
            "admin": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error interno del servidor" })
    }
});
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});