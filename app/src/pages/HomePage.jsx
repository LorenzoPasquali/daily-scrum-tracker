import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function HomePage() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: { value: "#0d1117" },
    },
    fpsLimit: 144,
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
      color: { value: "#5f4a9eff" },
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

      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Navbar variant="dark" expand="lg" style={{ backgroundColor: 'transparent' }}>
          <Container fluid className="px-4"> 
            <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">DailyTracker</Navbar.Brand>
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
            O Daily Scrum Tracker ajuda você a registrar suas tarefas diárias de forma rápida e objetiva, para que você esteja sempre preparado para a próxima reunião.
          </p>
          
          <div className="d-flex justify-content-center mb-2">
            <Button as={Link} to="/register" variant="outline-light">
                Cadastrar-se
            </Button>
          </div>
          
          <Button as={Link} to="/login" variant="link" className="text-decoration-none text-light" style={{ fontSize: '0.8em', opacity: 0.5 }}>
              Já tenho uma conta
          </Button>
        </Container>
      </div>
    </div>
  );
}