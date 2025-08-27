// src/pages/RegisterPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';

export default function RegisterPage() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Partículas sutis para o fundo
  const particlesInit = useCallback(async (engine) => { await loadSlim(engine); }, []);
  const particlesOptions = {
    background: { color: { value: "#0d1117" } },
    fpsLimit: 60,
    particles: {
      color: { value: "#a78bfa" },
      move: { enable: true, speed: 0.5 },
      number: { density: { enable: true, area: 800 }, value: 20 },
      opacity: { value: 0.2 },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  useEffect(() => {
    if (location.state?.prefilledEmail) {
      setEmail(location.state.prefilledEmail);
    }
  }, [location.state]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    try {
      await api.post('/auth/register', { email, password });
      setSuccess('Usuário criado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Este email já está em uso. Tente outro.');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Particles id="tsparticles-register" init={particlesInit} options={particlesOptions} style={{ position: 'absolute', zIndex: 0 }} />
      <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Card bg="dark" text="light" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(22, 27, 34, 0.85)', backdropFilter: 'blur(10px)' }}>
          <Card.Body>
            <h1 className="text-center mb-4">Criar Conta</h1>
            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ backgroundColor: '#0d1117', color: 'white', borderColor: '#30363d' }} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Senha</Form.Label>
                <Form.Control type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} style={{ backgroundColor: '#0d1117', color: 'white', borderColor: '#30363d' }} />
              </Form.Group>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <div className="d-grid gap-2">
                <Button variant="success" type="submit">Registrar</Button>
              </div>
            </Form>
            <div className="text-center mt-3">
              <Link to="/login" className="text-light">Já tem uma conta? Faça login</Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}