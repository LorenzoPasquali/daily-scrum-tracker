import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

import ParticlesBackground from '../components/ParticlesBackground';

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { PencilSquare, Trash, BoxArrowRight, CheckLg, XLg } from 'react-bootstrap-icons';

export default function DashboardPage() {
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [didTask, setDidTask] = useState('');
  const [willTask, setWillTask] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  const [notification, setNotification] = useState({ show: false, message: '', variant: 'danger' });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/entries');
      const sortedEntries = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllHistory(sortedEntries);

      if (sortedEntries.length > 0) {
        setFilterDate(date);
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      if (error.response?.status === 401) handleLogout();
      else showNotification('Erro ao carregar o histórico.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterDate) {
      const filtered = allHistory.filter(entry => entry.date.startsWith(filterDate));
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory([]);
    }
  }, [filterDate, allHistory]);

  useEffect(() => {
    setFilterDate(date);
  }, [date]);


  const showNotification = (message, variant = 'danger') => {
    setNotification({ show: true, message, variant });
  };

  const handleAddTask = async (type) => {
    const text = type === 'did' ? didTask : willTask;
    if (!text.trim() || !date) return;
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    try {
      await api.post('/api/task', { date, type, text, time });
      if (type === 'did') setDidTask(''); else setWillTask('');
      showNotification('Tarefa adicionada com sucesso!', 'success');
      fetchHistory();
    } catch (error) {
      showNotification('Erro ao adicionar tarefa.', 'warning');
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const handleDeleteTask = async (entryDate, type, taskId) => {
    try {
      await api.delete('/api/task', { data: { date: entryDate, type, id: taskId } });
      showNotification('Tarefa removida com sucesso.', 'danger');
      fetchHistory();
    } catch (error) {
      showNotification('Erro ao remover tarefa.', 'warning');
      console.error("Erro ao deletar tarefa:", error);
    } finally {
      setTaskToDelete(null);
    }
  };
  
  const startEditing = (task, currentText) => {
    setEditingTask(task);
    setEditedText(currentText);
  };
  
  const cancelEditing = () => {
    setEditingTask(null);
    setEditedText('');
  };

  const handleEditTask = async () => {
    if (!editedText || !editingTask) return;
    const { date, type, id } = editingTask;
    try {
      await api.put('/api/task', { date, type, id, text: editedText.trim() });
      showNotification('Tarefa atualizada com sucesso!', 'success');
      fetchHistory();
    } catch (error) {
      showNotification('Erro ao editar tarefa.', 'warning');
      console.error("Erro ao editar tarefa:", error);
    } finally {
      cancelEditing();
    }
  };
  
  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      callback();
    }
  };

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const darkFormStyle = { backgroundColor: '#21262d', color: 'white', borderColor: '#444' };
  const darkListItemStyle = { backgroundColor: 'transparent', borderColor: '#30363d', color: '#c9d1d9' };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0d1117' }}>
      <ParticlesBackground variant="subtle" />

      <ToastContainer
        position="bottom-end"
        className="p-3"
        style={{ zIndex: 1050, position: 'fixed' }}
      >
        <Toast
          onClose={() => setNotification({ ...notification, show: false })}
          show={notification.show}
          delay={3000}
          autohide
          bg={notification.variant}
        >
          <Toast.Body className="text-white">{notification.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar variant="dark" expand="lg" style={{ backgroundColor: '#161b22' }}>
          <Container fluid className="px-4">
            <Navbar.Brand as={Link} to="/dashboard" className="fw-bold fs-4">DailyTracker</Navbar.Brand>
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
              backgroundColor: 'rgba(22, 27, 34, 0.70)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Card.Body style={{backgroundColor: 'rgba(22, 27, 34, 1)'}}>
              <Form.Group className="mb-3">
                <Form.Label>Data do Registro</Form.Label>
                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={darkFormStyle} className="date-input-dark" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>O que fiz ontem</Form.Label>
                <InputGroup>
                  <Form.Control 
                    placeholder="Tarefa concluída" 
                    value={didTask} 
                    onChange={(e) => setDidTask(e.target.value)} 
                    onKeyDown={(e) => handleKeyDown(e, () => handleAddTask('did'))}
                    style={darkFormStyle} 
                  />
                  <Button variant="success" onClick={() => handleAddTask('did')}>Adicionar</Button>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>O que pretendo fazer hoje</Form.Label>
                <InputGroup>
                  <Form.Control 
                    placeholder="Tarefa planejada" 
                    value={willTask} 
                    onChange={(e) => setWillTask(e.target.value)} 
                    onKeyDown={(e) => handleKeyDown(e, () => handleAddTask('will'))}
                    style={darkFormStyle} 
                  />
                  <Button variant="primary" onClick={() => handleAddTask('will')}>Adicionar</Button>
                </InputGroup>
              </Form.Group>
              <hr className="border-secondary"/>
              
              <div className="d-flex justify-content-between align-items-center mt-4">
                <h2 className="fs-4 mb-0">Histórico</h2>
                <div style={{ width: '200px' }}>
                  <Form.Control type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={darkFormStyle} className="date-input-dark"/>
                </div>
              </div>

              <div className="mt-3">
                {loading ? (
                  <div className="text-center"><Spinner animation="border" variant="light" /></div>
                ) : (
                  filteredHistory.length > 0 ? (
                    filteredHistory.map(entry => (
                      <Card key={entry.id} className="mb-3 border-secondary" style={{ backgroundColor: 'rgba(13, 17, 23, 0.5)' }}>
                        <Card.Header className="text-light" style={{backgroundColor: 'rgba(255, 255, 255, 0.05)'}}>
                          {new Date(entry.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </Card.Header>
                        <Card.Body>
                          <h6 className="text-light">O que fiz Ontem:</h6>
                          <ListGroup variant="flush">
                            {entry.did.map(task => (
                              <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center" style={darkListItemStyle}>
                                {editingTask?.id === task.id ? (
                                  <InputGroup>
                                    <Form.Control 
                                      value={editedText} 
                                      onChange={(e) => setEditedText(e.target.value)} 
                                      onKeyDown={(e) => handleKeyDown(e, handleEditTask)}
                                      autoFocus 
                                      style={darkFormStyle} 
                                    />
                                    <Button variant="outline-success" onClick={handleEditTask}><CheckLg /></Button>
                                    <Button variant="outline-secondary" onClick={cancelEditing}><XLg /></Button>
                                  </InputGroup>
                                ) : (
                                  <>
                                    <span>[{task.time}] {task.text}</span>
                                    <div>
                                      {taskToDelete?.id === task.id ? (
                                        <>
                                          <Button variant="danger" size="sm" className="me-2" onClick={() => handleDeleteTask(entry.date, 'did', task.id)}>Confirmar</Button>
                                          <Button variant="secondary" size="sm" onClick={() => setTaskToDelete(null)}>Cancelar</Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button variant="outline-light" size="sm" className="me-2" onClick={() => startEditing({ ...task, date: entry.date, type: 'did' }, task.text)}><PencilSquare /></Button>
                                          <Button variant="outline-danger" size="sm" onClick={() => setTaskToDelete(task)}><Trash /></Button>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>

                          <h6 className="mt-3 text-light">O que pretendo fazer hoje:</h6>
                          <ListGroup variant="flush">
                            {entry.will.map(task => (
                              <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center" style={darkListItemStyle}>
                                {editingTask?.id === task.id ? (
                                  <InputGroup>
                                    <Form.Control 
                                      value={editedText} 
                                      onChange={(e) => setEditedText(e.target.value)} 
                                      onKeyDown={(e) => handleKeyDown(e, handleEditTask)}
                                      autoFocus 
                                      style={darkFormStyle} 
                                    />
                                    <Button variant="outline-success" onClick={handleEditTask}><CheckLg /></Button>
                                    <Button variant="outline-secondary" onClick={cancelEditing}><XLg /></Button>
                                  </InputGroup>
                                ) : (
                                  <>
                                    <span>[{task.time}] {task.text}</span>
                                    <div>
                                      {taskToDelete?.id === task.id ? (
                                        <>
                                          <Button variant="danger" size="sm" className="me-2" onClick={() => handleDeleteTask(entry.date, 'will', task.id)}>Confirmar</Button>
                                          <Button variant="secondary" size="sm" onClick={() => setTaskToDelete(null)}>Cancelar</Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button variant="outline-light" size="sm" className="me-2" onClick={() => startEditing({ ...task, date: entry.date, type: 'will' }, task.text)}><PencilSquare /></Button>
                                          <Button variant="outline-danger" size="sm" onClick={() => setTaskToDelete(task)}><Trash /></Button>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-muted mt-4">Nenhum registro encontrado para esta data.</div>
                  )
                )}
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
}