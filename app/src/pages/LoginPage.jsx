// src/pages/LoginPage.jsx

import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { Google } from 'react-bootstrap-icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Partículas sutis para o fundo
  const particlesInit = useCallback(async (engine) => { await loadSlim(engine); }, []);
  const particlesOptions = {
    background: { color: { value: "#0d1117" } },
    fpsLimit: 60,
    particles: {
      color: { value: "#a78bfa" },
      move: { enable: true, speed: 0.5 },
      number: { density: { enable: true, area: 800 }, value: 20 }, // Número bem reduzido de partículas
      opacity: { value: 0.2 },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, preencha o email e a senha.');
      return;
    }
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError('Credenciais inválidas. Por favor, tente novamente.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Particles id="tsparticles-login" init={particlesInit} options={particlesOptions} style={{ position: 'absolute', zIndex: 0 }}/>
      <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Card bg="dark" text="light" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(22, 27, 34, 0.85)', backdropFilter: 'blur(10px)' }}>
          <Card.Body>
            <h1 className="text-center mb-4">Entrar</h1>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ backgroundColor: '#0d1117', color: 'white', borderColor: '#30363d' }} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Senha</Form.Label>
                <Form.Control type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} style={{ backgroundColor: '#0d1117', color: 'white', borderColor: '#30363d' }} />
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="d-grid gap-2">
                <Button variant="primary" type="submit">Entrar</Button>
                <hr />
                <Button variant="outline-light" onClick={handleGoogleLogin}>
                  <Google className="me-2" /> Entrar com Google
                </Button>
              </div>
            </Form>
            <div className="text-center mt-3">
              <Link to="/register" className="text-light">Não tem uma conta? Registre-se</Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}