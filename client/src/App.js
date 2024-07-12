import './App.css';
import React from 'react'
import { Routes, Route } from "react-router-dom"
import Login from './Component/Login';
import Join from './Component/member/Join';
import Main from './Component/Main';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/join" element={<Join />}/>
        <Route path="/main" element={<Main />}/>
      </Routes>
    </div>
  );
}

export default App;
