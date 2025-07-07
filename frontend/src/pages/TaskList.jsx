import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import TasksBoard from '../components/TasksBoard';
import ProjectsBoard from '../components/ProjectsBoard';

function getCookie(name) {
  const cookieString = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));
  if (!cookieString) return null;
  const value = cookieString.split('=')[1];
  return value || null;
}

const csrfToken = getCookie('csrftoken');

const TaskList = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8000/api/user/me/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Не вдалося отримати дані користувача');
        }
        const data = await response.json();
        setUserId(data.user.id);
      } catch (e) {
        console.error('Error fetching current user:', e);
        setError('Не вдалося отримати дані користувача');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1>Ваши проекти</h1>
      <ProjectsBoard userId={userId} />

      <h1>Ваши завдання</h1>
      <TasksBoard userId={userId} />
    </Container>
  );
};

export default TaskList;