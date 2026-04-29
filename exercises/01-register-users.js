const express = require("express");
const app = express();

app.use(express.json());
let users = [];

app.post("/registro", (req, res) => {
    const { username, email } = req.body;
    if (!username || username.length < 3) {
      return  res.status(400).json({error:"Falta username o es menor a 3 caracteres"})
    }
    if (!email || !email.includes("@")) {
      return  res.status(400).json({error:"Email no introducido o falta @"})
    }
    // Los metemos en el users
    users.push({username, email});
    res.status(201).json({"message":"Usuario registrado correctamente"})

})

app.get("/usuarios", (req, res) => {
    if (users.length === 0) {
       return  res.status(200).json({"message":"No hay usuarios"})
    }
    // Devolvemos todos los usuarios
    res.status(200).json(users)
})

app.listen(3000, () =>{console.log("Servidor corriendo");})