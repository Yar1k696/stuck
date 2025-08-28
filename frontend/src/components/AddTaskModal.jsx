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
    assigned_to: '', // Основной участник
  });
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]); // Дополнительные участники
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const csrfToken = getCookie('csrftoken');

  // Сброс состояния success при открытии модального окна
  useEffect(() => {
    if (show) {
      setSuccess(false); // Сбрасываем успех при каждом открытии
    }
  }, [show]);

  useEffect(() => {
    if (show && projectId) {
      const fetchParticipants = async () => {
        setLoadingParticipants(true);
        setParticipantsError(null);

        try {
          const response = await fetch('/api/users/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            },
            credentials: 'include'
          });

          if (!response.ok) {
            if (response.status === 403) {
              throw new Error('Доступ заборонено. Перевірте авторизацію.');
            }
            throw new Error(`Не вдалося завантажити список користувачів: ${response.status}`);
          }

          const data = await response.json();
          const filteredParticipants = data.map(p => ({
            ...p,
            name: `${p.first_name || ''} ${p.last_name || ''} (${p.username})`.trim()
          }));
          setParticipants(filteredParticipants);
        } catch (e) {
          console.error('Error fetching participants:', e);
          setParticipantsError(e.message);
        } finally {
          setLoadingParticipants(false);
        }
      };

      fetchParticipants();
    }
  }, [show, projectId, csrfToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleParticipantSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    if (!taskData.assigned_to) {
      // Если основного участника нет, устанавливаем его
      setTaskData(prev => ({ ...prev, assigned_to: selectedId }));
    } else if (!selectedParticipants.includes(selectedId) && selectedId !== taskData.assigned_to) {
      // Добавляем как дополнительного участника
      setSelectedParticipants(prev => [...prev, selectedId]);
    }
    // Сброс селекта после выбора
    e.target.value = '';
  };

  const removeParticipant = (id) => {
    setSelectedParticipants(prev => prev.filter(p => p !== id));
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
    };

    if (!dataToSubmit.description) {
      setError('Опис задачі є обов\'язковим.');
      setLoading(false);
      return;
    }
    if (!dataToSubmit.project) {
      setError('Помилка: Задача повинна бути прив\'язана до проекту.');
      setLoading(false);
      return;
    }
    if (!dataToSubmit.assigned_to) {
      setError('Необхідно призначити основного учасника.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks/add/', {
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

      // Отправка дополнительных участников
      for (const userId of selectedParticipants) {
        await fetch(`/api/projects/${projectId}/members/add/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ user: userId, role: 'MEMBER' }),
          credentials: 'include'
        });
      }

      setSuccess(true);

      if (onTaskSubmit) {
        onTaskSubmit(newTask);
      }

      setTaskData({ description: '', assigned_to: '' });
      setSelectedParticipants([]);
      setTimeout(() => {
        onHide(); // Закрытие модального окна после успеха
      }, 1500);
    } catch (e) {
      console.error('Error adding task:', e);
      setError(e.message || 'Не вдалося створити задачу. Спробуйте ще.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTaskData({ description: '', assigned_to: '' });
    setError(null);
    setSuccess(false); // Сброс состояния success при закрытии
    setLoading(false);
    setParticipants([]);
    setParticipantsError(null);
    setSelectedParticipants([]);
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
            <Form.Label>Оберіть виконавця</Form.Label>
            <Form.Select
              name="assigned_to"
              value=""
              onChange={handleParticipantSelect}
              disabled={loading || loadingParticipants}
            >
              <option value="">Оберіть виконавця</option>
              {loadingParticipants ? (
                <option disabled>Завантаження...</option>
              ) : (
                participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </Form.Select>
            
            {selectedParticipants.length > 0 && (
              <div className="mt-2">
                <Form.Label>Додаткові учасники:</Form.Label>
                {selectedParticipants.map(id => {
                  const participant = participants.find(p => p.id === id);
                  return participant ? (
                    <div key={id} className="d-flex align-items-center mb-1">
                      <span className="me-2">{participant.name}</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeParticipant(id)}
                        disabled={loading}
                      >
                        Видалити
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
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