import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Registration } from './screens/Registration';
import { UserInfo } from './screens/UserInfo';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/user-info" element={<UserInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
