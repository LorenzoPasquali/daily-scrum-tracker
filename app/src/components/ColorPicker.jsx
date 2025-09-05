import React from 'react';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { PaletteFill } from 'react-bootstrap-icons';

const vividColors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#0ea5e9',
  '#6366f1',
  '#a855f7',
  '#ec4899',
];

export default function ColorPicker({ currentColor, onColorSelect }) {
  
  const popover = (
    <Popover id="popover-color-picker">
      <Popover.Body style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', backgroundColor: '#161b22', borderRadius: '8px' }}>
        {vividColors.map(color => (
          <div
            key={color}
            onClick={() => onColorSelect(color)}
            style={{
              backgroundColor: color,
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: currentColor === color ? '2px solid #c9d1d9' : '2px solid transparent', 
              boxShadow: currentColor === color ? `0 0 0 1px ${color}` : 'none',
              transition: 'all 0.1s ease-in-out',
            }}
          />
        ))}
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" placement="bottom" overlay={popover} rootClose>
      <Button variant="link" className="p-0 m-0">
        <PaletteFill color={currentColor} size={20} />
      </Button>
    </OverlayTrigger>
  );
}