import React from 'react';
import './App.css';
import RegistrationForm from './components/registrationform.js';
import LoginForm from './components/loginform.js';

function App() {
  
  // Función para manejar el registro de usuarios
  const handleRegister = (registerData) => {
    console.log("Datos de registro:", registerData);
  };

  // Función para manejar el inicio de sesión
  const handleLogin = async (loginData) => {
    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.text();
            console.log(data);
        } else {
            console.log("Error en el inicio de sesión");
        }
    } catch (error) {
        console.error("Error en la conexión con el servidor", error);
    }
};

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenido a EatAll!!</h1>
        <RegistrationForm onRegister={handleRegister} />
        <h1>Iniciar Sesión</h1>
        <LoginForm onLogin={handleLogin} />
      </header>
    </div>
  );
}

export default App;
