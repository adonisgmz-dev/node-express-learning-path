const express = require("express");
const app = express();
app.use(express.json());

const dataBaseUsuarios = [];

app.delete("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = dataBaseUsuarios.findIndex(i => i.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Usario no encontrado" });
    };

    // Eliminar el usuario
    dataBaseUsuarios.splice(index, 1);
    // Respuesta
    res.status(200).json({ message: "Usuario eliminado correctamente" });
})