import React, { useState } from 'react';
import { useToast } from "@shared/context/ToastContext";

/**
 * FileDropzone Component
 * Drag-and-drop file upload area
 */
function FileDropzone({ onFileSelect, selectedFile }) {
  const [dragActive, setDragActive] = useState(false);
  const { showToast } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      } else {
        showToast('Please select a valid Excel file (.xlsx or .xls) under 5MB', "error");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      } else {
        showToast('Please select a valid Excel file (.xlsx or .xls) under 5MB', "error");
      }
    }
  };

  const isValidFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  return (
    <div
      className={`dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        accept=".xlsx,.xls"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <label htmlFor="file-upload" className="dropzone-label">
        {selectedFile ? (
          <>
            <div className="dropzone-icon">✓</div>
            <p className="dropzone-text">File selected: {selectedFile.name}</p>
            <p className="dropzone-hint">Click or drag to replace</p>
          </>
        ) : (
          <>
            <div className="dropzone-icon">📁</div>
            <p className="dropzone-text">Drag and drop your Excel file here</p>
            <p className="dropzone-hint">or click to browse</p>
            <p className="dropzone-requirements">Accepts .xlsx, .xls files (max 5MB)</p>
          </>
        )}
      </label>
    </div>
  );
}

export default FileDropzone;
