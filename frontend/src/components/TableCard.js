import React from 'react';

function TableCard({ table, onSelect, isSelected, showActions }) {
    
    const cardStyle = {
        padding: '15px',
        border: `2px solid ${isSelected ? 'blue' : '#ccc'}`,
        borderRadius: '8px',
        backgroundColor: table.status === 'TRỐNG' ? '#e6ffe6' : (table.status === 'ĐANG SỬ DỤNG' ? '#fffac8' : '#ffe6e6'),
        margin: '10px',
        cursor: onSelect ? 'pointer' : 'default',
        width: '150px',
        textAlign: 'center'
    };

    return (
        <div style={cardStyle} onClick={onSelect ? () => onSelect(table) : null}>
            <h4>Bàn số {table.tableNumber}</h4>
            <p>Sức chứa: {table.capacity}</p>
            <p style={{ fontWeight: 'bold' }}>{table.status}</p>
            
            {showActions && (
                <div style={{marginTop: '10px'}}>
                    {/* Các nút hành động quản lý (ví dụ: Xem Order, Thanh toán) sẽ nằm ở đây */}
                    {/* <button>Xem Order</button> */}
                </div>
            )}
        </div>
    );
}

export default TableCard;