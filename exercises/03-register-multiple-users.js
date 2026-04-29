const express = require("express");
const app = express();
app.use(express.json());

const dataBaseUsuarios =  [
    { id:1, username: "pepe", email: "pepe@test.com", password: "1235846" , diaCreado: new Date()},
    { id:2, username: "ana", email: "ana@universidad.com", password: "45684585", diaCreado: new Date() },
    { id:3, username: "lucas", email: "lucas@prueba.com", password: "78989465", diaCreado: new Date() }
]; 

app.post("/register-multiple", (req, res) => {
    const listsUsers = req.body;
    if (!Array.isArray(listsUsers)) {
        return res.status(400).json({error: "Formato incorrecto",message: "El cuerpo de la peticion debe ser un array"})
    }

    const registrados = [];
    const errores = [];
    listsUsers.forEach((u, indice) => {
        const { username, email, password } = u;
        // Validaciones
        if (!username || username.length < 3) {
            errores.push({ indice: indice, error: "Username obligatorio (min 3 caract)" })
            return;
        }
        if (!email || !email.includes("@")) {
            errores.push({ indice: indice, error: "Email obligatorio (Debe incluir @)" });
            return;
        };
        if (!password || password.length < 6) {
            errores.push({ indice: indice, error: "Password obligatorio minimo 6 caracteres" })
            return;
        }

        // Comprobar que no haya duplicados en la base
        const duplicadosBaseDatos = dataBaseUsuarios.some(u => u.username === username || u.email === email);
        if (duplicadosBaseDatos) {
            errores.push({ indice, username, error: "Username o email ya existentes" });
            return;
        }
        // Comprobar si existen duplicados en el array recibido
        const duplicadosArray = registrados.some(r => r.username === username || r.email === email);
        if (duplicadosArray) {
            errores.push({ indice, username, error: "Usuario o email repetido dentro del mismo array" });
            return;
        };
        // Si paso todas las comprobaciones se guarda temporalmente
        registrados.push({
            id: dataBaseUsuarios.length + registrados.length+ 1,
            username,
            email,
            password,
            diaCreado: new Date()
        });
    });
    // Se guarda
    dataBaseUsuarios.push(...registrados);
    res.status(201).json({
        message: "Usuarios registrados",
        totalregistros: registrados.length ,
        registrosFallidos: errores.length,
        detallesErrores: errores
    });
})

app.listen(4000, () => {
    console.log("Servidor corriendo");
})