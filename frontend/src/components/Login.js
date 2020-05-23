import React, { useState, useContext, useEffect } from 'react';
import { navigate } from '@reach/router';
import { UserContext } from '../App';
import axios from 'axios';

export default () => {
  const [user, setUser] = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await (await fetch('http://localhost:4000/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })).json();

    if (result.accessToken) {
      setUser({
        accessToken: result.accessToken
      });
      navigate('/');
    } else {
      console.log('Didnt get back access token:', result);
    }
  };

  useEffect(() => {
    console.log(user);
  }, []);

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
        <h2>Login</h2>
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

          <button type="submit"> Login </button>
        </div>
      </form>
    </div>
  );
};
