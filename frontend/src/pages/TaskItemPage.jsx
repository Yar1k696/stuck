import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Badge, Stack, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const TaskItemPage = () => {
  const { pk } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTask = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/edit/${pk}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 403) {
             setError('Доступ заборонено. Будь ласка, увійдіть в систему для перегляду завдання.');
         } else if (response.status === 404) {
             setError(`Завдання з ID ${pk} не знайдено.`);
         }
         else {
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
         }
         setTask(null);
      } else {
         const data = await response.json();
         setTask(data);
         setError(null);
      }

    } catch (e) {
      console.error(`Failed to fetch task ${pk}:`, e);
      setError(e.message || `Не вдалося завантажити дані завдання.`);
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [pk]);

  const handleDeleteTask = async () => {
      if (window.confirm(`Ви впевнені, що хочете видалити завдання "${task?.title || task?.description || 'без назви'}"?`)) {
          try {
              const response = await fetch(`/api/tasks/del/${pk}/`, {
                  method: 'DELETE',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  credentials: 'include',
              });

              if (!response.ok) {
                  const errorText = await response.text();
                   if (response.status === 403) {
                       throw new Error('Доступ заборонено. Увійдіть для видалення завдання.');
                   }
                  throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
              }

              alert('Завдання успішно видалено.');
              navigate('/tasks');

          } catch (e) {
              console.error(`Failed to delete task ${pk}:`, e);
              setError(e.message || 'Не вдалося видалити завдання.');
          }
      }
  };

  const handleEditTask = () => {
      navigate(`/tasks/edit/${pk}`);
  };

  const getStatusVariant = (status) => {
      switch (status) {
          case 'todo': return 'secondary';
          case 'in_progress': return 'primary';
          case 'needs_review': return 'warning';
          case 'done': return 'success';
          default: return 'secondary';
      }
  };

  const getStatusText = (status) => {
       switch (status) {
           case 'todo': return 'Готово до виконання';
           case 'in_progress': return 'В процесі';
           case 'needs_review': return 'Потребує перевірки';
           case 'done': return 'Виконано';
           default: return 'Невідомий статус';
       }
   };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
         <Spinner animation="border" role="status">
           <span className="visually-hidden">Завантаження завдання...</span>
         </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error} <Button variant="link" onClick={fetchTask}>Спробувати ще</Button></Alert>
        <Button variant="secondary" className="mt-3" onClick={() => navigate('/tasks')}>Повернутись до списку завдань</Button>
      </Container>
    );
  }

  if (!task) {
       return (
           <Container className="mt-5">
               <Alert variant="info">Завдання не знайдено або сталася помилка при завантаженні.</Alert>
               <Button variant="secondary" className="mt-3" onClick={() => navigate('/tasks')}>Повернутись до списку завдань</Button>
           </Container>
       );
  }

  return (
    <Container className="mt-4">
      <h1>{task.title || task.description || `Завдання ${task.id}`}</h1>

      <Row className="mt-4">
          <Col md={8}>
              <Card>
                  <Card.Body>
                      <Card.Title>Опис завдання:</Card.Title>
                      <Card.Text>{task.description || 'Без опису'}</Card.Text>

                      <div className="mb-3">
                          <Card.Title className="d-inline-block me-2">Статус:</Card.Title>
                          {task.status && (
                              <Badge bg={getStatusVariant(task.status)} className="fs-6">
                                  {getStatusText(task.status)}
                              </Badge>
                          )}
                      </div>

                       {task.date && (
                           <div className="mb-3 text-muted">
                               <FontAwesomeIcon icon={faFlag} className="me-2" />
                               Дедлайн: {task.date}
                           </div>
                       )}
                  </Card.Body>
              </Card>
          </Col>

          <Col md={4}>
              <Card>
                  <Card.Body>
                      <Card.Title>Дії:</Card.Title>
                      <Button variant="primary" className="w-100 mb-2" onClick={handleEditTask}>
                           <FontAwesomeIcon icon={faEdit} className="me-2" /> Редагувати завдання
                      </Button>

                      <Button variant="danger" className="w-100" onClick={handleDeleteTask}>
                           <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> Видалити завдання
                      </Button>
                  </Card.Body>
              </Card>
          </Col>
      </Row>
    </Container>
  );
};

export default TaskItemPage;