import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Registration } from './screens/Registration';
import { UserInfo } from './screens/UserInfo';
import { IPSettings } from './screens/IPSettings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/user-info" element={<UserInfo />} />
        <Route path="/ip-settings" element={<IPSettings />} />
      </Routes>
    </Router>
  );
}

export default App;
