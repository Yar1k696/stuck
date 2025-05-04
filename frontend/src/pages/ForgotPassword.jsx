import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import loginImage from '../assets/bg.webp';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({ detail: 'Невідома помилка сервера' }));
         const errorMessage = errorData.email ? `Email: ${errorData.email.join(', ')}` :
                              errorData.detail || 'Не вдалося скинути пароль';
         throw new Error(errorMessage);
       }

       const data = await response.json().catch(() => null);
       console.log('Скидання пароля запитано:', data);

      setMessage('Перевірте вашу пошту для подальших інструкцій.');
      setEmail('');

    } catch (e) {
      console.error('Помилка скидання пароля:', e);
      setError(e.message || 'Не вдалося скинути пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="g-0 h-100">
        <Col
          md={6}
          className="d-none d-md-flex align-items-center justify-content-center"
          style={{
            background: `url(${loginImage}) no-repeat center center`,
            backgroundSize: 'cover',
          }}
        >
          <div className="text-white text-center p-4">
            <h1>Скидання пароля</h1>
            <p className="lead">Введіть ваш email для отримання інструкцій</p>
          </div>
        </Col>

        <Col
          md={6}
          className="d-flex align-items-center justify-content-center p-4 bg-light"
        >
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h2 className="text-center mb-4">Скидання пароля</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="forgotPasswordEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </Form.Group>
                  <Button
                    disabled={loading}
                    className="w-100 mb-3"
                    type="submit"
                    variant="primary"
                  >
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Скинути пароль'}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <Link to="/login">Повернутись до входу</Link>
                </div>
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

export default ForgotPassword;