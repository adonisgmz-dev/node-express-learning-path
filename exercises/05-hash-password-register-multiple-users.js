const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

const dataBaseUsuarios = [
    { id: 1, username: "pepe", email: "pepe@gmail.com", password: bcrypt.hashSync("password_pepe", 10), diaCreado: new Date() },
    { id: 2, username: "jose", email: "jose@yahoo.es", password: bcrypt.hashSync("jose_123", 10), diaCreado: new Date() },
    { id: 3, username: "maria", email: "maria@outlook.com", password: bcrypt.hashSync("maria_secure", 10), diaCreado: new Date() },
    { id: 4, username: "juan", email: "juan@servidor.net", password: bcrypt.hashSync("juan_pass", 10), diaCreado: new Date() },
    { id: 5, username: "rafael", email: "rafa@empresa.com", password: bcrypt.hashSync("rafael_2024", 10), diaCreado: new Date() },
    { id: 6, username: "diomedez", email: "diomedez@cacique.com", password: bcrypt.hashSync("vallenato_01", 10), diaCreado: new Date() },
    { id: 7, username: "luis", email: "luis@correo.es", password: bcrypt.hashSync("luis_alpha", 10), diaCreado: new Date() }
];

app.post("/register-multiple", (req, res) => {
    const listUsers = req.body;
    if (!Array.isArray(listUsers)) {
        return res.status(400).json({ error: "El cuerpo de la peticion debe ser un array " })
    }
    const registered = [];
    const errors = [];
    listUsers.forEach((u, indice) => {
        const { username, email, password } = u;
        if (!username || username.length < 3) {
            errors.push({ indice: indice, error: "Username obligatorio y mayor a 3 caracteres" });
            return;
        }
        if (!email || !email.includes("@")) {
            errors.push({ indice: indice, error: "Email obligatorio y debe incluir @" });
            return;
        }
        if (!password || password.length < 6) {
            errors.push({ indice: indice, error: "Password obligatorio y minimo 6 caracteres" });
            return;
        }
        // No registrar duplicados en la base de datos
        const duplicadosDB = dataBaseUsuarios.some(u => u.username === username || u.email === email);
        if (duplicadosDB) {
            errors.push({ indice, username, error: "Username o email duplicado" });
            return;
        }
        // No registrar duplicados dentro del mismo array
        const duplicadoArr = registered.some(r => r.username === username || r.email === email);
        if (duplicadoArr) {
            errors.push({ indice, username, error: "Username o email duplicado en el Array" });
            return;
        }
        // Hacemos seguras las contraseñas
        const hashedPassword = bcrypt.hashSync(password, 10)
        registered.push({
            id: dataBaseUsuarios.length + registered.length + 1,
            username,
            email,
            password: hashedPassword,
            diaCreado: new Date()
        });

    });
    dataBaseUsuarios.push(...registered);
    res.status(201).json({
        registeredTotal: registered.length,
        registeredFailed: errors.length,
        errorsDetails: errors,
    })
});

app.get("/users", (req, res) => {
    const infoPublic = dataBaseUsuarios.map(u => {
        return {
            id: u.id,
            username: u.username,
            email: u.email,
            diaCreado: u.diaCreado
        }
    });

    res.status(200).json(infoPublic)
});

app.listen(6000, () => {
    console.log("Server is running...");
})