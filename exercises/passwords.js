// Generar el hash de las constraseñas
const bcrypt = require("bcrypt");

async function generar() {
    console.log("1234:", await bcrypt.hash("1234", 10));
    console.log("abcd:", await bcrypt.hash("abcd", 10));
    console.log("pass123:", await bcrypt.hash("pass123", 10));
    console.log("admin:", await bcrypt.hash("admin", 10));
}

generar();