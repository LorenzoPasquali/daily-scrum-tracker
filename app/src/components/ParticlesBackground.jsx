import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesBackground({ variant = 'default' }) {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const isInteractive = variant === 'home' || variant === 'login';

  const options = {
    background: {
      color: { value: "#0d1117" },
    },
    fpsLimit: 144,
    particles: {
      color: { value: "#5f4a9eff" },
      links: {
        color: "#a78bfa",
        distance: 150,
        enable: isInteractive,
        opacity: 0.6,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: variant === 'home' ? 1 : (variant === 'login' ? 0.7 : 0.3),
        straight: false,
      },
      number: {
        density: { enable: true, area: 800 },
        value: variant === 'home' ? 80 : (variant === 'login' ? 60 : 30),
      },
      opacity: {
        value: variant === 'home' ? 0.3 : (variant === 'login' ? 0.5 : 0.15),
      },
      shape: { type: "circle" },
      size: { 
        value: { min: 1, max: isInteractive ? 5 : 3 } 
      },
    },
    detectRetina: true,
  };
  
  if (isInteractive) {
    options.interactivity = {
      events: {
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
      },
    }
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Particles
        id={`tsparticles-${variant}`}
        init={particlesInit}
        options={options}
      />

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60%',
        background: 'linear-gradient(to top, rgba(167, 139, 250, 0.15) 0%, rgba(13, 17, 23, 0) 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}