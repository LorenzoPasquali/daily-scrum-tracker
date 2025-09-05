import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { PencilFill, TrashFill } from 'react-bootstrap-icons';
import api from '../services/api';

export default function TaskTypesModal({ show, handleClose }) {
  const [taskTypes, setTaskTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTypeName, setNewTypeName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsResponse] = await Promise.all([
        api.get('/api/projects'),
      ]);
      setProjects(projectsResponse.data);
      
      const allTypes = projectsResponse.data.flatMap(p => p.taskTypes.map(tt => ({...tt, projectName: p.name })));
      setTaskTypes(allTypes);

    } catch (err) {
      console.error("Erro ao buscar dados", err);
      setError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchData();
    }
  }, [show]);

  const handleCreateTaskType = async () => {
    if (!newTypeName.trim() || !selectedProjectId) {
        setError('Por favor, preencha o nome e selecione um projeto.');
        return;
    }
    setError('');
    try {
      const response = await api.post('/api/task-types', { 
        name: newTypeName, 
        projectId: parseInt(selectedProjectId) 
      });
      fetchData();
      setNewTypeName('');
      setSelectedProjectId('');
    } catch (error) {
      console.error("Erro ao criar tipo de tarefa", error);
      setError('Não foi possível criar o tipo de tarefa.');
    }
  };

  const modalStyle = { backgroundColor: '#0d1117', color: '#c9d1d9' };
  const darkInputStyle = { backgroundColor: '#21262d', color: 'white', borderColor: '#30363d' };
  const customThStyle = { backgroundColor: '#161b22', borderColor: '#30363d', color: '#8b949e' };
  const customTdStyle = { backgroundColor: '#0d1117', borderColor: '#30363d', color: '#c9d1d9' };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton closeVariant="white" className="border-secondary" style={modalStyle}>
        <Modal.Title>Gerenciar Tipos de Tarefa</Modal.Title>
      </Modal.Header>
      <Modal.Body style={modalStyle}>
        {error && <Alert variant="danger">{error}</Alert>}
        <h6 className="mb-3">Novo Tipo de Tarefa</h6>
        <InputGroup className="mb-4">
          <Form.Control
            placeholder="Nome do novo tipo (ex: Bug, Reunião)"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            style={darkInputStyle}
            className="custom-form-control"
          />
          <Form.Select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={darkInputStyle}
            className="custom-form-control"
          >
            <option value="">Selecione um Projeto</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </Form.Select>
          <Button variant="primary" onClick={handleCreateTaskType}>Criar</Button>
        </InputGroup>

        <hr className="text-secondary" />

        <h6 className="mb-3 mt-4">Tipos Existentes</h6>
        {loading ? (
          <div className="text-center"><Spinner animation="border" variant="light" /></div>
        ) : (
          <Table variant="dark" responsive className="border-secondary" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={customThStyle}>Nome do Tipo</th>
                <th style={customThStyle}>Projeto Associado</th>
                <th className="text-center" style={customThStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {taskTypes.map(type => (
                <tr key={type.id} style={{ borderTop: '1px solid #30363d' }}>
                  <td className="align-middle" style={customTdStyle}>{type.name}</td>
                  <td className="align-middle" style={customTdStyle}>{type.projectName}</td>
                  <td className="text-center align-middle" style={customTdStyle}>
                    <Button variant="link" size="sm" className="text-light me-2"><PencilFill /></Button>
                    <Button variant="link" size="sm" className="text-danger"><TrashFill /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}