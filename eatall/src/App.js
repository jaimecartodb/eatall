import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
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
        <Switch>
          <Route path="/register">
            <RegistrationForm />
          </Route>
          <Route path="/login">
            <LoginForm />
          </Route>
          <Route path="/ingredients">
            <IngredientForm />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
