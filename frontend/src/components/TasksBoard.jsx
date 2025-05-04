import React, { useState, useEffect } from 'react';
import { 
  Spinner, Alert, Container, Row, Col, Card, Stack, Button,
  Dropdown, Modal, Form
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFlag, faTrashAlt, faExchangeAlt 
} from '@fortawesome/free-solid-svg-icons';

function getCookie(name) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
    return cookieValue || '';
}

const csrfToken = getCookie('csrftoken'); 

const TaskActionsDropdown = ({ task, currentStatus, onStatusChange, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);

  const statusOptions = {
    'TODO': 'Готові до виконання',
    'IN_PROGRESS': 'В процесі',
    'NEEDS_REVIEW': 'Потребують перевірки',
    'DONE': 'Виконано'
  };
 
  const availableStatuses = Object.keys(statusOptions)
    .filter(status => status !== currentStatus)
    .map(status => ({
      value: status,
      label: statusOptions[status]
    }));

  const handleStatusUpdate = () => {
    onStatusChange(task.id, newStatus);
    setShowStatusModal(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle 
          variant="link" 
          className="p-0 text-dark task-action-toggle" 
          style={{ fontSize: '24px' }}
        >
          …
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {availableStatuses.length > 0 && (
            <Dropdown.Item onClick={() => setShowStatusModal(true)}>
              <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
              Перенести в...
            </Dropdown.Item>
          )}

          <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
            <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
            Видалити
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Змінити статус завдання</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Новий статус:</Form.Label>
            <Form.Control
              as="select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {availableStatuses.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Зберегти
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Підтвердження видалення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ви впевнені, що хочете видалити це завдання?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Видалити
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const TaskColumn = ({ title, tasks, status, onStatusChange, onDelete }) => {

  const headerClass = {
    'TODO': 'to-do',
    'IN_PROGRESS': 'in-progress',
    'NEEDS_REVIEW': 'review',
    'DONE': 'done',
  }[status] || '';

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <Card className={`project-column mb-3 task-column-${status.toLowerCase()}`}>
      <Card.Header className={`project-column-heading d-flex justify-content-between align-items-center ${headerClass}`}>
        <h5 className="text-center mb-0">{title}</h5>
      </Card.Header>
      <Card.Body className="p-2">
        {safeTasks.map((task) => (
          <Card key={task.id} className="task mb-3">
            <Card.Body>
              <div className="d-flex justify-content-end mb-2" style={{ marginTop: '-10px' }}>
                <TaskActionsDropdown 
                  task={task}
                  currentStatus={status}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              </div>
              <p className="mb-3 task-description">{task.description || 'Без опису'}</p>
              {task.due_date && (
                <Stack direction="horizontal" gap={3} className="task-stats">
                  <small>
                    <FontAwesomeIcon icon={faFlag} className="me-1" />
                    {new Date(task.due_date).toLocaleDateString('uk-UA')}
                  </small>
                </Stack>
              )}
            </Card.Body>
          </Card>
        ))}
        {safeTasks.length === 0 && <p className="text-muted text-center task-empty">Немає завдань у цій колонці.</p>}
      </Card.Body>
    </Card>
  );
};

const TasksBoard = ({ projectId, userId }) => {
  const [allTasks, setAllTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusColumnMap = {
    'TODO': 'Готові до виконання',
    'IN_PROGRESS': 'В процесі',
    'NEEDS_REVIEW': 'Потребують перевірки',
    'DONE': 'Виконано',
  };

  const columnOrder = Object.entries(statusColumnMap);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (projectId) {
        url = `http://localhost:8000/api/tasks/by-project/${projectId}/`;
      } else {
        url = 'http://localhost:8000/api/tasks/';
        if (userId) {
          url += `?user=${userId}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 403) {
          setError('Доступ заборонено. Будь ласка, увійдіть в систему.');
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      } else {
        const data = await response.json();
        setAllTasks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
      setError(e.message || "Не вдалося завантажити список завдань.");
      setAllTasks([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tasks/edit/${taskId}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Не вдалося оновити статус завдання');
      }

      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert(error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tasks/del/${taskId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Не вдалося видалити завдання');
      }

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, userId]);

  useEffect(() => {
    if (allTasks && Array.isArray(allTasks)) {
      const tasksByStatus = {
        'TODO': [],
        'IN_PROGRESS': [],
        'NEEDS_REVIEW': [],
        'DONE': []
      };
  
      allTasks.forEach(task => {
        const status = task.status in statusColumnMap ? task.status : 'TODO';
        if (tasksByStatus[status]) {
          tasksByStatus[status].push(task);
        }
      });
      
      setGroupedTasks(tasksByStatus);
    } else {
      setGroupedTasks({
        'TODO': [],
        'IN_PROGRESS': [],
        'NEEDS_REVIEW': [],
        'DONE': []
      });
    }
  }, [allTasks]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5 task-board-loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження завдань...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 task-board-error">
        <Alert variant="danger">{error} <Button variant="link" onClick={fetchTasks}>Спробувати ще</Button></Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="project-tasks mt-4 task-board">
      <Row xs={1} md={2} lg={4} className="g-4">
        {columnOrder.map(([status, title]) => (
          <Col key={status}>
            <TaskColumn
              title={title}
              tasks={groupedTasks[status] || []}
              status={status}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TasksBoard;