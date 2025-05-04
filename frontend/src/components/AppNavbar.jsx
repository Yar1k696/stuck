import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Navbar, Container, Stack, Badge, Button, Modal, Form, Dropdown, Tooltip, OverlayTrigger
} from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCamera, faPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import siteLogo from '../assets/logo.jpg';

import AddTaskModal from './AddTaskModal';
import AddParticipantsModal from './AddParticipantsModal';
import AddProjectModal from './AddProjectModal';

const AppNavbar = ({ currentUser, project, onLogout }) => {
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showParticipantModal, setShowParticipantModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const handleTaskSubmit = (taskData) => {
        setShowTaskModal(false);
    };

    const handleParticipantsSubmit = (selectedParticipants) => {
        setShowParticipantModal(false);
    };

    const handleProjectSubmit = (projectData) => {
        setShowProjectModal(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    function getCSRFToken() {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      return cookieValue;
    }

    const handleUpload = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            try {
                const response = await fetch('http://localhost:8000/api/user/avatar/', {
                  method: 'POST',
                  body: formData,
                  credentials: 'include',
                  headers: {
                    'X-CSRFToken': getCSRFToken(),
                  }
                });

            } catch (error) {
                console.error('Ошибка загрузки аватарки:', error);
            }
        }
        setShowAvatarModal(false);
        setPreview(null);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/logout/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });

            if (response.ok) {
                onLogout();
                navigate('/login');
            } else {
                console.error('Ошибка выхода:', await response.text());
            }
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const isHomepage = location.pathname === '/tasks';
    const isProjectDetailPage = location.pathname.startsWith('/project/') || 
                              location.pathname.startsWith('/projects/');
    const isTaskDetailPage = location.pathname.startsWith('/tasks/');

    const projectId = isProjectDetailPage ? parseInt(location.pathname.split('/')[2]) : null;

    const renderParticipant = (user, index) => (
        <OverlayTrigger
            key={user.id || index}
            placement="bottom"
            overlay={<Tooltip>{user.username || `Участник ${index + 1}`}</Tooltip>}
        >
            <div 
                className="participant-avatar"
                style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    backgroundImage: user.avatar ? `url(${user.avatar})` : `url(https://via.placeholder.com/32)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                {!user.avatar && (user.username?.[0]?.toUpperCase() || `У${index + 1}`)}
            </div>
        </OverlayTrigger>
    );

    return (
        <>
            <Navbar expand="lg" className="bg-dark-blue project-navbar">
                <Container fluid className="px-5">
                    <Navbar.Brand as={Link} to="/tasks" className="d-flex align-items-center me-4">
                        <img
                            src={siteLogo}
                            height="30"
                            className="d-inline-block align-top me-2"
                            alt="Логотип сайту"
                        />
                    </Navbar.Brand>

                    {(isHomepage || isProjectDetailPage || isTaskDetailPage) && (
                        <Dropdown align="end" className="mx-3">
                            <Dropdown.Toggle id="add-dropdown" className="btn-add">
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                Додати...
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {isHomepage && (
                                    <Dropdown.Item onClick={() => setShowProjectModal(true)}>
                                        Додати проект
                                    </Dropdown.Item>
                                )}

                                {isProjectDetailPage && (
                                    <Dropdown.Item onClick={() => setShowTaskModal(true, projectId)}>
                                        Додати задачу
                                    </Dropdown.Item>
                                )}

                                {(isProjectDetailPage || isTaskDetailPage) && (
                                    <>
                                        {isProjectDetailPage && <Dropdown.Divider />}
                                        <Dropdown.Item onClick={() => setShowParticipantModal(true)}>
                                            Додати учасників
                                        </Dropdown.Item>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="justify-content-end"/>

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Stack direction="horizontal" gap={3} className="ms-auto align-items-center">
                            {project && project.members && project.members.length > 0 && (
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon 
                                        icon={faUsers} 
                                        className="text-muted me-2"
                                    />
                                    <Stack direction="horizontal" gap={2}>
                                        {project.members.slice(0, 5).map(renderParticipant)}
                                        {project.members.length > 5 && (
                                            <Badge 
                                                pill 
                                                bg="secondary"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                +{project.members.length - 5}
                                            </Badge>
                                        )}
                                    </Stack>
                                </div>
                            )}

                            <div 
                                className="user-avatar clickable"
                                onClick={() => setShowAvatarModal(true)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundImage: currentUser?.avatar ? `url(${currentUser.avatar})` : undefined,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundColor: '#6c757d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    border: '2px solid #fff'
                                }}
                            >
                                {!currentUser?.avatar && currentUser?.username?.[0]?.toUpperCase()}
                            </div>

                            <Button 
                                variant="outline-light" 
                                size="sm" 
                                onClick={handleLogout}
                                className="ms-2"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                                Вихід
                            </Button>
                        </Stack>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Зміна аватарки</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {preview ? (
                        <div className="mb-4">
                            <img 
                                src={preview} 
                                alt="Предпросмотр" 
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '3px solid #f0f0f0'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div 
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    border: '3px dashed #dee2e6'
                                }}
                            >
                                <FontAwesomeIcon 
                                    icon={faCamera} 
                                    size="3x" 
                                    className="text-secondary"
                                />
                            </div>
                            <p className="mt-3">Виберіть нове зображення</p>
                        </div>
                    )}
                    <Form.Group>
                        <Form.Control 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mb-3"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowAvatarModal(false)}
                        style={{ minWidth: '120px' }}
                    >
                        Скасувати
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpload}
                        disabled={!selectedFile}
                        style={{ minWidth: '120px' }}
                    >
                        Зберегти
                    </Button>
                </Modal.Footer>
            </Modal>

            <AddProjectModal
                show={showProjectModal}
                onHide={() => setShowProjectModal(false)}
                onProjectSubmit={handleProjectSubmit}
            />
            <AddTaskModal
                show={showTaskModal}
                onHide={() => setShowTaskModal(false)}
                onTaskSubmit={handleTaskSubmit}
                projectId={projectId}
            />
            <AddParticipantsModal
                show={showParticipantModal}
                onHide={() => setShowParticipantModal(false)}
                onParticipantsSubmit={handleParticipantsSubmit}
                projectId={projectId}
            />
        </>
    );
};

export default AppNavbar;