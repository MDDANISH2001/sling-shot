import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Registration } from './screens/Registration';
import { Slingshot } from './screens/Slingshot';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/slingshot" element={<Slingshot />} />
      </Routes>
    </Router>
  );
}

export default App;
