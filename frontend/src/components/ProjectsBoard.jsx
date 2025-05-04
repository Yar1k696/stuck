import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Spinner, Alert, Badge
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faUsers, faCalendarAlt, faUser 
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue || '';
}

const csrfToken = getCookie('csrftoken');

const ProjectsBoard = ({ userId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const roleBadgeVariant = {
    'OWNER': 'danger',
    'ADMIN': 'warning',
    'MEMBER': 'primary'
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/projects/?user=${userId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken 
        },
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
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to fetch projects:", e);
      setError(e.message || "Не вдалося завантажити список проектів.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження проектів...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error} 
          <Button variant="link" onClick={fetchProjects}>
            Спробувати ще
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">

      <Row xs={1} md={2} lg={3} className="g-4">
        {projects.map(project => (
          <Col key={project.id}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Card.Title>
                    <Link to={`/project/${project.id}`}>{project.title}</Link>
                  </Card.Title>
                </div>
                
                <Card.Text className="text-muted mb-3">
                  {project.description || 'Без опису'}
                </Card.Text>

                <div className="text-muted small">
                  <div>
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    {formatDate(project.created_at)}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        {projects.length === 0 && (
          <Col>
            <Card>
              <Card.Body className="text-center">
                <Card.Text className="text-muted">
                  У вас ще немає проектів. Створіть перший проект!
                </Card.Text>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/projects/create')}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Створити проект
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ProjectsBoard;