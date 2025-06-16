// TaskItemPage.jsx
import React, { useState, useEffect } from 'react';
// Import necessary React and React-Bootstrap components
import { useParams, useNavigate } from 'react-router-dom'; // useParams to get PK from URL, useNavigate for navigation
import { Container, Spinner, Alert, Card, Badge, Stack, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Added icons for edit/delete

// Define the TaskItemPage functional component
const TaskItemPage = () => {
  // Get the task primary key (pk) from the URL parameters
  const { pk } = useParams();
  // Hook for navigation
  const navigate = useNavigate();

  // State to store the task data
  const [task, setTask] = useState(null);
  // State to manage loading state
  const [loading, setLoading] = useState(true);
  // State to manage error messages
  const [error, setError] = useState(null);

  // Function to fetch task data from the API
  const fetchTask = async () => {
    setLoading(true); // Start loading
    setError(null);   // Clear previous errors

    try {
      // ### API Call to fetch task details ###
      // Use the relative URL for fetching a specific task by its PK
      // Your API route for editing also serves as the detail view (GET method)
      const response = await fetch(`/api/tasks/edit/${pk}/`, {
        method: 'GET', // Use GET method to retrieve data
        headers: {
          'Content-Type': 'application/json',
          // For GET requests to protected endpoints, CSRF token in header is not needed,
          // but the session cookie is required.
        },
        // ### IMPORTANT FOR DJANGO SESSION AUTH + COOKIES ###
        // This is essential for sending session cookies (like sessionid)
        // in cross-origin requests to authenticated endpoints.
        credentials: 'include',
        // #################################################
      });

      // Check if the response status is OK (2xx)
      if (!response.ok) {
        const errorText = await response.text();
        // Handle specific 403 Forbidden error for better user feedback
        if (response.status === 403) {
             setError('Доступ заборонено. Будь ласка, увійдіть в систему для перегляду завдання.');
         } else if (response.status === 404) {
             // Handle 404 Not Found error if the task with this PK doesn't exist
             setError(`Завдання з ID ${pk} не знайдено.`);
         }
         else {
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
         }
         setTask(null); // Clear task data on error
      } else {
         // If response is OK, parse the JSON data
         const data = await response.json();
         setTask(data); // Set the task data state
         setError(null); // Clear any previous error
      }

    } catch (e) {
      // Catch block handles network errors or errors thrown above
      console.error(`Failed to fetch task ${pk}:`, e);
      setError(e.message || `Не вдалося завантажити дані завдання.`);
      setTask(null); // Clear task data on error
    } finally {
      // Finally block always executes
      setLoading(false); // Stop loading
    }
  };

  // Effect hook to fetch task data when the component mounts or the PK changes in the URL
  useEffect(() => {
    fetchTask();
  }, [pk]); // Dependency array includes 'pk', so effect runs when PK changes

  // Optional: Function to handle task deletion (requires a DELETE API call)
  const handleDeleteTask = async () => {
      if (window.confirm(`Ви впевнені, що хочете видалити завдання "${task?.title || task?.description || 'без назви'}"?`)) {
          try {
              // ### API Call to delete task ###
              // Use the relative URL for deleting a specific task by its PK
              const response = await fetch(`/api/tasks/del/${pk}/`, {
                  method: 'DELETE', // Use DELETE method
                  headers: {
                      'Content-Type': 'application/json',
                      // Obtain and include CSRF token for DELETE requests if needed
                      // 'X-CSRFToken': 'your_obtained_csrf_token',
                  },
                  credentials: 'include', // Essential for sending cookies
              });

              if (!response.ok) {
                  const errorText = await response.text();
                   if (response.status === 403) {
                       throw new Error('Доступ заборонено. Увійдіть для видалення завдання.');
                   }
                  throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
              }

              // If deletion is successful, navigate back to the task list page
              alert('Завдання успішно видалено.'); // Show success message
              navigate('/tasks'); // Navigate to the task list route

          } catch (e) {
              console.error(`Failed to delete task ${pk}:`, e);
              setError(e.message || 'Не вдалося видалити завдання.'); // Show error message
          }
      }
  };

  // Optional: Function to handle navigation to edit page (if you have a separate edit form)
  // If you are editing on this page directly, you won't need this.
  const handleEditTask = () => {
      // Navigate to the task edit page, assuming a route like /tasks/edit/:pk
      navigate(`/tasks/edit/${pk}`);
      // NOTE: If you are editing directly on THIS page, you would show/hide a form here
  };


  // --- Render Logic ---

  // Show spinner while loading task data
  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
         <Spinner animation="border" role="status">
           <span className="visually-hidden">Завантаження завдання...</span>
         </Spinner>
      </Container>
    );
  }

  // Show error message if fetching failed
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error} <Button variant="link" onClick={fetchTask}>Спробувати ще</Button></Alert>
        {/* Optional: Button to go back to task list */}
        <Button variant="secondary" className="mt-3" onClick={() => navigate('/tasks')}>Повернутись до списку завдань</Button>
      </Container>
    );
  }

  // If task data is loaded successfully, render the task details
  // Check if task is null in case of 404 or other non-error fetch issues
  if (!task) {
       return (
           <Container className="mt-5">
               <Alert variant="info">Завдання не знайдено або сталася помилка при завантаженні.</Alert>
               <Button variant="secondary" className="mt-3" onClick={() => navigate('/tasks')}>Повернутись до списку завдань</Button>
           </Container>
       );
  }


  // Helper function to get Badge variant based on task status (example)
  const getStatusVariant = (status) => {
      switch (status) {
          case 'todo': return 'secondary';
          case 'in_progress': return 'primary';
          case 'needs_review': return 'warning';
          case 'done': return 'success';
          default: return 'secondary';
      }
  };

  // Helper function to get user-friendly status text (example)
   const getStatusText = (status) => {
       switch (status) {
           case 'todo': return 'Готово до виконання';
           case 'in_progress': return 'В процесі';
           case 'needs_review': return 'Потребує перевірки';
           case 'done': return 'Виконано';
           default: return 'Невідомий статус';
       }
   };

  // Render the task details card
  return (
    <Container className="mt-4">
      {/* Task Title */}
      <h1>{task.title || task.description || `Завдання ${task.id}`}</h1> {/* Use title or description as main heading */}

      <Row className="mt-4">
          <Col md={8}> {/* Main content area for task details */}
              <Card>
                  <Card.Body>
                      {/* Task Description */}
                      <Card.Title>Опис завдання:</Card.Title>
                      <Card.Text>{task.description || 'Без опису'}</Card.Text>

                      {/* Task Status */}
                      <div className="mb-3">
                          <Card.Title className="d-inline-block me-2">Статус:</Card.Title>
                          {/* Assuming task object has a 'status' field */}
                          {task.status && (
                              <Badge bg={getStatusVariant(task.status)} className="fs-6"> {/* fs-6 for larger font size */}
                                  {getStatusText(task.status)}
                              </Badge>
                          )}
                      </div>

                       {/* Task Deadline/Date */}
                       {/* Assuming task object has a 'date' or 'deadline' field */}
                       {task.date && (
                           <div className="mb-3 text-muted">
                               <FontAwesomeIcon icon={faFlag} className="me-2" />
                               Дедлайн: {task.date} {/* Or format date if needed */}
                           </div>
                       )}

                       {/* Optional: Display other task details */}
                       {/*
                       {task.assigned_user && (
                           <div className="mb-3">
                               <Card.Title className="d-inline-block me-2">Призначено:</Card.Title>
                               <span>{task.assigned_user.username || 'Невідомий користувач'}</span> // Assuming assigned_user is an object with username
                           </div>
                       )}
                       */}
                       {/* Optional: Display comments section (requires fetching comments) */}
                       {/*
                       <Card.Title className="mt-4">Коментарі:</Card.Title>
                       // Render comments list component here
                       */}

                  </Card.Body>
              </Card>

              {/* Optional: Add section for comments, attachments, etc. */}

          </Col>

          <Col md={4}> {/* Sidebar or actions column */}
              <Card>
                  <Card.Body>
                      <Card.Title>Дії:</Card.Title>
                      {/* Button to edit task (if editing is done on a separate page) */}
                       {/* If editing on this page, you would show/hide an edit form instead of a button */}
                      <Button variant="primary" className="w-100 mb-2" onClick={handleEditTask}> {/* Use handleEditTask if navigating */}
                           <FontAwesomeIcon icon={faEdit} className="me-2" /> Редагувати завдання
                      </Button>

                      {/* Button to delete task */}
                      <Button variant="danger" className="w-100" onClick={handleDeleteTask}>
                           <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> Видалити завдання
                      </Button>

                      {/* Optional: Button to add participants (if relevant to task) */}
                      {/* This might trigger a modal */}
                       {/*
                       <Button variant="secondary" className="w-100 mt-2" onClick={() => setShowAddParticipantsModal(true)}>
                           Додати учасників до завдання
                       </Button>
                       */}

                  </Card.Body>
              </Card>

              {/* Optional: Card for assigned users/participants */}
               {/*
               <Card className="mt-3">
                   <Card.Body>
                       <Card.Title>Учасники:</Card.Title>
                       // Render list of assigned users/participants here
                   </Card.Body>
               </Card>
               */}

          </Col>
      </Row>

      {/* Optional: Render modals for adding participants or editing on this page */}
      {/* <AddParticipantsModal show={showAddParticipantsModal} onHide={() => setShowAddParticipantsModal(false)} ... /> */}
      {/* <EditTaskFormModal show={showEditTaskModal} onHide={() => setShowEditTaskModal(false)} taskData={task} ... /> */}

    </Container>
  );
};

export default TaskItemPage;
