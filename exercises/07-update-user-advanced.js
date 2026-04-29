const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

const dataBaseUsuarios = []
app.put("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const { username, email, password } = req.body;
    const user = dataBaseUsuarios.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({error:"Usuario no encontrado"})
    }
    if (!username && !email && !password) {
        return res.status(400).json({error:"No hay datos para actualizar"})
    }
    if (username) {
        if (username.length < 3) {
            return res.status(400).json({error:"Username invalido.Minimo 3 caracteres"})
        }
        const duplicUsername = dataBaseUsuarios.some(u => u.username === username && u.id !== id);
        if (duplicUsername) {
            return res.status(409).json({error:"Username ya en uso. Escoge otro"})
        }
        user.username = username;
    }
    // Por si viene EMAIL
    if (email) {
        if (!email.includes("@")){
            return res.status(400).json({error:"Email Invalido"})
        }
        const duplicEmail = dataBaseUsuarios.some(e => e.email === email && e.id !== id);
        if (duplicEmail) {
            return res.status(409).json({error:"Email ya en uso"})
        }
        user.email = email;
    };
    // Por si viene password
    if (password) {
        if (password.length < 6) {
            return res.status(400).json({error:"Password invalido (6 caract min)"})
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword;
    };
        user.diaActualizacion= new Date();
        res.status(200).json({
        "message": "Usuario actualizado",
        user: {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "diaActualizacion": user.diaActualizacion
        }
        })
})