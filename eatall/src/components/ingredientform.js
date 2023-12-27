import React, { useState } from 'react';

function IngredientForm() {
    const [ingredientData, setIngredientData] = useState({
        nombre: '',
        cantidad: 0 
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setIngredientData({ ...ingredientData, [name]: name === 'cantidad' ? parseFloat(value) : value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!ingredientData.nombre || ingredientData.cantidad <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/agregarIngrediente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ingredientData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result);
                alert("Ingrediente agregado con éxito!");
                setIngredientData({ nombre: '', cantidad: 0 }); 
            } else {
                console.log("Error al agregar el ingrediente");
            }
        } catch (error) {
            console.error("Error en la conexión con el servidor", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre del Ingrediente:
                <input type="text" name="nombre" value={ingredientData.nombre} onChange={handleChange} />
            </label>
            <label>
                Cantidad:
                <input type="number" name="cantidad" value={ingredientData.cantidad} onChange={handleChange} />
            </label>
            <button type="submit">Agregar Ingrediente</button>
        </form>
    );
}

export default IngredientForm;
