import React from 'react';
import TriviaGame from './TriviaGame';  // TriviaGame komponentini daxil et
import './styles.css';  // Stil faylını daxil et

const App = () => {
  return (
    <div className="app-container">
      <h1 className="app-title">Kim Milyoner Olmaq İstər?</h1>
      <TriviaGame />  {/* TriviaGame komponentini buraya daxil edirik */}
    </div>
  );
}

export default App;


