const express = require("express");
const app = express();
app.use(express.json());

const dataBaseUsuarios = [
    { id: 1, email: "test1@gmail.com", password: "1234" },
    { id: 2, email: "test2@gmail.com", password: "abcd" }
];

app.post("/login", (req, res) => {
    
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Credenciales incorrectas" });
    };

    const user = dataBaseUsuarios.find(e => e.email === email);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" })
    }
    
    if (user.password !== password) {
        return res.status(401).json({ error: "Password incorrecta" })
    };

    res.status(200).json({
        message: "Login correcto", user: {
            id: user.id,
            email: user.email
        }
    })
    
});
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});