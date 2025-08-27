import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { PencilSquare, Trash, BoxArrowRight } from 'react-bootstrap-icons';

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [didTask, setDidTask] = useState('');
  const [willTask, setWillTask] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: { value: "#0d1117" },
    },
    fpsLimit: 60,
    particles: {
      color: { value: "#a78bfa" },
      move: { enable: true, speed: 0.5 },
      number: { density: { enable: true, area: 800 }, value: 30 },
      opacity: { value: 0.15 },
      size: { value: { min: 1, max: 2 } },
    },
    detectRetina: true,
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/entries');
      const sortedEntries = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sortedEntries);
    } catch (error) { 
      console.error("Erro ao buscar histórico:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } 
    finally { 
      setLoading(false); 
    }
  };

  const handleAddTask = async (type) => {
    const text = type === 'did' ? didTask : willTask;
    if (!text.trim() || !date) return;
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    try {
      await api.post('/api/task', { date, type, text, time });
      if (type === 'did') setDidTask(''); else setWillTask('');
      fetchHistory();
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };
  
  const handleDeleteTask = async (entryDate, type, taskId) => {
    if (!window.confirm('Excluir essa tarefa?')) return;
    try {
      await api.delete('/api/task', { data: { date: entryDate, type, id: taskId } });
      fetchHistory();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };
  
  const handleEditTask = async (entryDate, type, taskId, currentText) => {
    const newText = window.prompt("Editar tarefa:", currentText);
    if (newText && newText.trim() !== currentText) {
      try {
        await api.put('/api/task', { date: entryDate, type, id: taskId, text: newText.trim() });
        fetchHistory();
      } catch (error) {
        console.error("Erro ao editar tarefa:", error);
      }
    }
  };

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('authToken');
      navigate('/login');
      window.location.reload();
  };

  const darkFormStyle = { backgroundColor: '#21262d', color: 'white', borderColor: '#444' };
  const darkListItemStyle = { backgroundColor: '#161b22', borderColor: '#30363d', color: 'white' };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0d1117' }}>
      <Particles
        id="tsparticles-dashboard"
        init={particlesInit}
        options={particlesOptions}
        style={{ position: 'absolute', zIndex: 0, top: 0, left: 0, width: '100%', height: '100%' }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar variant="dark" expand="lg" style={{ backgroundColor: '#161b22' }}>
          <Container>
            <Navbar.Brand as={Link} to="/dashboard" className="fw-bold fs-4">ScrumDaily</Navbar.Brand>
            <Nav className="ms-auto">
              <Button variant="outline-secondary" onClick={handleLogout}>
                <BoxArrowRight className="me-2" /> Sair
              </Button>
            </Nav>
          </Container>
        </Navbar>

        <Container className="py-4">
          <Card 
            bg="dark" 
            text="light" 
            className="mx-auto border-secondary" 
            style={{ 
              maxWidth: '800px', 
              backgroundColor: 'rgba(22, 27, 34, 0.85)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Data</Form.Label>
                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={darkFormStyle} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>O que fiz ontem</Form.Label>
                <InputGroup>
                  <Form.Control placeholder="Tarefa concluída" value={didTask} onChange={(e) => setDidTask(e.target.value)} style={darkFormStyle} />
                  <Button variant="success" onClick={() => handleAddTask('did')}>Adicionar</Button>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>O que pretendo fazer hoje</Form.Label>
                <InputGroup>
                  <Form.Control placeholder="Tarefa planejada" value={willTask} onChange={(e) => setWillTask(e.target.value)} style={darkFormStyle} />
                  <Button variant="primary" onClick={() => handleAddTask('will')}>Adicionar</Button>
                </InputGroup>
              </Form.Group>
              <hr className="border-secondary"/>
              <h2 className="mt-4">Histórico</h2>
              <div className="mt-3">
                {loading ? (
                  <div className="text-center"><Spinner animation="border" variant="light" /></div>
                ) : (
                  history.map(entry => (
                    <Card key={entry.id} className="mb-3 border-secondary" style={{ backgroundColor: '#0d1117' }}>
                      <Card.Header>{new Date(entry.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Card.Header>
                      <Card.Body>
                        <h6>O que fiz Ontem:</h6>
                        <ListGroup variant="flush">
                          {entry.did.map(task => (
                            <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center" style={darkListItemStyle}>
                              <span>[{task.time}] {task.text}</span>
                              <div>
                                <Button variant="outline-light" size="sm" className="me-2" onClick={() => handleEditTask(entry.date, 'did', task.id, task.text)}><PencilSquare /></Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTask(entry.date, 'did', task.id)}><Trash /></Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        <h6 className="mt-3">O que pretendo fazer hoje:</h6>
                        <ListGroup variant="flush">
                          {entry.will.map(task => (
                            <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center" style={darkListItemStyle}>
                              <span>[{task.time}] {task.text}</span>
                              <div>
                                <Button variant="outline-light" size="sm" className="me-2" onClick={() => handleEditTask(entry.date, 'will', task.id, task.text)}><PencilSquare /></Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTask(entry.date, 'will', task.id)}><Trash /></Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
}