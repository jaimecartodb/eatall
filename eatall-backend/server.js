const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();

app.use(express.json()); 
app.use(cors());

const dbConfig = {
    user: 'tu-usuario',
    password: 'tu-contraseña',
    server: 'tu-servidor.database.windows.net', 
    database: 'tu-base-de-datos',
    options: {
        encrypt: true
    }
};

app.post('/register', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { username, email, password } = req.body;
        // Datos BBDD
        res.status(201).send("Usuario registrado");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor");
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
