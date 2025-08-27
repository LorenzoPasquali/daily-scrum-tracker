import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: { value: "#0d1117" },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
      },
    },
    particles: {
      color: { value: "#a78bfa" },
      links: {
        color: "#a78bfa",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: { enable: true, area: 800 },
        value: 80,
      },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  const handleEmailSignup = (e) => {
    e.preventDefault();
    if (email) {
      navigate('/register', { state: { prefilledEmail: email } });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60%',
        zIndex: 0.5,
        background: 'linear-gradient(to top, rgba(167, 139, 250, 0.15) 0%, rgba(13, 17, 23, 0) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Conteúdo da página (Navbar e Hero Section) */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Navbar variant="dark" expand="lg" style={{ backgroundColor: 'transparent' }}>
          <Container>
            <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">ScrumDaily</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/login">Entrar</Nav.Link>
                <Button as={Link} to="/register" variant="outline-light" className="ms-2">Cadastrar</Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container
          className="d-flex flex-column justify-content-center align-items-center text-center text-light flex-grow-1"
        >
          <h1 className="display-3 fw-bold mb-3" style={{ maxWidth: '800px' }}>
            Organize suas Dailies. Simplifique seu dia.
          </h1>
          <p className="lead mt-3 mb-4" style={{ maxWidth: '700px', color: '#adb5bd' }}>
            O Scrum Daily Tracker ajuda você a registrar suas tarefas diárias de forma rápida e objetiva, para que você esteja sempre preparado para a próxima reunião.
          </p>
          
          <Form onSubmit={handleEmailSignup} className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-3" style={{ maxWidth: '600px', width: '100%' }}>
              <InputGroup className="mb-2 mb-md-0 me-md-2" style={{ maxWidth: '300px' }}>
                  <Form.Control
                      type="email"
                      placeholder="Seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="py-2"
                  />
              </InputGroup>
              <Button type="submit" variant="success" size="lg" className="mb-2 mb-md-0 me-md-2">
                  Cadastrar-se
              </Button>
          </Form>
          <Button as={Link} to="/login" variant="link" className="text-decoration-none text-light mt-2">
              Já tenho uma conta
          </Button>
        </Container>
      </div>
    </div>
  );
}