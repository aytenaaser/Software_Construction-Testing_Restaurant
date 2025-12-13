'use client';

import React from 'react';

interface TableProps {
  table: {
    _id: string;
    tableNumber: string;
    capacity: number;
    position: { x: number; y: number };
    shape: string;
    isAvailable: boolean;
    isBooked: boolean;
    canAccommodate: boolean;
  };
  onClick: (tableId: string) => void;
}

const Table: React.FC<TableProps> = ({ table, onClick }) => {
  const getBackgroundColor = () => {
    if (table.isBooked) {
      return 'bg-gray-400'; // Booked
    }
    if (!table.canAccommodate) {
      return 'bg-red-400'; // Cannot accommodate
    }
    if (table.isAvailable) {
      return 'bg-green-400'; // Available
    }
    return 'bg-gray-400'; // Default to gray
  };

  const handleClick = () => {
    if (table.isAvailable) {
      onClick(table._id);
    }
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${table.position.x}%`,
    top: `${table.position.y}%`,
    width: '50px',
    height: '50px',
    borderRadius: table.shape === 'circle' ? '50%' : '0',
  };

  return (
    <div
      style={style}
      className={`flex items-center justify-center text-white font-bold ${getBackgroundColor()} cursor-${table.isAvailable ? 'pointer' : 'not-allowed'}`}
      onClick={handleClick}
    >
      {table.tableNumber}
    </div>
  );
};

export default Table;

