import React from 'react';
import './App.css';
import RegistrationForm from './components/registrationform.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Edit <code>src/App.js</code> and save to reload.</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Registro de Usuarios EatAll
        </a>        
        <RegistrationForm />
      </header>
    </div>
  );
}

export default App;
