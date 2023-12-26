require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json()); 
app.use(cors());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

app.post('/register', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { nombreUsuario, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const fechaCreacion = new Date().toISOString().slice(0, 10);

        const result = await new sql.Request()
            .input('nombreUsuario', sql.VarChar, nombreUsuario)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('fechaCreacion', sql.Date, fechaCreacion)
            .query('INSERT INTO Usuarios (NombreUsuario, Email, Contraseña, FechaCreacion) VALUES (@nombreUsuario, @email, @password, @fechaCreacion)');

        res.status(201).send("Usuario registrado con éxito");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor");
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
