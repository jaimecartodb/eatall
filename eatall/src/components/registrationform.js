// Archivo para gestionar el registro de nuevos usuarios
import React, { useState } from 'react';

function RegistrationForm() {
    const [userData, setUserData] = useState({
        nombreUsuario: '',
        email: '',
        password: '',
    });

    const handleChange = (event) => {
        setUserData({ ...userData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
    
        // Introducimos gestión de errores por si el registro del usuario no ha sido exitoso
        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreUsuario: userData.nombreUsuario,
                    email: userData.email,
                    password: userData.password,
                }),
            });

            if (response.ok) {
                alert('Usuario creado con éxito');
                setUserData({
                    nombreUsuario: '',
                    email: '',
                    password: '',
                });
            } else {
                console.log("Error en el registro");
                alert('Error en el registro. Por favor, intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor', error);
            alert('Error al conectar con el servidor. Por favor, verifica tu conexión.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Completo:
                <input type="text" name="nombreUsuario" value={userData.nombreUsuario} onChange={handleChange} required />
            </label>
            <label>
                Email:
                <input type="email" name="email" value={userData.email} onChange={handleChange} required />
            </label>
            <label>
                Contraseña:
            <input type="password" name="password" value={userData.password} onChange={handleChange} required />
            </label>
            <button type="submit">Registrarse</button>
            </form>
            );
}

export default RegistrationForm;
