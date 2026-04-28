import { useRef } from 'react';
import { MenuItem, Menu } from '@mui/material';

const NestedMenuItem = ({ label, rightIcon, parentMenuOpen, children, sx, open, onOpenChange, ...props }) => {
  const menuItemRef = useRef(null);

  return (
    <>
      <MenuItem
        ref={menuItemRef}
        onClick={(e) => { e.stopPropagation(); onOpenChange?.(true); }}
        onMouseEnter={() => onOpenChange?.(true)}
        sx={{ display: 'flex', justifyContent: 'space-between', ...sx }}
        {...props}
      >
        {label}
        {rightIcon}
      </MenuItem>
      <Menu
        anchorEl={menuItemRef.current}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        open={Boolean(open && parentMenuOpen)}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        onClose={() => onOpenChange?.(false)}
        style={{ pointerEvents: 'none' }}
        slotProps={{ paper: { style: { pointerEvents: 'auto' } } }}
      >
        {children}
      </Menu>
    </>
  );
};

export default NestedMenuItem;
