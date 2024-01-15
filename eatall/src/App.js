import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import RegistrationForm from './components/registrationform.js';
import LoginForm from './components/loginform.js';
import IngredientForm from './components/ingredientform.js'; 

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Bienvenido a EatAll</h1>
          <nav>
            <Link to="/register">Registrarse</Link> | 
            <Link to="/login">Iniciar Sesión</Link> | 
            <Link to="/ingredients">Ingredientes</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/ingredients" element={<IngredientForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
