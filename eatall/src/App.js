// Archivo con la landing page de la aplicación y gestión de rutas
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import './Appstyle.css';
import RegistrationForm from './components/registrationform';
import LoginForm from './components/loginform';
import IngredientForm from './components/ingredientform';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Bienvenido a EatAll</h1>
            <nav className="nav-links">
              <Link to="/register">Registrarse</Link> | 
              <Link to="/login">Iniciar Sesión</Link>
            </nav>
          </header>
          <Routes>
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/ingredients" element={<ProtectedRoute component={IngredientForm} />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Introduzco ProtectedRoute para aumentar la protección en las rutas
function ProtectedRoute({ component: Component }) {
  const { auth } = useAuth(); 
  return auth.isAuthenticated ? <Component /> : <Navigate to="/login" />;
}

export default App;
