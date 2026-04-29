// Primero importar EXPRESS
const express = require("express");
const app = express();
app.use(express.json());

const dataBaseUsuarios =  [
    { id:1, username: "pepe", email: "pepe@test.com", password: "1235846" , diaCreado: new Date()},
    { id:2, username: "ana", email: "ana@universidad.com", password: "45684585", diaCreado: new Date() },
    { id:3, username: "lucas", email: "lucas@prueba.com", password: "78989465", diaCreado: new Date() }
]; 

app.post("/register", (req, res) => {
    
    const { username, email, password } = req.body;
    // Validar que exista Username, Email y Password con unas condicines.
    if (!username || username.length < 3) {
        return res.status(400).json({ error: "No hay Username o es muy corto" })
    }
    // Comprobar si no existen USERNAME duplicados
    const userExist = dataBaseUsuarios.some(u => u.username === username);
    if (userExist) {
        return res.status(409).json({ error: "Este Username ya esta elegido, escoge otro diferente" })
    };
    
    if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Email invalido" })
    }
    // Comprobar que no haya duplicados
    const emailExist = dataBaseUsuarios.some(e => e.email === email);
    if (emailExist) {
        return res.status(409).json({ error: "Email ya existente" })
    }
    
    if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password requerido o no cumple con los requisito de caracteres" })
    }
    // Si todo esta OK, guardarlo
    const nuevoUsuario = {
        id: dataBaseUsuarios.length + 1,
        username: username,
        email: email,
        password: password,
        diaCreado: new Date()
    }
    dataBaseUsuarios.push(nuevoUsuario);
    res.status(201).json({ message: "Usuario creado con exito" })
    
    
});

app.get("/users", (req, res) => {
    // si hay usuarios los muestra pero sin la constraseña y sino hay usuarios devuelve un array vacio,
    const infoPublica = dataBaseUsuarios.map(u => {
        return {
            id: u.id,
            username: u.username,
            email: u.email,
            diaCreado: u.diaCreado
        }
    })
    res.status(200).json(infoPublica)
});

app.listen(3000, () => {
    console.log("Servidor corriendo");
})