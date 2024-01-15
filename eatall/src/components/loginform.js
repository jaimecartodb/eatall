import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (event) => {
        setLoginData({...loginData, [event.target.name]: event.target.value});
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', loginData);
            console.log(response.data);
            navigate('/ingredientform.js');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <label>
                Email:
                <input type="email" name="email" value={loginData.email} onChange={handleChange} />
            </label>
            <label>
                Contraseña:
                <input type="password" name="password" value={loginData.password} onChange={handleChange} />
            </label>
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
}

export default LoginForm;
