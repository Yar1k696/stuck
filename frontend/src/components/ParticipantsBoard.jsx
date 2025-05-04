import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser, faTimes } from '@fortawesome/free-solid-svg-icons';
import AddParticipantsModal from './AddParticipantsModal';

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue || '';
}

const ParticipantsBoard = ({ projectId }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const csrfToken = getCookie('csrftoken');

    const fetchParticipants = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Не вдалося завантажити учасників: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched participants data:', data);
            setParticipants(data);
        } catch (e) {
            console.error('Error fetching participants:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveParticipant = async (memberId) => {
        if (!memberId) {
            setError('Помилка: ID учасника не визначено. Перевірте структуру даних.');
            console.error('Member ID is undefined. Participants data:', participants);
            return;
        }

        if (!csrfToken) {
            setError('Помилка: CSRF-токен не знайдено. Перевірте авторизацію.');
            return;
        }

        if (window.confirm('Ви впевнені, що хочете видалити цього учасника?')) {
            try {
                const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members/remove/${memberId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: response.statusText }));
                    console.error('Error response:', errorData);
                    throw new Error(errorData.error || `Не вдалося видалити учасника: ${response.status}`);
                }

                fetchParticipants();
            } catch (e) {
                console.error('Error removing participant:', e);
                setError(e.message);
            }
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchParticipants();
        }
    }, [projectId]);

    const handleParticipantsSubmit = (selectedParticipants) => {
        fetchParticipants();
    };

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" role="status" />
                <span className="ms-2">Завантаження учасників...</span>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <>
            <Row className="g-3">
                {participants.map((participant, index) => (
                    <Col key={participant.id || participant.user?.id || index} xs={12} sm={6} md={4} lg={3}>
                        <Card className="h-100 shadow-sm" style={{ minHeight: '150px', position: 'relative' }}>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveParticipant(participant.id)}
                                style={{
                                    position: 'absolute',
                                    top: '-7px',
                                    right: '-7px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    zIndex: 1,
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                            <Card.Body className="d-flex flex-column align-items-center text-center">
                                <div
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundImage: participant.user.avatar ? `url(http://localhost:8000/${participant.user.avatar})` : `url(https://via.placeholder.com/50)`,
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
                                        marginBottom: '10px'
                                    }}
                                >
                                    {!participant.user.avatar && (participant.user.username?.[0]?.toUpperCase() || `У${index + 1}`)}
                                </div>
                                <Card.Title style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
                                    {participant.user.first_name || ''} {participant.user.last_name || ''}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                <Col xs={12} sm={6} md={4} lg={3}>
                    <Card 
                        className="h-100 shadow-sm d-flex align-items-center justify-content-center" 
                        style={{ 
                            minHeight: '150px', 
                            backgroundColor: '#f8f9fa', 
                            border: '2px dashed #6c757d',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowModal(true)}
                    >
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUserPlus} size="2x" color="#6c757d" />
                            <Card.Text className="mt-2" style={{ color: '#6c757d' }}>
                                Додати учасника
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <AddParticipantsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onParticipantsSubmit={handleParticipantsSubmit}
                projectId={projectId}
            />
        </>
    );
};

export default ParticipantsBoard;