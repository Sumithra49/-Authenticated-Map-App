import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      alert('Google login failed');
      console.error(error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Registration successful! You are now logged in.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      alert(isRegistering ? 'Registration failed' : 'Login failed');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
       <div className="header">
        <div className="header-content">
          <div className="header-title">
            <div className="header-icon">
              {/* <Navigation size={24} /> */}
            </div>
            <h1>Route Finder</h1>
          </div>
        </div>
      </div>
      <div className="login-card">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>

        <form onSubmit={handleEmailLogin}>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <button type="submit" className="login-btn">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="separator">OR</div>

        <button onClick={handleGoogleLogin} className="google-btn">
          Sign in with Google
        </button>

        <p className="toggle-auth">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
