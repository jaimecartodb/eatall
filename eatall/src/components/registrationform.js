import React, { useState } from 'react';

function RegistrationForm() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (event) => {
        setUserData({...userData, [event.target.name]: event.target.value});
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(userData); // Aquí conectarás con tu backend más adelante
        // Aquí agregarías la lógica para enviar datos al servidor
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input type="text" name="username" value={userData.username} onChange={handleChange} />
            </label>
            <label>
                Email:
                <input type="email" name="email" value={userData.email} onChange={handleChange} />
            </label>
            <label>
                Password:
                <input type="password" name="password" value={userData.password} onChange={handleChange} />
            </label>
            <button type="submit">Register</button>
        </form>
    );
}

export default RegistrationForm;