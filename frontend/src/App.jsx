import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import { API_BASE_URL } from './config';
import './index.css';

function App() {
  const [students, setStudents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEditingStudent, setCurrentEditingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/students`);
      setStudents(response.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddNew = () => {
    setCurrentEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (student) => {
    setCurrentEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`${API_BASE_URL}/students/${id}`);
        fetchStudents(); // Refresh the list
      } catch (err) {
        if (err.response && err.response.status === 404) {
            alert("Student not found.");
        } else {
            alert("Failed to delete student. Please try again.");
        }
      }
    }
  };

  const handleFormSave = () => {
    setIsFormOpen(false);
    fetchStudents();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Student Management System</h1>
          <button className="btn btn-primary btn-icon" onClick={handleAddNew}>
            <Plus size={20} />
            <span>Add Student</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        {isFormOpen ? (
          <div className="form-container">
            <StudentForm 
              currentStudent={currentEditingStudent}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <StudentList 
            students={students}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

export default App;
