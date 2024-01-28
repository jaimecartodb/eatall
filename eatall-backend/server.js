// Archivo con toda la lógica del back-end, incluyendo la gestión de rutas y todas las conexiones tanto con front como con la BBDD y sus operaciones

require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const logger = require('./logger');
const schedule = require('node-schedule');

app.use(express.json()); 
app.use(cors());
const fs = require('fs');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

console.log('funciona hasta aqui')

async function generarReporteIngredientesPopulares() {
    try {
        await sql.connect(dbConfig);
        const query = `
            SELECT TOP 10 i.NombreIngrediente, COUNT(ui.IngredienteID) as Uso
            FROM dbo.Ingredientes i
            INNER JOIN dbo.UsuarioIngredientes ui ON i.IngredienteID = ui.IngredienteID
            GROUP BY i.NombreIngrediente
            ORDER BY Uso DESC
        `;
        const result = await new sql.Request().query(query);

        let reporte = 'Ingredientes más populares:\n';
        result.recordset.forEach(ing => {
            reporte += `${ing.NombreIngrediente}: ${ing.Uso} veces\n`;
        });

        fs.writeFileSync('reporte_ingredientes_populares.txt', reporte);
        console.log('Reporte generado exitosamente.');
    } catch (err) {
        console.error('Error al generar el reporte:', err);
    }
}

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });

// Ruta para obtener usuarios - principalmente usada para pruebas
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

// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { nombreUsuario, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const fechaCreacion = new Date().toISOString().slice(0, 10);

        const result = await new sql.Request()
            .input('NombreUsuario', sql.VarChar, nombreUsuario)
            .input('Email', sql.VarChar, email)
            .input('Contraseña', sql.VarChar, hashedPassword)
            .input('FechaCreacion', sql.Date, fechaCreacion)
            .query('INSERT INTO Usuarios (NombreUsuario, Email, Contraseña, FechaCreacion) VALUES (@NombreUsuario, @Email, @Contraseña, @fechaCreacion)');

        res.status(201).send("Usuario registrado con éxito");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor");
    }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { email, password } = req.body;

        const result = await new sql.Request()
            .input('Email', sql.VarChar, email)
            .query('SELECT * FROM Usuarios WHERE Email = @Email');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const validPassword = await bcrypt.compare(password, user.Contraseña);
            console.log(user.UsuarioID);
            if (validPassword) {
                console.log("Usuario autenticado, UsuarioID:", user.UsuarioID);
                res.json({ authenticated: true, UsuarioID: user.UsuarioID });
            } else {
                res.json({ authenticated: false, message: "Contraseña incorrecta" });
            }
        } else {
            res.json({ authenticated: false, message: "Usuario no encontrado" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor");
    }
});

// Ruta para agregar ingredientes
app.post('/agregarIngrediente', async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        await sql.connect(dbConfig);
        const { UsuarioID, NombreIngrediente, Cantidad } = req.body;
        console.log('Datos recibidos en el servidor:', { UsuarioID, NombreIngrediente, Cantidad });

        // Primero, encontrar el ID del ingrediente basado en su nombre.
        let ingredientResult = await new sql.Request()
            .input('NombreIngrediente', sql.NVarChar, NombreIngrediente)
            .query('SELECT IngredienteID FROM Ingredientes WHERE NombreIngrediente = @NombreIngrediente');

        if (ingredientResult.recordset.length === 0) {
            return res.status(404).send("Ingrediente no encontrado. Recuerda introducir los ingredientes en singular y con la primera letra en mayúsculas");
        }
        const IngredienteID = ingredientResult.recordset[0].IngredienteID;
        console.log('IngredienteID encontrado:', IngredienteID);

        // Insertar en UsuarioIngredientes.
        await new sql.Request()
            .input('UsuarioID', sql.Int, UsuarioID)
            .input('IngredienteID', sql.Int, IngredienteID)
            .input('Cantidad', sql.Int, Cantidad)
            .query('INSERT INTO UsuarioIngredientes (UsuarioID, IngredienteID, Cantidad) VALUES (@UsuarioID, @IngredienteID, @Cantidad)');

        res.status(201).send("Ingrediente agregado con éxito");
    } catch (err) {
        console.error('Error al insertar el ingrediente:', err);
        res.status(500).json({ message: "Error en el servidor", error: err.message });
    }
});

// Ruta para recomendar las recetas. Ésta es la parte crítica de la aplicación
app.post('/recomendarRecetas', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { UsuarioID } = req.body;

        // Obtener ingredientes del usuario específico
        const ingredientesUsuarioResult = await new sql.Request()
            .input('UsuarioID', sql.Int, UsuarioID)
            .query('SELECT NombreIngrediente FROM Ingredientes INNER JOIN UsuarioIngredientes ON Ingredientes.IngredienteID = UsuarioIngredientes.IngredienteID WHERE UsuarioID = @UsuarioID');

        // Si no hay ingredientes para el usuario, no hay recomendaciones posibles
        if (ingredientesUsuarioResult.recordset.length === 0) {
            return res.status(404).send("No se encontraron ingredientes para el usuario.");
        }

        const ingredientesUsuario = ingredientesUsuarioResult.recordset.map(ing => ing.NombreIngrediente.toLowerCase());
        const recetasResult = await new sql.Request().query('SELECT RecetaID, NombreReceta, Descripcion, Ingredientes FROM Recetas');
        let recetas = recetasResult.recordset;

        // Introducimos algo de randomización para aumentar la variedad de recetas presentadas al usuario
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        recetas = shuffleArray(recetas);

        // Filtramos las recetas que contienen al menos dos de los ingredientes del usuario
        recetas = recetas.filter(receta => {
            if (!receta.Ingredientes) {
                return false;
            }
            const ingredientesReceta = receta.Ingredientes.toLowerCase().split(',').map(ing => ing.trim());
            const coincidencias = ingredientesUsuario.filter(ingredienteUsuario => ingredientesReceta.includes(ingredienteUsuario));
            return coincidencias.length >= 2;
        });

        // Ordenamos las recetas por el porcentaje de coincidencias de ingredientes
        recetas.sort((a, b) => {
            const ingredientesA = a.Ingredientes ? a.Ingredientes.toLowerCase().split(',').map(ing => ing.trim()) : [];
            const ingredientesB = b.Ingredientes ? b.Ingredientes.toLowerCase().split(',').map(ing => ing.trim()) : [];
            const porcentajeA = ingredientesUsuario.filter(ing => ingredientesA.includes(ing)).length / ingredientesA.length;
            const porcentajeB = ingredientesUsuario.filter(ing => ingredientesB.includes(ing)).length / ingredientesB.length;
            return porcentajeB - porcentajeA; 
        });

        // Guardamos las recomendaciones en la base de datos y devolver las primeras 3 recetas
        const recetasParaGuardar = recetas.slice(0, 3);
        if (recetasParaGuardar.length > 0) {
            for (const receta of recetasParaGuardar) {
                await new sql.Request()
                    .input('UsuarioID', sql.Int, UsuarioID)
                    .input('RecetaID', sql.Int, receta.RecetaID)
                    .input('FechaRecomendacion', sql.DateTime, new Date())
                    .query('INSERT INTO RecetasRecomendadas (UsuarioID, RecetaID, FechaRecomendacion) VALUES (@UsuarioID, @RecetaID, @FechaRecomendacion)');
            }
            res.json({ recetas: recetasParaGuardar });
        } else {
            res.status(404).send("No se encontraron recetas con los ingredientes proporcionados");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor al recomendar recetas");
    }
});

// Ruta para conseguir las recetas que se han recomendado en el pasado para un usuario concreto
app.get('/recetasRecomendadas/:usuarioID', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const usuarioID = req.params.usuarioID;

        const result = await new sql.Request()
            .input('UsuarioID', sql.Int, usuarioID)
            .query('SELECT r.RecetaID, r.NombreReceta, r.Descripcion FROM Recetas r INNER JOIN RecetasRecomendadas rr ON r.RecetaID = rr.RecetaID WHERE rr.UsuarioID = @UsuarioID');

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor al recuperar recetas recomendadas");
    }
});

async function generarRecomendaciones() {
    try {
        await sql.connect(dbConfig);

        const queryIngredientesPopulares = `
            SELECT TOP 3 NombreIngrediente
            FROM UsuarioIngredientes
            GROUP BY NombreIngrediente
            ORDER BY COUNT(*) DESC
        `;

        const ingredientesPopulares = await new sql.Request().query(queryIngredientesPopulares);

        if (ingredientesPopulares.recordset.length > 0) {
            const ingredientesStr = ingredientesPopulares.recordset.map(ing => ing.NombreIngrediente).join("','");

            // Buscar recetas que incluyan estos ingredientes
            const queryRecetas = `
                SELECT DISTINCT TOP 3 RecetaID, NombreReceta
                FROM Recetas
                WHERE Ingredientes LIKE '%${ingredientesStr}%'
            `;

            const recetasRecomendadas = await new sql.Request().query(queryRecetas);

            console.log('Recomendaciones generadas:', recetasRecomendadas.recordset);
        } else {
            console.log('No se encontraron ingredientes populares para generar recomendaciones.');
        }
    } catch (err) {
        console.error('Error al generar recomendaciones:', err);
    }
}

// Programamos la automatización del scheduler para que consiga las recetas semanales más populares cada semana, el domingo a las 00:00.
schedule.scheduleJob('0 0 * * 0', () => {
    generarRecomendaciones();
});

app.get('/recomendaciones-semanales', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await new sql.Request().query('SELECT * FROM Recetas INNER JOIN RecomendacionesSemanales ON Recetas.RecetaID = RecomendacionesSemanales.RecetaID');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al recuperar las recomendaciones semanales");
    }
});

// Ruta para conseguir estadísticas específicas sobre los ingredientes que más veces se han utilizado
app.get('/estadisticas/ingredientes-populares', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await new sql.Request().query(`
            SELECT NombreIngrediente, COUNT(*) as Uso
            FROM UsuarioIngredientes
            GROUP BY NombreIngrediente
            ORDER BY Uso DESC
            LIMIT 10
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al recuperar estadísticas de ingredientes populares");
    }
});


app.use((error, req, res, next) => {
    logger.error(`${error.message}`);
    res.status(500).send('Ocurrió un error en el servidor');
  });

generarReporteIngredientesPopulares();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
