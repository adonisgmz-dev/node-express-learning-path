const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());
const dataBaseUsuarios =  [
    { id:1, username: "pepe", email: "pepe@test.com", password: bcrypt.hashSync("1235846", 10) , diaCreado: new Date()}]; 

app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || username.length < 3) {
        return res.status(400).json({ error: "Username obligatorio y tener 3 caracteres minimo" });
    };
    const duplicadoUser = dataBaseUsuarios.some(u => u.username === username);
    if (duplicadoUser) {
        return res.status(409).json({ error: "Username ya registrado" })
    };

    if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Email obligatorio, debe incluir @" })
    };
    const duplicadoEmail = dataBaseUsuarios.some(e => e.email === email);
    if (duplicadoEmail) {
        return res.status(409).json({ error: "Email ya guardado" })
    };
    if (!password || password.length < 6) {
        return res.status(400).json({ error: "Campo password obligatorio, minimo 6 caracteres" })
    };

    const hashedPassword = bcrypt.hashSync(password, 10);
    const nuevoUsuario = {
        id: dataBaseUsuarios.length + 1,
        username: username,
        email: email,
        password: hashedPassword,
        diaCreado: new Date()
    }
    dataBaseUsuarios.push(nuevoUsuario);
    res.status(201).json({ message: "Usuario creado correctamente" });

});

app.get("/users", (req, res) => {
    const info = dataBaseUsuarios.map( u => {
        return {
        id: u.id,
        username: u.username,
        email: u.email,
        diaCreado: u.diaCreado
        }
    });

    res.status(200).json(info)
})

app.listen(5000, () => {
    console.log("Servidor corriendo");
})