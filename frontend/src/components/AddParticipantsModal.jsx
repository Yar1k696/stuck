import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue || '';
}

const AddParticipantsModal = ({ show, onHide, onParticipantsSubmit, projectId }) => {
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const csrfToken = getCookie('csrftoken');

  useEffect(() => {
    if (show && projectId) {
      const fetchParticipants = async () => {
        setLoadingParticipants(true);
        setParticipantsError(null);

        try {
          const usersResponse = await fetch('http://localhost:8000/api/users/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            },
            credentials: 'include'
          });

          if (!usersResponse.ok) {
            if (usersResponse.status === 403) {
              throw new Error('Доступ заборонено. Перевірте авторизацію.');
            }
            throw new Error(`Не вдалося завантажити список користувачів: ${usersResponse.status}`);
          }

          const usersData = await usersResponse.json();

          // Получаем текущих участников проекта
          const membersResponse = await fetch(`http://localhost:8000/api/projects/${projectId}/members/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            },
            credentials: 'include'
          });

          if (!membersResponse.ok) {
            throw new Error(`Не вдалося завантажити список учасників проекту: ${membersResponse.status}`);
          }

          const membersData = await membersResponse.json();
          const memberUserIds = membersData.map(member => member.user.id);
          const ownerUserIds = membersData
            .filter(member => member.role === 'OWNER')
            .map(member => member.user.id);

          const filteredParticipants = usersData
            .filter(user => !memberUserIds.includes(user.id) && !ownerUserIds.includes(user.id))
            .map(p => ({
              ...p,
              selected: false,
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

  const toggleParticipant = (id) => {
    setParticipants(participants.map(p =>
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleSubmit = async () => {
    const selected = participants.filter(p => p.selected);
    if (selected.length === 0) {
      setSubmitError('Оберіть хоча б одного учасника.');
      return;
    }

    setLoadingSubmit(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const addedParticipants = [];
      for (const participant of selected) {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members/add/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ user: participant.id, role: 'MEMBER' }),
          credentials: 'include'
        });

        const responseData = await response.json();
        if (!response.ok) {
          const errorData = responseData || { error: response.statusText };
          throw new Error(errorData.error || `Не вдалося додати учасника: ${response.status}`);
        }
        addedParticipants.push(responseData);
      }

      setSubmitSuccess(true);
      onParticipantsSubmit(addedParticipants);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (e) {
      console.error('Error adding participants:', e);
      setSubmitError(e.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleClose = () => {
    setParticipants([]);
    setParticipantsError(null);
    setSubmitError(null);
    setSubmitSuccess(false);
    setLoadingSubmit(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Добавить учасників</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {participantsError && <Alert variant="warning">{participantsError}</Alert>}
        {submitError && <Alert variant="danger">{submitError}</Alert>}
        {submitSuccess && <Alert variant="success">Учасники успішно додані!</Alert>}
        <Form>
          {loadingParticipants ? (
            <div className="text-center">
              <Spinner
                animation="border"
                role="status"
                className="me-2"
              />
              Завантаження учасників...
            </div>
          ) : participants.length > 0 ? (
            participants.map(participant => (
              <Form.Check 
                key={participant.id}
                type="checkbox"
                id={`participant-${participant.id}`}
                label={participant.name}
                checked={participant.selected}
                onChange={() => toggleParticipant(participant.id)}
                className="mb-2"
              />
            ))
          ) : (
            <p className="text-muted">Немає доступних учасників для додавання.</p>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loadingParticipants || loadingSubmit}>
          Скасувати
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loadingParticipants || loadingSubmit || participants.length === 0}
        >
          {loadingSubmit ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Додавання...
            </>
          ) : (
            'Додати вибраних'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddParticipantsModal;