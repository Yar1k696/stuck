import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faUser, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import AddTaskModal from '../components/AddTaskModal';
import TasksBoard from '../components/TasksBoard';
import ParticipantsBoard from '../components/ParticipantsBoard';

const ProjectItemPage = () => {
    const [showModal, setShowModal] = useState(false);
    const { pk } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const projectId = parseInt(pk, 10);

    const formatUkrainianDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'Невідома дата';
        try {
            const date = new Date(dateTimeString);
            const options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            return new Intl.DateTimeFormat('uk-UA', options).format(date);
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'Невірний формат дати';
        }
    };

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
                const errorText = await response.text();
                if (response.status === 403) {
                    setError('Доступ заборонено. Будь ласка, увійдіть в систему.');
                } else if (response.status === 404) {
                    setError(`Проект з ID ${pk} не знайдено.`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
                setProject(null);
            } else {
                const data = await response.json();
                setProject(data);
                setError(null);
            }
        } catch (e) {
            console.error(`Failed to fetch project ${pk}:`, e);
            setError(e.message || `Не вдалося завантажити дані проекту.`);
            setProject(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tasks/by-project/${pk}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const normalizedTasks = data.map(task => ({
                ...task,
                status: task.status.toLowerCase()
            }));
            setTasks(normalizedTasks);
        } catch (e) {
            console.error(`Failed to fetch tasks for project ${pk}:`, e);
            setError(e.message || 'Не вдалося завантажити завдання.');
        }
    };

    useEffect(() => {
        fetchProject();
        fetchTasks();
    }, [pk]);

    const handleDeleteProject = async () => {
        if (window.confirm(`Ви впевнені, що хочете видалити проект "${project?.title || 'без назви'}"?`)) {
            try {
                const response = await fetch(`/api/projects/del/${pk}/`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 403) {
                        throw new Error('Доступ заборонено. Увійдіть для видалення проекту.');
                    }
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }

                alert('Проект успішно видалено.');
                navigate('/projects');
            } catch (e) {
                console.error(`Failed to delete project ${pk}:`, e);
                setError(e.message || 'Не вдалося видалити проект.');
            }
        }
    };

    const handleTaskAdded = (newTask) => {
        const normalizedTask = {
            ...newTask,
            status: newTask.status.toLowerCase()
        };
        setTasks(prevTasks => [...prevTasks, normalizedTask]);
        setShowModal(false);
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Завантаження проекту...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error} <Button variant="link" onClick={fetchProject}>Спробувати ще</Button></Alert>
                <Button variant="secondary" className="mt-3" onClick={() => navigate('/projects')}>
                    Повернутись до списку проектів
                </Button>
            </Container>
        );
    }

    if (!project) {
        return (
            <Container className="mt-5">
                <Alert variant="info">Проект не знайдено або сталася помилка при завантаженні.</Alert>
                <Button variant="secondary" className="mt-3" onClick={() => navigate('/projects')}>
                    Повернутись до списку проектів
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h1>{project.title || `Проект ${project.id}`}</h1>
            <Row className="mt-4">
                <Col md={10}>
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Card.Title>Опис проекту:</Card.Title>
                                    <Card.Text>{project.description || 'Без опису'}</Card.Text>
                                    {project.created_by && (
                                        <div className="mb-3">
                                            <Card.Title className="d-inline-block me-2">Створив:</Card.Title>
                                            <FontAwesomeIcon icon={faUser} className="me-1" />
                                            <span>{project.created_by.username || 'Невідомий користувач'}</span>
                                        </div>
                                    )}
                                    {project.created_at && (
                                        <div className="mb-3 text-muted">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                            Створено: {formatUkrainianDateTime(project.created_at)}
                                        </div>
                                    )}
                                    {project.updated_at && (
                                        <div className="mb-3 text-muted">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                            Оновлено: {formatUkrainianDateTime(project.updated_at)}
                                        </div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Card.Title>Учасники:</Card.Title>
                                    <ParticipantsBoard projectId={projectId} />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Дії:</Card.Title>
                            <Button variant="primary" className="w-100 mb-2" onClick={() => navigate(`/projects/edit/${pk}`)}>
                                <FontAwesomeIcon icon={faEdit} className="me-2" /> Редагувати
                            </Button>
                            <Button variant="danger" className="w-100" onClick={handleDeleteProject}>
                                <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> Видалити
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <div className="mt-5">
                <h4 className="text-center">Завдання проекту</h4>
                <TasksBoard projectId={projectId} tasks={tasks} />
            </div>

            <AddTaskModal
                show={showModal}
                onHide={() => setShowModal(false)}
                projectId={pk}
                onTaskSubmit={handleTaskAdded}
            />
        </Container>
    );
};

export default ProjectItemPage;