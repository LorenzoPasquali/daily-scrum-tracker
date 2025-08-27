import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      window.location.href = '/dashboard';
    } else {
      navigate('/login?error=auth_failed');
    }
  }, [navigate]);

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Autenticando...</span>
      </Spinner>
    </Container>
  );
}