import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import '../css/style.css';

function My_Login(props) {
  const [email, setEmail] = useState('claudiu@polito.it');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const doLogin = (credentials) => {
    API.logIn(credentials)
      .then((user) => {
        setErrorMessage('');
        props.loginSuccessful(user);
      })
      .catch(err => {
        setErrorMessage("Wrong email or password");
      })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const credentials = { email, password };
    let valid = true;
    if (email === '' || password === '') {
      setErrorMessage('Please fill all the fields');
      valid = false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please insert a valid email');
      valid = false;
    }
    if (valid) {
      doLogin(credentials);
    }
  };

  return (
    <Container fluid className='my-login-wrapper'>
      <Form onSubmit={handleSubmit} className='my-login-form'>
        <div className='d-grid gap-2'>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group controlId='email'>
            <Form.Label><h3>Email</h3></Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <br />
          <Form.Group controlId='password'>
            <Form.Label><h3>Password</h3></Form.Label>
            <Form.Control
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <br />
          <Button className='mb-3' variant='primary' type='submit'> Login </Button>
          <Button className='mb-3' variant='secondary' onClick={() => navigate('/')} > Cancel </Button>
        </div>
      </Form>
    </Container>
  )
}

export default My_Login;