import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, rectIntersection, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import api from '../services/api';

import { useMediaQuery } from '../hooks/useMediaQuery';
import AppHeader from '../components/AppHeader';
import ParticlesBackground from '../components/ParticlesBackground';
import Sidebar from '../components/Sidebar';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ProjectsModal from '../components/ProjectsModal';
import TaskTypesModal from '../components/TaskTypesModal';

import { Spinner, Offcanvas, Button } from 'react-bootstrap';
import { ArrowLeftSquare } from 'react-bootstrap-icons';

export default function DashboardPage() {
  const [taskColumns, setTaskColumns] = useState({ PLANNED: [], DOING: [], DONE: [] });
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showTaskTypesModal, setShowTaskTypesModal] = useState(false);

  const isMobile = useMediaQuery('(max-width: 992px)');
  const navigate = useNavigate();
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const allTasks = useMemo(() => Object.values(taskColumns).flat(), [taskColumns]);
  const filteredTasks = useMemo(() => {
    if (selectedProjectIds.length === 0) return allTasks;
    return allTasks.filter(task => selectedProjectIds.includes(task.projectId));
  }, [allTasks, selectedProjectIds]);

  const handleLogout = () => { localStorage.removeItem('authToken'); navigate('/'); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userResponse, tasksResponse, projectsResponse] = await Promise.all([
        api.get('/api/user/me'),
        api.get('/api/tasks'),
        api.get('/api/projects'),
      ]);
      setCurrentUser(userResponse.data);
      const newColumns = { PLANNED: [], DOING: [], DONE: [] };
      tasksResponse.data.forEach(task => {
        if (newColumns[task.status]) newColumns[task.status].push(task);
      });
      setTaskColumns(newColumns);
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key !== 'Enter') return;
      if (showTaskFormModal || showDeleteModal || showProjectsModal || showTaskTypesModal || showLogoutConfirm) return;
      const activeElement = document.activeElement;
      const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);
      if (isTyping) return;
      handleOpenCreateModal();
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => { document.removeEventListener('keydown', handleKeyPress); };
  }, [showTaskFormModal, showDeleteModal, showProjectsModal, showTaskTypesModal, showLogoutConfirm]);
  
  const handleOpenCreateModal = () => { setTaskToEdit(null); setShowTaskFormModal(true); };
  const handleOpenEditModal = (task) => { setTaskToEdit(task); setShowTaskFormModal(true); };
  const handleCloseTaskFormModal = () => { setTaskToEdit(null); setShowTaskFormModal(false); };
  const handleTaskCreated = (newTask) => { setTaskColumns(prev => ({ ...prev, [newTask.status]: [newTask, ...prev[newTask.status]] })); };
  const handleTaskUpdated = (updatedTask) => {
    setTaskColumns(prev => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach(status => { newColumns[status] = newColumns[status].filter(t => t.id !== updatedTask.id); });
      if (newColumns[updatedTask.status]) newColumns[updatedTask.status].unshift(updatedTask);
      return newColumns;
    });
  };
  const handleOpenDeleteModal = (taskId) => { setTaskToDelete(taskId); setShowDeleteModal(true); };
  const handleCloseDeleteModal = () => { setTaskToDelete(null); setShowDeleteModal(false); };
  const handleDeleteFromModal = (taskId) => { handleCloseTaskFormModal(); setTimeout(() => handleOpenDeleteModal(taskId), 250); };
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/api/tasks/${taskToDelete}`);
      setTaskColumns(prev => {
        const newColumns = { ...prev };
        Object.keys(newColumns).forEach(status => { newColumns[status] = newColumns[status].filter(t => t.id !== taskToDelete); });
        return newColumns;
      });
      handleCloseDeleteModal();
    } catch (error) { console.error("Erro ao deletar tarefa:", error); alert('Não foi possível deletar a tarefa.'); }
  };
  const findContainer = (taskId) => {
    if (!taskId) return null;
    for (const status in taskColumns) { if (taskColumns[status].some(task => task.id === taskId)) return status; }
    return null;
  };
  const handleDragStart = (event) => { const { active } = event; const task = allTasks.find(t => t.id === active.id); setActiveTask(task); };
  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sourceContainer = findContainer(active.id);
    const destContainer = findContainer(over.id) || over.id;
    if (!sourceContainer || !destContainer || !taskColumns[sourceContainer] || !taskColumns[destContainer]) return;
    if (sourceContainer === destContainer) {
      setTaskColumns(prev => {
        const columnTasks = prev[sourceContainer];
        const oldIndex = columnTasks.findIndex(t => t.id === active.id);
        const newIndex = columnTasks.findIndex(t => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return { ...prev, [sourceContainer]: arrayMove(columnTasks, oldIndex, newIndex) };
      });
    } else {
      let movedTask;
      const sourceTasks = [...taskColumns[sourceContainer]];
      const activeIndex = sourceTasks.findIndex(t => t.id === active.id);
      if (activeIndex > -1) { [movedTask] = sourceTasks.splice(activeIndex, 1); } else return;
      const updatedTask = { ...movedTask, status: destContainer };
      api.put(`/api/tasks/${active.id}`, { status: destContainer }).catch(() => { fetchData(); alert('Não foi possível mover a tarefa.'); });
      setTaskColumns(prev => {
        const destTasks = [...prev[destContainer]];
        const overIndex = destTasks.findIndex(t => t.id === over.id);
        if (overIndex !== -1) { destTasks.splice(overIndex, 0, updatedTask); } else { destTasks.push(updatedTask); }
        return { ...prev, [sourceContainer]: sourceTasks, [destContainer]: destTasks };
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleProjectToggle = (projectId) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId) 
        : [...prev, projectId]
    );
  };

  const renderDashboardContent = () => {
    const filteredPlanned = filteredTasks.filter(t => t.status === 'PLANNED');
    const filteredDoing = filteredTasks.filter(t => t.status === 'DOING');
    const filteredDone = filteredTasks.filter(t => t.status === 'DONE');

    if (loading) {
      return <div className="w-100 text-center mt-5"><Spinner animation="border" variant="light" /></div>;
    }
    if (isMobile) {
      return (
        <div className="d-flex flex-column gap-3 h-100">
          <KanbanColumn title="Planejado" status="PLANNED" tasks={filteredPlanned} projects={projects} onEdit={handleOpenEditModal} isMobile />
          <KanbanColumn title="Em progresso" status="DOING" tasks={filteredDoing} projects={projects} onEdit={handleOpenEditModal} isMobile />
          <KanbanColumn title="Feito" status="DONE" tasks={filteredDone} projects={projects} onEdit={handleOpenEditModal} isMobile />
        </div>
      );
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', height: '100%' }}>
        <KanbanColumn title="Planejado" status="PLANNED" tasks={filteredPlanned} projects={projects} onEdit={handleOpenEditModal} />
        <KanbanColumn title="Em progresso" status="DOING" tasks={filteredDoing} projects={projects} onEdit={handleOpenEditModal} />
        <KanbanColumn title="Feito" status="DONE" tasks={filteredDone} projects={projects} onEdit={handleOpenEditModal} />
      </div>
    );
  };

  return (
    <div className="vh-100 vw-100 d-flex flex-column" style={{ backgroundColor: '#0d1117', overflow: 'hidden' }}>
      <ParticlesBackground variant="subtle" />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <AppHeader 
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleMobileSidebar={() => setShowMobileSidebar(true)}
          onNewTaskClick={handleOpenCreateModal}
          currentUser={currentUser}
          onLogoutClick={() => setShowLogoutConfirm(true)}
        />
      </div>
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden', position: 'relative', zIndex: 1, minHeight: 0 }}>
        {!isMobile && (
          <Sidebar 
            isMobile={isMobile}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onProjectsClick={() => setShowProjectsModal(true)} 
            onTaskTypesClick={() => setShowTaskTypesModal(true)}
          />
        )}
        <main className="flex-grow-1 p-3 d-flex flex-column" style={{ overflow: 'hidden' }}>
          <header className="mb-3 d-none d-lg-flex justify-content-between align-items-center">
            <h1 className="fs-3 text-light mb-0">Monitor de Tarefas</h1>
            <div className="d-flex align-items-center gap-2">
                {projects.map(project => {
                    const isSelected = selectedProjectIds.includes(project.id);
                    const anyFilterActive = selectedProjectIds.length > 0;

                    let buttonStyle = {
                        borderRadius: '16px',
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease-in-out',
                        color: '#fff',
                        outline: 'none',
                        boxShadow: 'none',
                    };

                    if (anyFilterActive && !isSelected) {
                        buttonStyle = {
                            ...buttonStyle,
                            textDecoration: 'line-through',
                            opacity: 0.5,
                            backgroundColor: 'rgba(80, 80, 80, 0.2)',
                        };
                    } else {
                        buttonStyle = {
                            ...buttonStyle,
                            backgroundColor: `${project.color}40`,
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${project.color}80`,
                        };

                        if (isSelected) {
                            buttonStyle = {
                                ...buttonStyle,
                                fontWeight: 'bold',
                                backgroundColor: `${project.color}70`,
                                boxShadow: `0 0 10px ${project.color}B3`,
                                border: `1px solid ${project.color}CC`,
                            };
                        }
                    }

                    return (
                        <Button 
                            key={project.id} 
                            size="sm"
                            variant="dark"
                            className="no-focus-override"
                            style={buttonStyle}
                            onClick={() => handleProjectToggle(project.id)}
                        >
                            {project.name}
                        </Button>
                    );
                })}
            </div>
          </header>
          <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {renderDashboardContent()}
            <DragOverlay>{activeTask ? <TaskCard task={activeTask} projects={projects} onEdit={() => {}} /> : null}</DragOverlay>
          </DndContext>
        </main>
      </div>

      <Offcanvas 
        show={showMobileSidebar} 
        onHide={() => setShowMobileSidebar(false)} 
        style={{backgroundColor: '#0d1117', color: 'white', width: '260px'}}
      >
        <Offcanvas.Header closeButton closeVariant="white" />
        <Offcanvas.Body className="p-0">
          <Sidebar 
            isMobile={isMobile}
            isCollapsed={false}
            onToggleCollapse={() => setShowMobileSidebar(false)}
            onProjectsClick={() => {setShowProjectsModal(true); setShowMobileSidebar(false);}} 
            onTaskTypesClick={() => {setShowTaskTypesModal(true); setShowMobileSidebar(false);}}
          />
        </Offcanvas.Body>
      </Offcanvas>
      
      <TaskFormModal show={showTaskFormModal} handleClose={handleCloseTaskFormModal} onTaskCreated={handleTaskCreated} onTaskUpdated={handleTaskUpdated} taskToEdit={taskToEdit} onDelete={handleDeleteFromModal}/>
      <ConfirmationModal 
        show={showDeleteModal} 
        handleClose={handleCloseDeleteModal} 
        handleConfirm={handleConfirmDelete} 
        title="Confirmar Exclusão" 
        body="Você tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita." 
        confirmButtonText="Confirmar Exclusão" 
      />
      <ConfirmationModal 
        show={showLogoutConfirm} 
        handleClose={() => setShowLogoutConfirm(false)} 
        handleConfirm={handleLogout} 
        title="Confirmar Saída" 
        body="Você tem certeza que deseja sair da sua conta?" 
        confirmButtonText="Sair" 
        confirmButtonVariant="primary" 
      />
      <ProjectsModal show={showProjectsModal} handleClose={() => setShowProjectsModal(false)} />
      <TaskTypesModal show={showTaskTypesModal} handleClose={() => setShowTaskTypesModal(false)} />
    </div>
  );
}