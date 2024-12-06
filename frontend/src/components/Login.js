
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Perform login logic here
    onLogin(username); // Pass username to parent component on successful login
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-800">
        
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full sm:w-96">
        
        <h3 className="text-xl font-semibold text-white mb-6 text-center">Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="text-white">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="text-white">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-white">
          Don't have an account? 
          <Link to="/signup" className="text-blue-500 font-semibold"> Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
