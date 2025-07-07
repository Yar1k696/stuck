import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import loginImage from '../assets/bg.webp'; // Переконайтеся, що шлях правильний

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // Для повідомлень про успіх
  const [error, setError] = useState('');     // Для повідомлень про помилку
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage(''); // Очищаємо попередні повідомлення
    setError('');   // Очищаємо попередні помилки
    setLoading(true); // Встановлюємо стан завантаження

    try {
      // Замініть 'http://localhost:8000/api/password-reset/' на реальний URL вашого API для скидання пароля
      // API для скидання пароля зазвичай приймає email та надсилає лист
      const response = await fetch('http://localhost:8000/api/password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           // 'X-CSRFToken': 'ваш_csrf_токен',
        },
        body: JSON.stringify({ email }), // Відправляємо email
      });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({ detail: 'Невідома помилка сервера' }));
         const errorMessage = errorData.email ? `Email: ${errorData.email.join(', ')}` :
                              errorData.detail || 'Не вдалося скинути пароль';
         throw new Error(errorMessage);
       }

       // Якщо відповідь OK (наприклад, 200 OK або 204 No Content, залежно від API)
       // Не завжди повертає тіло, але може бути повідомлення
       const data = await response.json().catch(() => null); // Спробуємо прочитати, але не кидаємо помилку, якщо тіла немає


      setMessage('Перевірте вашу пошту для подальших інструкцій.'); // Повідомлення про успіх
      setEmail(''); // Очищаємо поле email

    } catch (e) {
      console.error('Помилка скидання пароля:', e);
      setError(e.message || 'Не вдалося скинути пароль'); // Встановлюємо повідомлення про помилку
    } finally {
      setLoading(false); // Вимикаємо стан завантаження
    }
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="g-0 h-100">
        {/* Ліва частина з фоновим зображенням */}
        <Col
          md={6}
          className="d-none d-md-flex align-items-center justify-content-center"
          style={{
            background: `url(${loginImage}) no-repeat center center`,
            backgroundSize: 'cover',
            // minHeight: '300px' // Приклад
          }}
        >
          <div className="text-white text-center p-4">
            <h1>Скидання пароля</h1>
            <p className="lead">Введіть ваш email для отримання інструкцій</p>
          </div>
        </Col>

        {/* Права частина з формою скидання пароля */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-center p-4 bg-light" // bg-light був у вашому коді
        >
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h2 className="text-center mb-4">Скидання пароля</h2>
                {/* Виведення повідомлень */}
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>} {/* Виведення повідомлення про успіх */}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="forgotPasswordEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading} // Блокуємо поля під час завантаження
                    />
                  </Form.Group>
                  <Button
                    disabled={loading} // Блокуємо кнопку під час завантаження
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