import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import loginImage from '../assets/bg.webp';
import AddProjectModal from '../components/AddProjectModal';
import { useTaskContext } from '../TaskContext';

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue || '';
}

const IndexPage = ({ onLoginSuccess }) => {
  const { refreshProjects } = useTaskContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const csrfToken = getCookie('csrftoken');

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/user/me/', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const fetchProjects = async () => {
    if (!currentUser) return;
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/projects/?user=${currentUser.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (e) {
      setProjectsError(e.message || 'Не вдалося завантажити список проектів.');
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser, refreshProjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Невідома помилка сервера' }));
        throw new Error(errorData.detail || errorData.message || 'Не вдалося увійти');
      }

      const data = await response.json();
      await fetchCurrentUser();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (e) {
      setError(e.message || 'Не вдалося увійти. Перевірте дані.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setShowProjectModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="g-0 h-100">
        <Col
          md={6}
          className="d-md-flex h-100 align-items-center justify-content-center"
          style={{
            background: `url(${loginImage}) no-repeat center center`,
            backgroundSize: 'cover',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              color: '#fff',
              background: 'rgb(72 120 157)',
              maxWidth: '480px',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <h1>Липучка. Зручний менеджер завдань</h1>
            <br />
            <h2>Липучка: Де кожна замітка має своє місце.</h2>
          </div>
        </Col>

        <Col md={6} className="d-flex align-items-center justify-content-center p-4">
          <div style={{ maxWidth: '400px', width: '100%' }}>
            {currentUser ? (
              <div>
                <h2 className="text-center mb-4">Ваші проекти</h2>
                <Button
                  variant="primary"
                  className="mb-3"
                  onClick={() => setShowProjectModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Додати проект
                </Button>
                <AddProjectModal
                  show={showProjectModal}
                  onHide={() => setShowProjectModal(false)}
                  onProjectSubmit={handleProjectSubmit}
                />
                {projectsLoading && (
                  <Container className="d-flex justify-content-center mt-3">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Завантаження проектів...</span>
                    </Spinner>
                  </Container>
                )}
                {projectsError && (
                  <Alert variant="danger">
                    {projectsError}
                    <Button variant="link" onClick={fetchProjects}>
                      Спробувати ще
                    </Button>
                  </Alert>
                )}
                {!projectsLoading && !projectsError && projects.length === 0 && (
                  <Card className="shadow-sm">
                    <Card.Body className="text-center">
                      <Card.Text className="text-muted">
                        У вас ще немає проектів. Створіть перший проект!
                      </Card.Text>
                    </Card.Body>
                  </Card>
                )}
                {!projectsLoading && !projectsError && projects.length > 0 && (
                  <Row xs={1} md={2} className="g-4">
                    {projects.map(project => (
                      <Col key={project.id}>
                        <Card className="h-100">
                          <Card.Body>
                            <Card.Title>
                              <Link to={`/project/${project.id}`}>{project.title}</Link>
                            </Card.Title>
                            <Card.Text className="text-muted">
                              {project.description || 'Без опису'}
                            </Card.Text>
                            <div className="text-muted small">
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                              {formatDate(project.created_at)}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ) : (
              <Card className="shadow-sm">
                <Card.Body>
                  <h2 className="text-center mb-4">Вхід</h2>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="loginEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="loginPassword">
                      <Form.Label>Пароль</Form.Label>
                      <Form.Control
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </Form.Group>
                    <Button
                      disabled={loading}
                      className="w-100 mb-3"
                      type="submit"
                      variant="primary"
                    >
                      {loading ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        'Увійти'
                      )}
                    </Button>
                  </Form>
                  <div className="text-center mt-2">
                    Ще не маєте акаунту? <Link to="/register">Зареєструватися</Link>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default IndexPage;