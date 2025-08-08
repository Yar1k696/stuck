import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import AddParticipantsModal from './AddParticipantsModal';
import { useTaskContext } from '../TaskContext';

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
  const { showParticipantModal, setShowParticipantModal, refreshParticipants } = useTaskContext();
  const csrfToken = getCookie('csrftoken');

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/members/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Не вдалося завантажити учасників: ${response.status}`);
      }

      const data = await response.json();
      setParticipants(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (memberId) => {
    if (!memberId) {
      setError('Помилка: ID учасника не визначено.');
      return;
    }

    if (!csrfToken) {
      setError('Помилка: CSRF-токен не знайдено.');
      return;
    }

    if (window.confirm('Ви впевнені, що хочете видалити цього учасника?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}/members/remove/${memberId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || `Не вдалося видалити учасника: ${response.status}`);
        }

        fetchParticipants();
      } catch (e) {
        setError(e.message);
      }
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchParticipants();
    }
  }, [projectId, refreshParticipants]);

  const handleParticipantsSubmit = () => {
    fetchParticipants();
  };

  const handleAddParticipant = () => {
    if (setShowParticipantModal) {
      setShowParticipantModal(true);
    } else {
      console.error('setShowParticipantModal is not available in context');
    }
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
        {participants.map((participant, index) => {
          const user = participant.user || {};
          let avatarUrl = user.avatar_url || 'https://via.placeholder.com/50';
          if (avatarUrl.startsWith('http://')) {
            avatarUrl = avatarUrl.replace('http://', 'https://');
          }

          return (
            <Col key={participant.id || user.id || index} xs={12} sm={6} md={4} lg={3}>
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
                      backgroundImage: `url(${avatarUrl})`,
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
                    {!user.avatar_url &&
                      (user.username?.[0]?.toUpperCase() || `У${index + 1}`)}
                  </div>
                  <Card.Title style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
                    {user.first_name || user.username || ''} {user.last_name || ''}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <AddParticipantsModal
        show={showParticipantModal}
        onHide={() => setShowParticipantModal(false)}
        onParticipantsSubmit={handleParticipantsSubmit}
        projectId={projectId}
      />
    </>
  );
};

export default ParticipantsBoard;
