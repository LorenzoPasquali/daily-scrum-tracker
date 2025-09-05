import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash } from 'react-bootstrap-icons';

export default function TaskCard({ task, projects = [], onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
  const taskType = project && task.taskTypeId ? project.taskTypes.find(tt => tt.id === task.taskTypeId) : null;
  
  const projectColor = project ? project.color : 'transparent';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab',
    borderLeft: `4px solid ${projectColor}`, 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', 
  };

  const cardStyle = {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '7px',
  };

  const handleTrashClick = (e) => {
    e.stopPropagation();
    onDelete(task.id);
  };
  
  const handleCardClick = () => {
    onEdit(task);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card 
        style={cardStyle} 
        className="mb-2 text-light"
      >
        <div {...listeners} onClick={handleCardClick} style={{ cursor: 'grab' }}>
          <Card.Body className="p-2">
            <div className="d-flex justify-content-between">
              <div className="d-flex align-items-center">
                {project && (
                  <div 
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: projectColor,
                      marginRight: '8px',
                      flexShrink: 0
                    }}
                  />
                )}
                <span className="mb-0 small fw-bold">{task.title}</span>
              </div>
              <div>
                <Trash size={14} className="ms-2 text-white" style={{ cursor: 'pointer' }} onClick={handleTrashClick} />
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                    {taskType && (
                        <Badge pill bg="dark" className="fw-normal text-secondary">{taskType.name}</Badge>
                    )}
                </div>
                <small className="text-white-50">
                  {formatDate(task.updatedAt)}
                </small>
            </div>
          </Card.Body>
        </div>
      </Card>
    </div>
  );
}