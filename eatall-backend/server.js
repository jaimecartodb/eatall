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

app.get('/usuarios', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await new sql.Request().query('SELECT * FROM Usuarios');
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al recuperar los usuarios');
    }
});

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

app.post('/login', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { email, password } = req.body;

        const result = await new sql.Request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Usuarios WHERE Email = @email');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const validPassword = await bcrypt.compare(password, user.Contraseña);
            if (validPassword) {
                res.status(200).send("Inicio de sesión exitoso");
            } else {
                res.status(400).send("Contraseña incorrecta");
            }
        } else {
            res.status(404).send("Usuario no encontrado");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor");
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
