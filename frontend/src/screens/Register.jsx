import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../config/axios.js';
import { UserContext } from "../context/user.context.jsx";

const Login = () => {

  const[email, setEmail] = useState('');
  const[password, setPassword] = useState('');

  const { setUser } = useContext(UserContext); 

  const navigate = useNavigate();

  function submitHandler(e){

    e.preventDefault();

    axios.post('users/register', {
      email,
      password
    }).then((res) => {
      console.log(res.data);

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/');
    }).catch((error) => {
      console.log(error.response.data);
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Register</h2>
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Enter your email"
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>
        <p className="text-gray-400 mt-4">
           {"Already have an account?" + " "}
           <Link to="/login" className="text-blue-500 hover:underline">
            Login
           </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;