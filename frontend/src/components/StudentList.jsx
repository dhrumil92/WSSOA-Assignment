import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const StudentList = ({ students, onEdit, onDelete, isLoading, error }) => {
  if (isLoading && students.length === 0) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="error-state">
        <p>Unable to load data. Please try again.</p>
        <p className="error-details">{error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="empty-state">
        <p>No students found. Add a new student to get started!</p>
      </div>
    );
  }

  return (
    <div className="student-grid">
      {students.map((student) => (
        <div key={student.id} className="card student-card">
          <div className="student-card-header">
            <h3 className="student-name">{student.name}</h3>
            <div className="student-actions">
              <button 
                onClick={() => onEdit(student)} 
                className="icon-btn edit-btn"
                title="Edit Student"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => onDelete(student.id)} 
                className="icon-btn delete-btn"
                title="Delete Student"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="student-card-body">
            <p className="student-detail"><strong>Email:</strong> {student.email}</p>
            <p className="student-detail"><strong>Course:</strong> {student.course}</p>
            <p className="student-detail"><strong>Semester:</strong> {student.semester}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentList;
