import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useTaskContext } from '../TaskContext';

const ExecutorsBoard = ({ project, tasks }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executors, setExecutors] = useState([]);
  const { taskAction, setTaskAction, setExecutors: setContextExecutors } = useTaskContext();

  useEffect(() => {
    const fetchExecutors = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://localhost:8000/api/projects/${project.id}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Не вдалося завантажити виконавців');
        const data = await response.json();
        const enrichedExecutors = data.executors.map(user => ({
          ...user,
          displayName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || `User_${user.id}`
        }));
        setExecutors(enrichedExecutors);
        setContextExecutors(enrichedExecutors);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (project?.id) {
      fetchExecutors();
    }
  }, [project, setContextExecutors]);

  useEffect(() => {
    const updateExecutors = async () => {
      if (taskAction) {
        const { type, taskId, assignedTo } = taskAction;

        if (project?.id) {
          setLoading(true);
          try {
            const response = await fetch(`https://localhost:8000/api/projects/${project.id}/`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            if (!response.ok) throw new Error('Не вдалося оновити виконавців');
            const data = await response.json();
            const enrichedExecutors = data.executors.map(user => ({
              ...user,
              displayName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || `User_${user.id}`
            }));
            setExecutors(enrichedExecutors);
            setContextExecutors(enrichedExecutors);
          } catch (e) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        }
        setTaskAction(null);
      }
    };

    updateExecutors();
  }, [taskAction, project, setContextExecutors]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Завантаження виконавців...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <Row className="g-3">
        {executors.length > 0 ? (
          executors.map((user, index) => (
            <Col key={user.id || index} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 shadow-sm" style={{ minHeight: '150px', position: 'relative' }}>
                <Card.Body className="d-flex flex-column align-items-center text-center">
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      marginBottom: '10px',
                    }}
                  >
                    {!user.avatar && (user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || `У${index + 1}`)}
                  </div>
                  <Card.Title style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
                    {user.displayName}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Card>
              <Card.Body className="text-center">
                <Card.Text className="text-muted">
                  Немає призначених виконавців.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
};

export default ExecutorsBoard;