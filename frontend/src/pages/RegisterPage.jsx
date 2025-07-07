import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // Додаємо useNavigate
import loginImage from '../assets/bg.webp'; // Переконайтеся, що шлях правильний

const RegisterPage = () => {
  const [username, setUsername] = useState(''); // Додаємо стан для username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Перевірка паролів на стороні клієнта (залишаємо)
    if (password !== confirmPassword) {
      return setError("Паролі не співпадають");
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           // Якщо потрібен CSRF токен (наприклад, якщо React на іншому домені/порті), отримайте його та додайте тут:
           // 'X-CSRFToken': 'ваш_csrf_токен', // Отримайте токен за допомогою GET запиту на /api/auth/csrf/ перед відправкою форми
        },
        // ### ОНОВЛЮЄМО ТІЛО ЗАПИТУ ###
        // Додаємо username та password2 (значення з confirmPassword)
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          password2: confirmPassword, // Надсилаємо confirmPassword як password2
        }),
        // #############################
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ detail: 'Невідома помилка сервера' }));

         // ### ПОКРАЩЕНА ОБРОБКА ПОМИЛОК З БЕКЕНДУ ###
         // DRF часто повертає об'єкт з помилками для кожного поля.
         // Обробляємо цей об'єкт для більш детального повідомлення.
         let errorMessage = 'Не вдалося створити акаунт.';
         if (typeof errorData === 'object') {
             errorMessage = Object.entries(errorData)
                 .map(([key, value]) => {
                     // Перекладаємо назви полів, якщо потрібно
                     const fieldName = {
                         username: 'Ім\'я користувача',
                         email: 'Email',
                         password: 'Пароль',
                         password2: 'Підтвердження пароля',
                         detail: 'Помилка' // Загальна помилка
                     }[key] || key;
                     // Об'єднуємо повідомлення про помилку для цього поля
                     return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                 })
                 .join('; '); // Об'єднуємо всі повідомлення про помилки полів
         } else if (errorData.detail) {
             errorMessage = `Помилка: ${errorData.detail}`;
         }
         // ###########################################

         throw new Error(errorMessage);
      }

      const data = await response.json();

      // Логіка після успішної реєстрації
      alert('Реєстрація успішна! Тепер увійдіть.');
      navigate('/login');

    } catch (e) {
      setError(e.message || 'Не вдалося створити акаунт. Спробуйте ще.');
    } finally {
      setLoading(false);
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
          }}
        >
        </Col>

        {/* Права частина з формою реєстрації */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-center p-4 bg-light"
        >
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h2 className="text-center mb-4">Реєстрація</h2>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Додаємо поле для ім'я користувача (username) */}
                   <Form.Group className="mb-3" controlId="registerUsername">
                    <Form.Label>Ім'я користувача</Form.Label>
                    <Form.Control
                      type="text" // Тип text для username
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="registerEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="registerPassword">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </Form.Group>

                   <Form.Group className="mb-3" controlId="registerConfirmPassword">
                    <Form.Label>Підтвердіть пароль</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    disabled={loading}
                    className="w-100 mb-3"
                    type="submit"
                    variant="primary"
                  >
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Зареєструватися'}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  Вже маєте акаунт? <Link to="/login">Увійти</Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;