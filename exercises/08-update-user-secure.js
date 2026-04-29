const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

const dataBaseUsuarios = [
{ id: 1, username: "pepe", email: "pepe@gmail.com", password: bcrypt.hashSync("123456", 10) },
{ id: 2, username: "hunter", email: "hunter@gmail.com", password: bcrypt.hashSync("123456", 10) },
{ id: 3, username: "shadow", email: "shadow@gmail.com", password: bcrypt.hashSync("123456", 10) },
{ id: 4, username: "neo", email: "neo@gmail.com", password: bcrypt.hashSync("123456", 10) }
];

app.put("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const { username, email, password } = req.body;
    const user = dataBaseUsuarios.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({ error: "Usuario no existe" })
    };
    // Validar que al menos venga un capo para actualizar sino error
    if (!username && !email && !password) {
        return res.status(400).json({ error: "No se puede actualizar, viene vacio" })
    };
    // Actualizar si viene error
    if (username) {
        if (username.length < 3) {
            return res.status(400).json({ error: "Usuario invalido. Minimo 3 caracteres" })
        };
        // Comprobar que no haya duplicado
        const duplicadoUsername = dataBaseUsuarios.some(u => u.username === username && u.id !== id);
        if (duplicadoUsername) {
            return res.status(409).json({ error: "El usuario ya fue seleccionado" })
        };
        // Actualizamos
        user.username = username;
    };

    if (email) {
        if (!email.includes("@")) {
            return res.status(400).json({ error: "El email debe incluir @" })
        };
        const duplicadosEmail = dataBaseUsuarios.some(e => e.email === email && e.id !== id);
        if (duplicadosEmail) {
            return res.status(409).json({ error: "Email invalido ya existente" })
        }

        user.email = email;
    };

    if (password) {
        if (password.length < 6) {
            return res.status(422).json({ error: "Password invalida. (6 caract. min)" })
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword;
    }

    res.status(200).json({
        message: "Usuario actualizado",
        user: {
            username: user.username,
        }
    });
});

app.listen(3000, () => {
    console.log("Server is running ...");
})