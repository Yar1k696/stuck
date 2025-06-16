import React, { useState } from 'react';
// Import necessary React-Bootstrap components
import { Modal, Button, Form, Spinner, Alert, Container } from 'react-bootstrap';

// Define the AddProjectModal functional component
// It accepts 'show' and 'onHide' props to control visibility,
// and 'onProjectSubmit' prop to potentially pass data back to the parent (optional, as API call is here)
const AddProjectModal = ({ show, onHide, onProjectSubmit }) => {

  // State to manage form data (project name and description)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // State to manage loading state during API submission
  const [loading, setLoading] = useState(false);

  // State to manage error messages from API or fetch
  const [error, setError] = useState(null);

  // State to manage success message after successful submission
  const [success, setSuccess] = useState(false);

  // Handle changes in form input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update the corresponding field in formData state
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const csrfToken = getCookie('csrftoken');

  function getCookie(name) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
    return cookieValue || '';
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

    setLoading(true); // Set loading state to true
    setError(null);   // Clear any previous errors
    setSuccess(false); // Clear any previous success messages

    try {
      // ### API Call to Django Backend ###
      // Use the relative URL for adding a project as defined in your Django urls.py
      const response = await fetch('http://localhost:8000/api/projects/add/', {
        method: 'POST', // HTTP method is POST for creating a new resource

        headers: {
          'Content-Type': 'application/json', // Indicate that the request body is JSON
            'X-CSRFToken': csrfToken,
          // ### IMPORTANT FOR DJANGO SESSION AUTH + CSRF ###
          // If your React and Django are on different domains/ports (like localhost:5173 and localhost:8000),
          // you MUST obtain a CSRF token and include it in the headers for POST requests.
          // You can get the token by making a GET request to your /api/auth/csrf/ endpoint
          // before submitting the form, and then include it like this:
          // 'X-CSRFToken': 'your_obtained_csrf_token',
          // For simplicity in this template, we omit the CSRF token logic,
          // but it is crucial for security in a real application.
          // If React and Django are on the same domain/port, Django might handle CSRF automatically
          // if the cookie is sent, but explicitly sending the header is safer.
          // ###############################################
        },
        credentials: 'include',
        // Convert the form data state to a JSON string for the request body
        body: JSON.stringify(formData),

        // ### IMPORTANT FOR DJANGO SESSION AUTH + COOKIES ###
        // This is essential for sending session cookies (like sessionid and csrftoken)
        // in cross-origin requests.
        // #################################################
      });

      // Check if the response status is OK (typically 2xx status codes)
      if (!response.ok) {
        // If response is not OK, try to parse the error details from the response body
        // DRF often returns JSON with error details for validation errors (e.g., 400 Bad Request)
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));

        // ### Improved Error Message Handling from Backend ###
        // Attempt to format error messages, especially from DRF validation errors
        let errorMessage = `Failed to add project: ${response.status}`;
        if (typeof errorData === 'object') {
             // If the error data is an object (like DRF validation errors), format it
             errorMessage = Object.entries(errorData)
                 .map(([key, value]) => {
                     // Provide user-friendly names for common fields
                     const fieldName = {
                         name: 'Назва проекту',
                         description: 'Опис',
                         detail: 'Помилка' // General error detail
                     }[key] || key; // Use field name or key if not in map
                     // Join multiple error messages for a single field
                     return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                 })
                 .join('; '); // Join all field errors with a separator
         } else if (errorData.detail) {
             // If there's a general 'detail' field
             errorMessage = `Помилка: ${errorData.detail}`;
         } else {
             // Fallback for other error formats
             errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
         }
         // ###################################################

        throw new Error(errorMessage); // Throw an error to be caught by the catch block
      }

      // If the response is OK (successful)
      const newProject = await response.json(); // Optionally parse the response body if API returns the new project data
      console.log('Project added successfully:', newProject);

      setSuccess(true); // Indicate success

      // Optional: Call the parent's submit handler if needed
      if (onProjectSubmit) {
        onProjectSubmit(newProject); // Pass the new project data back
      }

      // Reset the form fields after successful submission
      setFormData({ name: '', description: '' });

      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        onHide(); // Call the onHide prop to close the modal
      }, 1500); // Close after 1.5 seconds

    } catch (e) {
      // Catch block handles network errors or errors thrown from the try block
      console.error("Error adding project:", e);
      // Set the error state with a user-friendly message
      setError(e.message || 'Не вдалося додати проект. Спробуйте ще.');
    } finally {
      // Finally block always executes after try and catch
      setLoading(false); // Set loading state to false
    }
  };

  // Handle modal close action
  const handleClose = () => {
      // Reset form state and messages when closing
      setFormData({ name: '', description: '' });
      setError(null);
      setSuccess(false);
      setLoading(false); // Ensure loading is false if cancelled during submission
      onHide(); // Call the onHide prop
  };


  return (
    // React-Bootstrap Modal component
    <Modal show={show} onHide={handleClose} centered> {/* 'show' and 'onHide' props control visibility */}
      <Modal.Header closeButton> {/* closeButton adds a close icon */}
        <Modal.Title>Додати новий проект</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Display error or success messages */}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Проект успішно додано!</Alert>}

        {/* Project Add Form */}
        <Form onSubmit={handleSubmit}>
          {/* Project Name Field */}
          <Form.Group className="mb-3" controlId="addProjectName">
            <Form.Label>Назва проекту</Form.Label>
            <Form.Control
              type="text"
              name="name" // 'name' attribute matches the state key
              value={formData.name} // Controlled component: value comes from state
              onChange={handleInputChange} // Update state on change
              required // Make this field required
              disabled={loading} // Disable input while loading
            />
          </Form.Group>

          {/* Project Description Field */}
          <Form.Group className="mb-3" controlId="addProjectDescription">
            <Form.Label>Опис</Form.Label>
            <Form.Control
              as="textarea" // Use textarea for multi-line input
              name="description" // 'name' attribute matches the state key
              value={formData.description} // Controlled component
              onChange={handleInputChange} // Update state on change
              disabled={loading} // Disable input while loading
              rows={3} // Optional: set number of visible rows
            />
          </Form.Group>

          {/*
             Optional: Add other fields here if your Project model has them,
             e.g., assigned user, deadline, status.
             Remember to add corresponding state variables and update handleInputChange.
           */}

           {/*
             Example for selecting a user (requires fetching users list):
             <Form.Group className="mb-3" controlId="addProjectAssignedUser">
               <Form.Label>Призначити користувача</Form.Label>
               <Form.Control
                 as="select"
                 name="assigned_user"
                 value={formData.assigned_user}
                 onChange={handleInputChange}
                 disabled={loading}
               >
                 <option value="">Оберіть користувача</option>
                 // Map over a list of users fetched from your API
                 // {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
               </Form.Control>
             </Form.Group>
           */}

          {/*
            The submit button is typically in the Modal.Footer, but can be here too.
            We'll put it in the footer for standard modal layout.
          */}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        {/* Cancel Button */}
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Скасувати
        </Button>

        {/* Save Button */}
        <Button variant="primary" onClick={handleSubmit} disabled={loading}> {/* Use onClick here as the form is wrapped around the content */}
          {loading ? (
            // Show spinner when loading
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-1" // Add a small margin to the right of the spinner
            />
          ) : (
            'Зберегти проект' // Button text when not loading
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProjectModal;
