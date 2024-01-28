// Archivo para gestionar el sign-in de los usuarios 
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Utilizamos AuthContext para gestionar el estado de autenticación

function LoginForm() {
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleChange = (event) => {
        setLoginData({...loginData, [event.target.name]: event.target.value});
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', loginData);
            console.log("Respuesta del servidor:", response.data); 
            if (response.data.authenticated) {
                console.log(response.data.UsuarioID);
                login(response.data.UsuarioID);
                navigate('/ingredients'); // Si el log-in es exitoso, navega a la página de ingredientes
            } else {
                alert('Credenciales incorrectas'); 
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Error al intentar iniciar sesión'); 
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <label>
                Email:
                <input type="email" name="email" value={loginData.email} onChange={handleChange} required />
            </label>
            <label>
                Contraseña:
                <input type="password" name="password" value={loginData.password} onChange={handleChange} required />
            </label>
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
}

export default LoginForm;
