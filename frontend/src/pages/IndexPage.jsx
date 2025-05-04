import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../assets/bg.webp';

function getCookie(name) {
 const cookieValue = document.cookie
  .split('; ')
  .find(row => row.startsWith(name + '='))
  ?.split('=')[1];
 return cookieValue || '';
}

const IndexPage = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
 const csrfToken = getCookie('csrftoken');
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
   console.log('Успішний вхід:', data);


   navigate('/tasks');

  } catch (e) {
   console.error('Помилка входу:', e);
   setError(e.message || 'Не вдалося увійти. Перевірте дані.');
  } finally {
   setLoading(false);
  }
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
    <h1>Липучка. Зручний таск-менеджер</h1>
    <br/>
    <h2>Липучка: Де кожна задача має своє місце.</h2>
  </div>
</Col>

    <Col
     md={6}
     className="d-flex align-items-center justify-content-center p-4"
    >
     <div style={{ maxWidth: '400px', width: '100%' }}>
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
          {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Увійти'}
         </Button>
        </Form>
        <div className="text-center mt-2">
         Ще не маєте акаунту? <Link to="/register">Зареєструватися</Link>
        </div>
       </Card.Body>
      </Card>
     </div>
    </Col>
   </Row>
  </Container>
 );
};

export default IndexPage;