/*
EJERCICIO 17 - JWT + RUTAS PROTEGIDAS (HTTPONLY)
Crear una API con Express que:
- POST /login:
  Reciba email y password, valide usuario con bcrypt y genere un JWT (id, username, email, role) que expire en 1h.
  En lugar de devolver el token en el body, guardarlo en una cookie httpOnly usando res.cookie.
  Configurar la cookie con httpOnly, sameSite y maxAge.
- Middleware verifyToken:
  Leer el token desde req.cookies.
  Verificarlo con jwt.verify y guardar los datos en req.user.
  Si no hay token o es inválido, devolver error 401/403.
- GET /profile:
  Ruta protegida que devuelva los datos del usuario desde el token.
- GET /admin:
  Ruta protegida que solo permita acceso si el role es "admin".
Objetivo: implementar autenticación con JWT usando cookies httpOnly y proteger endpoints con middleware.
*/
const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const SECRET = "mi_clave_secreta";
// Simulamos base de datos
const dataBaseUsuarios = [
{ id: 1, username: "user1", email: "user1@gmail.com", password: "$2b$10$lfEf9aeep5fUkybs0Lyg0OCcJDoad/VTogbGK7ZF4fZcX.EUVP.u2", role: "user", active: true , loginAttempts: 0,blockedUntil: null}, // 1234
{ id: 2, username: "user2", email: "user2@gmail.com", password: "$2b$10$T0F6eR9JoekNofa0u3olMuxDXWVkCC2zRbHXjloPvKOmqSzRHt4Zq", role: "user", active: false , loginAttempts: 0,blockedUntil: null}, // abcd
{ id: 3, username: "user3", email: "user3@gmail.com", password: "$2b$10$7yMXPbJGuxSX4OyZoJPFTehWWad2e4XfwnlD8Wg00SrDv3sK/XsZW", role: "user", active: true, loginAttempts: 0 ,blockedUntil: null}, // pass123
{ id: 4, username: "admin", email: "admin@gmail.com", password: "$2b$10$YBwQfrNjgB7K2CFy6akYL.uoPkt1lo3XRfkBJx1nukNsBGpNuo9La", role: "admin", active: true , loginAttempts: 0,blockedUntil: null} // admin
];


function verifyToken(req, res, next) {
    
    const token = req.cookies.token;

    // Si el token no existe en las cookies
    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No hay cookie de seesion" });
    };

    // Verificar si el token es valido y no ha caducado
    try {
        const decoded = jwt.verify(token, SECRET);
        // Guardar los daos del usuario en el req para usarlos despues
        req.user = decoded;
        // Continuar a la siguiente funcion
        next();
    } catch (error) {
        return res.status(403).json({error:"Token invalido o expirado"})
    }
}

app.post("/login", async (req, res) => {
   
    const { email, password } = req.body;
    // Validar que existan email y password
    if (!email || !password) return res.status(400).json({ error: "Obligatorio los dos campos" });

    // Buscar el usuario por el email y ver si existe
    const user = dataBaseUsuarios.find(e => e.email === email);
    if (!user) {
        return res.status(400).json({ error: "Usuario no encontrado" });
    };

    // Validar constraseña
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Contraseña incorrecta" });

    // Validar que la cuenta este activa
    if (user.active === false) {
        return res.status(400).json({ error: "La cuenta esta desactivada" });
    }
    // Generar JWT
    const token = jwt.sign(
        { id: user.id, username : user.username, email: user.email, role: user.role },
        SECRET,
        { expiresIn: "1h" }
    );
    // Enviar cookie HTTPOnly
    res.cookie("token", token, {
        httpOnly: true,
        secure: false, //True si usa HTTPS
        sameSite: "strict",
        maxAge: 3600000 //1h
    });

    res.json({ message: "Login exitoso", user: { username: user.username, role: user.role, } });
});

// Rutas protegidad

app.get("/profile", verifyToken, (req, res) => {
    res.status(200).json({ message: "Tu perfil", user: req.user })
        ;
});

app.get("/admin", verifyToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "No tienes acceso de administrador" })
    }
    res.status(200).json({ message: "Bienvenido al panel administrador" });
});

app.listen(4000, () => {
    console.log("Server is running ... http://localhost:3000");
});
