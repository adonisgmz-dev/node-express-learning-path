const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

const dataBaseUsuarios = [];

app.put("/users/:id", (req, res) => {
    // Obtener la id de la url
    const id = Number(req.params.id);
    // Obtener datos que vienen en el body
    const { username,email,password } = req.body;
    // Buscar usuario
    const user = dataBaseUsuarios.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({error:"Usuario no registrado"})
    }
    // Si viene username
    if (username) {
        if (username.length < 6) {
            return res.status(400).json({ error: "Username invalido, minimo 6 caracteres" });
        };
        // Comprobar si hay duplicados
        const duplicadoUsername = dataBaseUsuarios.some(d => d.username === username && d.id !== id);
        if (duplicadoUsername) {
                return res.status(409).json({error:"Username duplicado"})
        }
        // Actualizar
        user.username = username;
    }
    // Si viene email
    if (email) {
        if(!email.includes("@")) {
        return res.status(400).json({error:"Email invalido"})    
        };
        const duplicadoEmail = dataBaseUsuarios.some(e => e.email === email && e.id !== id);
        if (duplicadoEmail) {
            return res.status(409).json({error:"Email duplicado"})
        }
        user.email = email;
    };
    // Si viene password
    if (password) {
        if (password.length < 6) {
            return res.status(400).json({error:"Password invalido(6 caract min)"})
        }
        const hashedPassword = bcrypt.hashSync(password, 10)
        user.password = hashedPassword;
    };
    
    res.status(200).json({message:"Usuario actualizado"})

})







