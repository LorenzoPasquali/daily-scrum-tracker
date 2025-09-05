import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmationModal({ show, handleClose, handleConfirm, title, body }) {
  const modalBodyStyle = {
    backgroundColor: '#0d1117',
    color: '#c9d1d9'
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton closeVariant="white" className="border-secondary" style={modalBodyStyle}>
        <Modal.Title>{title || 'Confirmar Ação'}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={modalBodyStyle}>
        <p>{body || 'Você tem certeza que deseja continuar?'}</p>
      </Modal.Body>
      <Modal.Footer className="border-secondary" style={modalBodyStyle}>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Confirmar Exclusão
        </Button>
      </Modal.Footer>
    </Modal>
  );
}