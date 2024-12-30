import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom'; 
import Login from '../screens/Login';

const AppRoutes = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/register" element={<div>Register</div>} />
            <Route path="/login" element={<Login />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default AppRoutes
