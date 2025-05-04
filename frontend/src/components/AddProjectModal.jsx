import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert, Container } from 'react-bootstrap';

const AddProjectModal = ({ show, onHide, onProjectSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const csrfToken = getCookie('csrftoken');

  function getCookie(name) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
    return cookieValue || '';
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:8000/api/projects/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));

        let errorMessage = `Failed to add project: ${response.status}`;
        if (typeof errorData === 'object') {
             errorMessage = Object.entries(errorData)
                 .map(([key, value]) => {
                     const fieldName = {
                         name: 'Назва проекту',
                         description: 'Опис',
                         detail: 'Помилка'
                     }[key] || key;
                     return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                 })
                 .join('; ');
         } else if (errorData.detail) {
             errorMessage = `Помилка: ${errorData.detail}`;
         } else {
             errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
         }

        throw new Error(errorMessage);
      }

      const newProject = await response.json();
      console.log('Project added successfully:', newProject);

      setSuccess(true);

      if (onProjectSubmit) {
        onProjectSubmit(newProject);
      }

      setFormData({ name: '', description: '' });

      setTimeout(() => {
        onHide();
      }, 1500);

    } catch (e) {
      console.error("Error adding project:", e);
      setError(e.message || 'Не вдалося додати проект. Спробуйте ще.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
      setFormData({ name: '', description: '' });
      setError(null);
      setSuccess(false);
      setLoading(false);
      onHide();
  };


  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Додати новий проект</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Проект успішно додано!</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="addProjectName">
            <Form.Label>Назва проекту</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="addProjectDescription">
            <Form.Label>Опис</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
            />
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Скасувати
        </Button>

        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-1"
            />
          ) : (
            'Зберегти проект'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProjectModal;