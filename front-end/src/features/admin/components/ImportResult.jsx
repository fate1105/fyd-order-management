import React from 'react';

/**
 * ImportResult Component
 * Displays import execution results
 */
function ImportResult({ result, onImportMore, onClose }) {
  const hasErrors = result.failureCount > 0;
  const hasSuccess = result.successCount > 0;

  return (
    <div className="import-result">
      {/* Summary Cards */}
      <div className="result-summary">
        <div className="result-card success">
          <div className="result-icon">✅</div>
          <div className="result-content">
            <div className="result-number">{result.successCount}</div>
            <div className="result-label">Products Imported</div>
          </div>
        </div>

        {hasErrors && (
          <div className="result-card error">
            <div className="result-icon">❌</div>
            <div className="result-content">
              <div className="result-number">{result.failureCount}</div>
              <div className="result-label">Failed</div>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {hasSuccess && (
        <div className="result-message success">
          <p>
            <strong>Success!</strong> {result.successCount} product{result.successCount !== 1 ? 's' : ''} 
            {result.successCount !== 1 ? ' have' : ' has'} been imported successfully.
          </p>
        </div>
      )}

      {/* Error Details */}
      {hasErrors && (
        <div className="result-errors">
          <h4>Errors ({result.failureCount}):</h4>
          <div className="error-list">
            {result.errors.map((error, idx) => (
              <div key={idx} className="error-item">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Created Product IDs */}
      {hasSuccess && result.createdProductIds && result.createdProductIds.length > 0 && (
        <div className="result-details">
          <h4>Created Product IDs:</h4>
          <div className="product-ids">
            {result.createdProductIds.map((id, idx) => (
              <span key={idx} className="product-id-badge">#{id}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="result-actions">
        {hasSuccess && (
          <button className="btn-secondary" onClick={onImportMore}>
            Import More Products
          </button>
        )}
        <button className="btn-primary" onClick={onClose}>
          {hasSuccess ? 'Done' : 'Close'}
        </button>
      </div>
    </div>
  );
}

export default ImportResult;
