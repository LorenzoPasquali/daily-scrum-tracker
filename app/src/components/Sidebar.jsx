import React, { useContext } from 'react';
import { Nav, Accordion, useAccordionButton, AccordionContext } from 'react-bootstrap';
import { HouseDoorFill, CollectionFill, BarChartFill, Folder, TagFill, ChevronDown, ChevronUp } from 'react-bootstrap-icons';

function CustomToggle({ children, eventKey }) {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey);
  const isCurrentEventKey = activeEventKey === eventKey;
  const linkStyle = { color: '#8b949e', textDecoration: 'none' };
  const linkHoverStyle = (e) => { e.target.style.backgroundColor = '#1c2128'; e.target.style.color = '#c9d1d9'; };
  const linkLeaveStyle = (e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#8b949e'; };

  return (
    <div
      style={linkStyle}
      className="d-flex justify-content-between align-items-center p-3"
      onClick={decoratedOnClick}
      onMouseEnter={linkHoverStyle}
      onMouseLeave={linkLeaveStyle}
      role="button"
    >
      <div className="d-flex align-items-center">
        {children}
      </div>
      {isCurrentEventKey ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </div>
  );
}

export default function Sidebar({ onProjectsClick, onTaskTypesClick  }) {
  const sidebarStyle = {
    width: '260px',
    backgroundColor: 'rgba(22, 27, 34, 0.6)',
    backdropFilter: 'blur(10px)',
    zIndex: 2,
  };
  const activeLinkStyle = {
    borderLeft: '3px solid #a78bfa',
    backgroundColor: '#1c2128',
  };

  return (
    <div style={sidebarStyle} className="vh-100 d-flex flex-column flex-shrink-0 border-end border-secondary">
      <div className="p-3">
        <h2 className="fs-4 text-light">Daily Tracker</h2>
      </div>
      <hr className="text-secondary mt-0" />
      
      <Nav className="flex-column nav-pills">
        <Nav.Link href="#" className="text-light d-flex align-items-center p-3" style={activeLinkStyle}>
          <HouseDoorFill className="me-2" /> Monitor de Tarefas
        </Nav.Link>

        <Accordion>
            <CustomToggle eventKey="0">
              <CollectionFill className="me-2" /> Cadastros
            </CustomToggle>
            <Accordion.Collapse eventKey="0">
              <div>
                <Nav.Link onClick={onProjectsClick} className="text-secondary d-flex align-items-center py-2 ps-5" role="button">
                  <Folder className="me-2" /> Projetos
                </Nav.Link>
                <Nav.Link onClick={onTaskTypesClick} className="text-secondary d-flex align-items-center py-2 ps-5" role="button">
                  <TagFill className="me-2" /> Tipos de Tarefa
                </Nav.Link>
              </div>
            </Accordion.Collapse>
        </Accordion>

        <Nav.Link href="#" className="text-secondary d-flex align-items-center p-3">
          <BarChartFill className="me-2" /> Relatórios
        </Nav.Link>
      </Nav>
    </div>
  );
}