import React, { useState } from 'react';

function RegistrationForm() {
    const [userData, setUserData] = useState({
        nombreUsuario: '',
        email: '',
        password: '',
        fechaCreacion: new Date().toISOString().slice(0, 10)
    });

    const handleChange = (event) => {
        setUserData({...userData, [event.target.name]: event.target.value});
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(userData);
    
        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                console.log("Error en el registro");
            }
        } catch (error) {
            console.error('Error al conectar con el servidor', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre de Usuario:
                <input type="text" name="nombreUsuario" value={userData.nombreUsuario} onChange={handleChange} />
            </label>
            <label>
                Email:
                <input type="email" name="email" value={userData.email} onChange={handleChange} />
            </label>
            <label>
                Contraseña:
                <input type="password" name="password" value={userData.password} onChange={handleChange} />
            </label>
            <button type="submit">Registrarse</button>
        </form>
    );
}

export default RegistrationForm;
