const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

const dataBaseUsuarios = [
{ id: 1, username: "user1", email: "test1@gmail.com", password: "$2b$10$wH8KkV6Q8W0Jq5n3vPZJ6uWw9Yw2yC7Z5x2m7b9YQ0t6F3lJp2G7e" }, // 1234
{ id: 2, username: "user2", email: "test2@gmail.com", password: "$2b$10$k3YbJ1T9Qx2M4n8vC7dF5gH2L0pQ6rS8tU1wE3yZ5aX7cV9bN0m1O" }, // abcd
{ id: 3, username: "user3", email: "test3@gmail.com", password: "$2b$10$Zr8X2Q5vN7pK1sT4uW9yB3cD6fG0hJ2kL5mP8oR1tU4vY7xZ0aB2c" }, // pass123
{ id: 4, username: "admin", email: "admin@gmail.com", password: "$2b$10$Q2w3E4r5T6y7U8i9O0pA1sD2fG3hJ4kL5zX6cV7bN8m9Q0wE1rT2y" } // admin
];

app.post("/login", async (req, res) => {
    
    try {
        const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Credenciales incorrectas" });
    };

    const user = dataBaseUsuarios.find(e => e.email === email);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" })
    }
    
    const isValid = await bcrypt.compare(password,user.password)
    if (!isValid) {
        return res.status(401).json({ error: "Password incorrecta" })
    };

    res.status(200).json({
        message: "Login correcto", user: {
            id: user.id,
            email: user.email
        }
    })
    } catch (error) {
        res.status(500).json({error:"Error interno del servidor"})
    }
    
});
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});