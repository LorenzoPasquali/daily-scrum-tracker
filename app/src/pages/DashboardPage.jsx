import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import api from '../services/api';

import ParticlesBackground from '../components/ParticlesBackground';
import Sidebar from '../components/Sidebar';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ProjectsModal from '../components/ProjectsModal';
import TaskTypesModal from '../components/TaskTypesModal';

import { Button, Spinner } from 'react-bootstrap';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([])
  const [activeTask, setActiveTask] = useState(null);

  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showTaskTypesModal, setShowTaskTypesModal] = useState(false)
  
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/projects')
      ]);
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setShowTaskFormModal(true);
  };
  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setShowTaskFormModal(true);
  };
  const handleCloseTaskFormModal = () => {
    setShowTaskFormModal(false);
    setTaskToEdit(null);
  };
  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };
  const handleTaskUpdated = (updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  };
  const handleOpenDeleteModal = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/api/tasks/${taskToDelete}`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      alert('Não foi possível deletar a tarefa.');
      handleCloseDeleteModal();
    }
  };


  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const sourceContainer = activeTask.status;
    const destinationContainer = over.data.current?.sortable?.containerId || over.id;
    
    if (sourceContainer !== destinationContainer) {
      const updatedTask = { ...activeTask, status: destinationContainer };
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === active.id ? updatedTask : task))
      );
      api.put(`/api/tasks/${active.id}`, updatedTask).catch(() => setTasks(tasks));
      return;
    }

    const overTask = tasks.find(t => t.id === over.id);
    if (overTask) {
        const activeIndex = tasks.findIndex(t => t.id === active.id);
        const overIndex = tasks.findIndex(t => t.id === over.id);
        
        if (activeIndex !== overIndex) {
            setTasks(currentTasks => arrayMove(currentTasks, activeIndex, overIndex));
        }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const doneTasks = tasks.filter(task => task.status === 'DONE');
  const doingTasks = tasks.filter(task => task.status === 'DOING');
  const plannedTasks = tasks.filter(task => task.status === 'PLANNED');

  return (
    <div className="d-flex vh-100 vw-100 position-relative" style={{ backgroundColor: '#0d1117', overflow: 'hidden' }}>
      <ParticlesBackground variant="subtle" />
      <Sidebar 
        onProjectsClick={() => setShowProjectsModal(true)} 
        onTaskTypesClick={() => setShowTaskTypesModal(true)}
      />
      
      <main className="flex-grow-1 p-4 d-flex flex-column" style={{ zIndex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <header className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
            <div>
                <h1 className="fs-3 text-light">Monitor de Tarefas</h1>
            </div>
            <div>
                <Button variant="primary" className="me-2" onClick={handleOpenCreateModal}>+ Nova Tarefa</Button>
                <Button variant="outline-secondary" onClick={handleLogout}>Sair</Button>
            </div>
        </header>
        
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
            <div className="d-flex gap-4 flex-grow-1" style={{ minWidth: '700px', overflowX: 'auto', paddingBottom: '1rem' }}>
              {loading ? (
                  <div className="w-100 text-center mt-5"><Spinner animation="border" variant="light" /></div>
              ) : (
                  <>
                      <KanbanColumn title="Planejado" status="PLANNED" tasks={plannedTasks} projects={projects} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                      <KanbanColumn title="Em progresso" status="DOING" tasks={doingTasks} projects={projects} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                      <KanbanColumn title="Feito" status="DONE" tasks={doneTasks} projects={projects} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                  </>
              )}
            </div>
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} projects={projects} /> : null} 
            </DragOverlay>
        </DndContext>
      </main>
      
      <TaskFormModal show={showTaskFormModal} handleClose={handleCloseTaskFormModal} onTaskCreated={handleTaskCreated} onTaskUpdated={handleTaskUpdated} taskToEdit={taskToEdit} />
      <ConfirmationModal show={showDeleteModal} handleClose={handleCloseDeleteModal} handleConfirm={handleConfirmDelete} title="Confirmar Exclusão" body="Você tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita." />
      <ProjectsModal show={showProjectsModal} handleClose={() => setShowProjectsModal(false)} />
      <TaskTypesModal show={showTaskTypesModal} handleClose={() => setShowTaskTypesModal(false)} />
    </div>
  );
}