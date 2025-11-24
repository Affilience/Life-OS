import React from 'react';
import './Table.css';

const Table = ({ 
  headers, 
  data, 
  className = '' 
}) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead className="table-header">
          <tr className="table-header-row">
            {headers.map((header, index) => (
              <th key={index} className="table-header-cell">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={headers.length} 
                className="table-empty"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr 
                key={index} 
                className="table-row"
              >
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex} className="table-cell">
                    {header.render ? header.render(row[header.field], row) : row[header.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;