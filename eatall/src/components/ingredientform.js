import React, { useState } from 'react';

function IngredientForm() {
    const [ingredientData, setIngredientData] = useState({
        nombre: '',
        cantidad: ''
    });

    const handleChange = (event) => {
        setIngredientData({ ...ingredientData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(ingredientData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre del Ingrediente:
                <input type="text" name="nombre" value={ingredientData.nombre} onChange={handleChange} />
            </label>
            <label>
                Cantidad:
                <input type="text" name="cantidad" value={ingredientData.cantidad} onChange={handleChange} />
            </label>
            <button type="submit">Agregar Ingrediente</button>
        </form>
    );
}

export default IngredientForm;
