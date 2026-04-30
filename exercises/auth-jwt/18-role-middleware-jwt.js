/* EJERCICIO 18 - JWT + MIDDLEWARE DE ROLES
Crear una API con Express que use JWT guardado en cookie httpOnly.
- POST /login:
  Valida email y password con bcrypt, genera un JWT con id, username, email y role,
  y guarda el token en una cookie httpOnly.
- Middleware verifyToken:
  Lee el token desde req.cookies, lo verifica con jwt.verify y guarda los datos en req.user.
- Middleware checkRole:
  Recibe un role permitido, revisa req.user.role y permite continuar solo si coincide.
- GET /profile:
  Ruta protegida accesible para cualquier usuario logueado.
- GET /admin:
  Ruta protegida accesible solo para usuarios con role "admin".
Objetivo: separar autenticación y autorización usando middlewares reutilizables.*/

const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("dotenv").config({ path: "../../.env" });

const SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT;
// Simulamos base de datos
const dataBaseUsuarios = [
{ id: 1, username: "user1", email: "user1@gmail.com", password: "$2b$10$lfEf9aeep5fUkybs0Lyg0OCcJDoad/VTogbGK7ZF4fZcX.EUVP.u2", role: "user", active: true , loginAttempts: 0,blockedUntil: null}, // 1234
{ id: 2, username: "user2", email: "user2@gmail.com", password: "$2b$10$T0F6eR9JoekNofa0u3olMuxDXWVkCC2zRbHXjloPvKOmqSzRHt4Zq", role: "user", active: false , loginAttempts: 0,blockedUntil: null}, // abcd
{ id: 3, username: "user3", email: "user3@gmail.com", password: "$2b$10$7yMXPbJGuxSX4OyZoJPFTehWWad2e4XfwnlD8Wg00SrDv3sK/XsZW", role: "user", active: true, loginAttempts: 0 ,blockedUntil: null}, // pass123
{ id: 4, username: "admin", email: "admin@gmail.com", password: "$2b$10$YBwQfrNjgB7K2CFy6akYL.uoPkt1lo3XRfkBJx1nukNsBGpNuo9La", role: "admin", active: true , loginAttempts: 0,blockedUntil: null} // admin
];

// Middleware verifyToken
function verifyToken(req, res, next) {
    // Comprobar token
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Acceso denegado.No hay cookie" });

    // Verificar
    try {
        const decoded = jwt.verify(token, SECRET);
        // Guardamos
        req.user = decoded;
        // Y pasamos
        next();
    } catch (error) {
        return res.status(403).json({error:"Token invalido o expiro"})
    }
};

// Middleware checkRole
function checkRole(roleRequired) {
    return (req, res, next) => {
        if (req.user.role !== roleRequired) return res.status(403).json({ error: "Acceso denegado" });
        next();
    };
};

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Los dos campos son obligatorios" });
    // Ver si existe el usuario
    const user = dataBaseUsuarios.find(e => e.email === email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Contraseña incorrecta" });
    // Si esta desactivada
    if (user.active === false) return res.status(403).json({ error: "Cuenta desactivada" });

    // Generar JWT
    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        SECRET,
        { expiresIn: "1h" }
    );
    // Enviar
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 3600000
    });
    res.status(200).json({ message: "Login exitoso", user: { username: user.username, role: user.role } });
});
// Rutas protegidad
app.get("/profile", verifyToken,(req, res) => {
    res.status(200).json({ message: "Bienvenido a tu perfil.", user: req.user });
});

app.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
    res.status(200).json({ message: "Bienvenido al panel administrativo" });
});

app.listen(PORT, () => {
    console.log("Server is running ... http://localhost:3000");
});