import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const StudentForm = ({ currentStudent, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    semester: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentStudent) {
      setFormData({
        name: currentStudent.name,
        email: currentStudent.email,
        course: currentStudent.course,
        semester: currentStudent.semester
      });
    } else {
      setFormData({
        name: '',
        email: '',
        course: '',
        semester: ''
      });
    }
  }, [currentStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear errors when typing
  };

  const validate = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) return "Valid email is required.";
    if (!formData.course.trim()) return "Course is required.";
    if (!formData.semester || Number(formData.semester) <= 0) return "Semester must be a positive number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (currentStudent && currentStudent.id) {
        // Edit
        await axios.put(`${API_BASE_URL}/students/${currentStudent.id}`, formData);
      } else {
        // Create
        await axios.post(`${API_BASE_URL}/students`, formData);
      }
      onSave(); // Refresh list and close form
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Extract validation errors from backend
        if (err.response.data.errors) {
            const firstErrorKey = Object.keys(err.response.data.errors)[0];
            setError(err.response.data.errors[firstErrorKey]);
        } else {
            setError(err.response.data.message || 'Validation failed.');
        }
      } else if (err.response && err.response.status === 404) {
          setError('Student not found.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card form-card">
      <h2 className="card-title">{currentStudent ? 'Edit Student' : 'Add New Student'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="course">Course</label>
          <input
            type="text"
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="Computer Science"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="semester">Semester</label>
          <input
            type="number"
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="5"
            min="1"
            disabled={isLoading}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
