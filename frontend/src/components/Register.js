import React, { useState, useContext, useEffect } from 'react';
import { navigate } from '@reach/router';
import axios from 'axios';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await (await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })).json();

    if (!result.error) {
      console.log(result.message);
      navigate('/');
    } else {
      console.log(result.error);
    }
  };
  const handleChange = e => {
    if (e.target.name === 'email') {
      setEmail(e.target.value);
    }
    if (e.target.name === 'password') {
      setPassword(e.target.value);
    }
  };
  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <div className="login-input">
          <input
            value={email}
            onChange={handleChange}
            type="text"
            name="email"
            placeholder="Email"
            autoComplete="email"
          />

          <input
            value={password}
            onChange={handleChange}
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
          />

          <button type="submit"> Sign Up </button>
        </div>
      </form>
    </div>
  );
};
