import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue || '';
}

const AddTaskModal = ({ show, onHide, onTaskSubmit, projectId }) => {
  const [taskData, setTaskData] = useState({
    description: '',
    assigned_to: '',
    due_date: ''
  });

  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const csrfToken = getCookie('csrftoken');

  useEffect(() => {
    if (show) {
      const fetchParticipants = async () => {
        setLoadingParticipants(true);
        setParticipantsError(null);

        console.log('CSRF Token:', csrfToken);
        console.log('document.cookie:', document.cookie);

        try {
          const response = await fetch('http://127.0.0.1:8000/api/users/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            },
            credentials: 'include'
          });

          console.log('Response status:', response.status);
          console.log('Response headers:', response.headers);
          const text = await response.text();
          console.log('Response text:', text);

          if (!response.ok) {
            if (response.status === 403) {
              throw new Error('Доступ заборонено. Перевірте авторизацію. Деталі: ' + text);
            }
            throw new Error(`Не вдалося завантажити список користувачів: ${response.status} - ${text}`);
          }

          const data = JSON.parse(text);
          setParticipants(data);
        } catch (e) {
          console.error('Error fetching participants:', e);
          setParticipantsError(e.message);
        } finally {
          setLoadingParticipants(false);
        }
      };

      fetchParticipants();
    }
  }, [show, csrfToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const dataToSubmit = {
      description: taskData.description,
      assigned_to: taskData.assigned_to || null,
      project: projectId,
      due_date: taskData.due_date || null
    };

    if (!dataToSubmit.description) {
      setError("Опис задачі є обов'язковим.");
      setLoading(false);
      return;
    }
    if (!dataToSubmit.project) {
      setError('Помилка: Задача повинна бути прив’язана до проекту.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/tasks/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(dataToSubmit),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        let errorMessage = `Не вдалося створити задачу: ${response.status}`;
        if (typeof errorData === 'object') {
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => {
              const fieldName = {
                description: 'Опис',
                project: 'Проект',
                assigned_to: 'Призначено на',
                due_date: 'Дедлайн',
                detail: 'Помилка'
              }[key] || key;
              return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
            })
            .join('; ');
        } else if (errorData.detail) {
          errorMessage = `Помилка: ${errorData.detail}`;
        }
        throw new Error(errorMessage);
      }

      const newTask = await response.json();
      console.log('Задача успішно створена:', newTask);
      setSuccess(true);

      if (onTaskSubmit) {
        onTaskSubmit(newTask);
      }

      setTaskData({ description: '', assigned_to: '', due_date: '' });
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (e) {
      console.error('Error adding task:', e);
      setError(e.message || 'Не вдалося створити задачу. Спробуйте ще.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTaskData({ description: '', assigned_to: '', due_date: '' });
    setError(null);
    setSuccess(false);
    setLoading(false);
    setParticipants([]);
    setParticipantsError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Додати нову задачу</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Задача успішно створена!</Alert>}
          {participantsError && <Alert variant="warning">{participantsError}</Alert>}

          <Form.Group className="mb-3" controlId="addTaskDescription">
            <Form.Label>Опис</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              rows={3}
              required
              value={taskData.description}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="addTaskAssignee">
            <Form.Label>Призначити на</Form.Label>
            <Form.Select
              name="assigned_to"
              value={taskData.assigned_to}
              onChange={handleInputChange}
              disabled={loading || loadingParticipants}
            >
              <option value="">Оберіть учасника</option>
              {loadingParticipants ? (
                <option disabled>Завантаження...</option>
              ) : (
                participants.length > 0 &&
                participants.map(p => (
                  <option key={p.id} value={p.id}>{`${p.first_name} ${p.last_name} (${p.username})`}</option>
                ))
              )}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Скасувати
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
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
              'Створити задачу'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;