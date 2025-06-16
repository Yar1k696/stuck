import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import TasksBoard from '../components/TasksBoard';
import ProjectsBoard from '../components/ProjectsBoard';

const TaskList = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUserId = localStorage.getItem('userId') || 1;
    setUserId(currentUserId);
  }, []);

  return (
    <Container className="mt-4">
      <h1>Ваши проекти</h1>
      <ProjectsBoard userId={userId}/>

      <h1>Ваши завдання</h1>
      <TasksBoard userId={userId} />
    </Container>
  );
};

export default TaskList;