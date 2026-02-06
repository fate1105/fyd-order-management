import React from 'react';

/**
 * PreviewTable Component
 * Displays Excel data with validation results
 */
function PreviewTable({ rows, validationResults }) {
  const getValidationForRow = (rowNumber) => {
    return validationResults.find(v => v.rowNumber === rowNumber);
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="preview-table-container">
      <table className="preview-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Base Price</th>
            <th>Sale Price</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const validation = getValidationForRow(row.rowNumber);
            const hasError = validation && !validation.valid;

            return (
              <tr key={idx} className={hasError ? 'error-row' : 'valid-row'}>
                <td>{row.rowNumber}</td>
                <td className="status-cell">
                  {hasError ? (
                    <span 
                      className="status-icon error" 
                      title={validation.errors.join('\n')}
                    >
                      ❌
                    </span>
                  ) : (
                    <span className="status-icon success">✅</span>
                  )}
                </td>
                <td>{row.sku || '-'}</td>
                <td>{row.name || '-'}</td>
                <td>{row.category || '-'}</td>
                <td>{row.brand || '-'}</td>
                <td>{formatPrice(row.basePrice)}</td>
                <td>{formatPrice(row.salePrice)}</td>
                <td>{row.initialStock !== null ? row.initialStock : '-'}</td>
                <td>
                  <span className={`badge ${row.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>
                    {row.status || 'ACTIVE'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Error Details */}
      {validationResults.some(v => !v.valid) && (
        <div className="error-details">
          <h4>Validation Errors:</h4>
          <ul>
            {validationResults
              .filter(v => !v.valid)
              .map((v, idx) => (
                <li key={idx}>
                  <strong>Row {v.rowNumber}:</strong> {v.errors.join(', ')}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PreviewTable;
