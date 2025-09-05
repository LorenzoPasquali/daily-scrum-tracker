import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../services/api';

export default function TaskFormModal({ show, handleClose, onTaskCreated, onTaskUpdated, taskToEdit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PLANNED');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState('');
  const [projects, setProjects] = useState([]);
  const [availableTaskTypes, setAvailableTaskTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      api.get('/api/projects')
        .then(response => {
          setProjects(response.data);
          if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setStatus(taskToEdit.status);
            setSelectedProjectId(taskToEdit.projectId || '');
            setSelectedTaskTypeId(taskToEdit.taskTypeId || '');
          }
        })
        .catch(error => console.error("Erro ao buscar projetos", error))
        .finally(() => setLoading(false));
    } else {
      setTitle('');
      setDescription('');
      setStatus('PLANNED');
      setSelectedProjectId('');
      setSelectedTaskTypeId('');
      setAvailableTaskTypes([]);
    }
  }, [show, taskToEdit]);

  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === parseInt(selectedProjectId));
      setAvailableTaskTypes(project ? project.taskTypes : []);
    } else {
      setAvailableTaskTypes([]);
    }
    setSelectedTaskTypeId('');
  }, [selectedProjectId, projects]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('O título da tarefa é obrigatório.');
      return;
    }

    try {
      const taskData = { 
        title, 
        description, 
        status,
        projectId: selectedProjectId ? parseInt(selectedProjectId) : null,
        taskTypeId: selectedTaskTypeId ? parseInt(selectedTaskTypeId) : null,
      };
      
      if (taskToEdit) {
        const response = await api.put(`/api/tasks/${taskToEdit.id}`, taskData);
        onTaskUpdated(response.data);
      } else {
        const response = await api.post('/api/tasks', taskData);
        onTaskCreated(response.data);
      }
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      alert('Não foi possível salvar a tarefa.');
    }
  };

  const modalStyle = {
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
    backdropFilter: 'blur(5px)',
    color: '#c9d1d9',
    borderRadius: '16px',
  };

  const darkInputStyle = { 
    backgroundColor: '#21262d', 
    color: 'white', 
    borderColor: '#30363d' 
  };

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="modal-transparent">
        <div style={modalStyle}>
            <Modal.Header closeButton closeVariant="white" className="border-secondary">
                <Modal.Title>{taskToEdit ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? <div className="text-center"><Spinner /></div> : (
                <Form>
                    <Form.Group className="mb-3">
                    <Form.Label>
                        Título
                        <span style={{ color: '#ef4444' }}>*</span>
                    </Form.Label>
                    <Form.Control 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        style={darkInputStyle}
                        className="custom-form-control"
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Descrição</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        style={darkInputStyle}
                        className="custom-form-control"
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Projeto</Form.Label>
                    <Form.Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} style={darkInputStyle} className="custom-form-control">
                        <option value="">Nenhum projeto</option>
                        {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </Form.Select>
                    </Form.Group>

                    {selectedProjectId && (
                    <Form.Group className="mb-3">
                        <Form.Label>Tipo de Tarefa</Form.Label>
                        <Form.Select value={selectedTaskTypeId} onChange={(e) => setSelectedTaskTypeId(e.target.value)} style={darkInputStyle} className="custom-form-control" disabled={availableTaskTypes.length === 0}>
                        <option value="">Nenhum tipo</option>
                        {availableTaskTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                        </Form.Select>
                    </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} style={darkInputStyle} className="custom-form-control">
                        <option value="PLANNED">Planejado</option>
                        <option value="DOING">Em progresso</option>
                        <option value="DONE">Feito</option>
                    </Form.Select>
                    </Form.Group>
                </Form>
                )}
            </Modal.Body>
            <Modal.Footer className="border-secondary">
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave}>{taskToEdit ? 'Salvar Alterações' : 'Salvar Tarefa'}</Button>
            </Modal.Footer>
        </div>
    </Modal>
  );
}