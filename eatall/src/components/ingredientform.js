// Archivo que se erige como la landing del usuario una vez está loggeado y le permite gestionar toda la aplicación
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function IngredientForm() {
    const [ingredientData, setIngredientData] = useState({ NombreIngrediente: '', Cantidad: 0 });
    const [listaIngredientes, setListaIngredientes] = useState([]);
    const [recetasRecomendadas, setRecetasRecomendadas] = useState([]);
    const [recetasPasadas, setRecetasPasadas] = useState([]);
    const [recetasRecomendadasSemanales, setRecetasRecomendadasSemanales] = useState([]); 
    const { auth, logout } = useAuth();
    const UsuarioID = auth.UsuarioID;

    useEffect(() => {
        if (auth.isAuthenticated && auth.UsuarioID) {
        }
    }, [auth]);

    const handleChange = (event) => {
        setIngredientData({ ...ingredientData, [event.target.name]: event.target.value });
    };

    // Función para agrear nuevos ingredientes a la BBDD. Clave la gestión de errores aquí para asegurar la buena conexión a la 
    // BBDD y también la guía al usuario.
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!ingredientData.NombreIngrediente || ingredientData.Cantidad <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }
    
        const dataParaEnviar = {
            UsuarioID: UsuarioID,
            NombreIngrediente: ingredientData.NombreIngrediente,
            Cantidad: ingredientData.Cantidad
        };
    
        try {
            const response = await fetch('http://localhost:3001/agregarIngrediente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataParaEnviar),
            });
    
            if (response.ok) {
                alert("Ingrediente agregado con éxito!");
                setListaIngredientes([...listaIngredientes, { NombreIngrediente: ingredientData.NombreIngrediente, Cantidad: ingredientData.Cantidad }]);
                setIngredientData({ NombreIngrediente: '', Cantidad: 0 }); 
            } if (response.status === 404) {
                alert("Ingrediente no encontrado en la BBDD. Recuerda introducir los ingredientes en singular y con la primera letra en mayúsculas");
            }
            else {
                console.error("Error al agregar el ingrediente", await response.text());
            }
        } catch (error) {
            console.error("Error en la conexión con el servidor", error);
        }
    };

    const handleLogout = () => {
        logout();
    };

    // Gestionamos la recomendación de recetas con el servidor 
    const handleRequestRecipe = async () => {
        try {
            const response = await fetch('http://localhost:3001/recomendarRecetas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ UsuarioID }),
            });

            if (response.ok) {
                const data = await response.json();
                setRecetasRecomendadas(data.recetas);
            } else {
                console.error("Error al obtener recomendaciones de recetas", await response.text());
            }
        } catch (error) {
            console.error("Error en la conexión con el servidor", error);
        }
    };

    // Gestionamos con el servidor las recomendaciones de recetas pasadas 
    const handleGetPastRecommendations = async () => {
        try {
            const response = await fetch(`http://localhost:3001/recetasRecomendadas/${UsuarioID}`);
            if (response.ok) {
                const data = await response.json();
                setRecetasPasadas(data);
            } else {
                console.error("Error al obtener recetas recomendadas pasadas", await response.text());
            }
        } catch (error) {
            console.error("Error en la conexión con el servidor", error);
        }
    };

    // Gestionamos con el servidor las recomendaciones de recetas de la semana (para TODOS los usuarios) 
    const handleGetWeeklyRecommendations = async () => {
        try {
            const response = await fetch('http://localhost:3001/recomendaciones-semanales');
            if (response.ok) {
                const data = await response.json();
                setRecetasRecomendadasSemanales(data);
            } else {
                console.error("Error al obtener recomendaciones semanales", await response.text());
            }
        } catch (error) {
            console.error("Error en la conexión con el servidor", error);
        }
    };

    return (
        <>
            <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px' }}>Cerrar Sesión</button>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre del Ingrediente:
                    <input type="text" name="NombreIngrediente" value={ingredientData.NombreIngrediente} onChange={handleChange} required />
                </label>
                <label>
                    Cantidad:
                    <input type="number" name="Cantidad" value={ingredientData.Cantidad} onChange={handleChange} required />
                </label>
                <button type="submit">Agregar Ingrediente</button>
            </form>
            {listaIngredientes.length > 0 && (
                <>
                    <div>
                        <h2>Ingredientes agregados:</h2>
                        <ul>
                            {listaIngredientes.map((ing, index) => (
                                <li key={index}>{`${ing.NombreIngrediente} - Cantidad: ${ing.Cantidad}`}</li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={handleRequestRecipe}>Pedir Recomendaciones de Recetas</button>
                </>
            )}
            <p></p>
            {recetasRecomendadas.length > 0 && (
                <div>
                    <h2>Recetas Recomendadas:</h2>
                    <ul>
                        {recetasRecomendadas.map((receta, index) => (
                            <li key={index}>
                                <p><strong>{receta.NombreReceta}</strong></p>
                                <p>{receta.Descripcion.split('.').map((sentence, idx) => (
                                    <span key={idx}>{sentence.trim()}{idx !== receta.Descripcion.split('.').length - 1 && '.'}<br/></span>
                                ))}</p>
                            </li>
                        ))}
                    </ul>
                    </div>
            )}
            <p></p>
            <button onClick={handleGetPastRecommendations}>Ver Recetas Recomendadas Pasadas</button>
            {recetasPasadas.length > 0 && (
                <div>
                    <h2>Recetas Recomendadas Pasadas:</h2>
                    <ul>
                        {recetasPasadas.map((receta, index) => (
                            <li key={index}>
                                <p><strong>{receta.NombreReceta}</strong></p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <p></p>
            <button onClick={handleGetWeeklyRecommendations}>Ver Recomendaciones Semanales</button>
            {recetasRecomendadasSemanales.length > 0 && (
                <div>
                    <h2>Recomendaciones Semanales!! </h2>
                    <ul>
                        {recetasRecomendadasSemanales.map((receta, index) => (
                            <li key={index}>
                                <p><strong>{receta.NombreReceta}</strong></p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}

export default IngredientForm;