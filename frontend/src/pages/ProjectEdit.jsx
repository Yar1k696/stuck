import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue || '';
}

const ProjectEdit = () => {
  const { pk } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const csrfToken = getCookie('csrftoken');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${pk}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Не вдалося завантажити проект: ${response.status}`);
        }

        const data = await response.json();
        setFormData({
          title: data.title || '',
          description: data.description || '',
        });
      } catch (e) {
        console.error('Error fetching project:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (pk) {
      fetchProject();
    }
  }, [pk]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/projects/edit/${pk}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Не вдалося оновити проект: ${response.status}`);
      }

      navigate('/tasks');
    } catch (e) {
      console.error('Error updating project:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Завантаження...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1>Редагувати проект</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="editProjectTitle">
          <Form.Label>Назва проекту</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="editProjectDescription">
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

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Збереження...' : 'Зберегти зміни'}
        </Button>
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate('/projects')}
          disabled={loading}
        >
          Скасувати
        </Button>
      </Form>
    </Container>
  );
};

export default ProjectEdit;