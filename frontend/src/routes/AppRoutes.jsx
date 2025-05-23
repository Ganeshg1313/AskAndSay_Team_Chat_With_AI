import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom'; 
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import Project from '../screens/Project';
import UserAuth from '../auth/UserAuth';

const AppRoutes = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<UserAuth> <Home /> </UserAuth>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />}/>
            <Route path="/project" element={<UserAuth> <Project /> </UserAuth>}/>
            <Route path="*" element={<div className="text-center text-white">404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default AppRoutes
