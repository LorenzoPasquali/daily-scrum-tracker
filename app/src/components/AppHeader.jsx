import React from 'react';
import { Navbar, Button, Dropdown, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { List, PersonCircle, BoxArrowRight, ArrowLeftSquare, ArrowRightSquare } from 'react-bootstrap-icons';

const CustomToggle = React.forwardRef(({ onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => { e.preventDefault(); onClick(e); }}
    className="p-0 text-light user-menu-btn"
  >
    <PersonCircle size={28} />
  </a>
));

export default function AppHeader({ 
  isMobile,
  isSidebarCollapsed,
  onToggleCollapse,
  onToggleMobileSidebar,
  onNewTaskClick, 
  currentUser, 
  onLogoutClick 
}) {

  return (
    <Navbar variant="dark" className="py-1 px-3 border-bottom border-secondary" style={{ backgroundColor: '#0d1117' }}>
      <div className="d-flex align-items-center">
        {isMobile ? (
          <Button 
            variant="link" 
            onClick={onToggleMobileSidebar} 
            className="text-secondary p-2 sidebar-toggle-btn"
          >
            <List size={22} />
          </Button>
        ) : (
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={
              <Tooltip id="tooltip-collapse">
                {isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              </Tooltip>
            }
          >
            <Button variant="link" onClick={onToggleCollapse} className="text-secondary p-2 sidebar-toggle-btn">
              {isSidebarCollapsed ? <ArrowRightSquare size={16} /> : <ArrowLeftSquare size={16} />}
            </Button>
          </OverlayTrigger>
        )}
        <Navbar.Brand href="#" className="ms-2 fs-4">Daily Tracker</Navbar.Brand>
      </div>
      <div className="d-flex align-items-center ms-auto">
        <Button variant="primary" className="me-3" onClick={onNewTaskClick}>+ Nova Tarefa</Button>
        
        <Dropdown align="end">
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" />

          <Dropdown.Menu 
            variant="dark" 
            className="p-2" 
            style={{ width: 'max-content', marginTop: '10px', border: '1px solid #30363d' }}
          >
            <div className="text-center px-2 py-1">
              <div className="fw-bold">{currentUser?.email}</div>
              <div className="mb-2 mt-1">
                <Badge bg="success" pill>Plano Básico</Badge>
              </div>
            </div>
            <Dropdown.Divider />
            <Dropdown.Item as="div" className="p-0">
              <Button 
                variant="danger" 
                size="sm" 
                className="w-100 d-flex align-items-center justify-content-center" 
                onClick={onLogoutClick}
              >
                <BoxArrowRight className="me-2" /> Sair
              </Button>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Navbar>
  );
}