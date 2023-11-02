import { useState } from 'react';
import { Form, Button, Alert, Col, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };

    props.login(credentials)
      .then( () => navigate( "/" ) )
      .catch((err) => { 
        setErrorMessage(err.error); setShow(true); 
      });
  };

  return (
    <Row className="vh-100 justify-content-md-center">
    <Col md={4} >
    <h1 className="pb-3">Login</h1>

      <Form  onSubmit={handleSubmit}>
          <Alert
            dismissible
            show={show}
            onClose={() => setShow(false)}
            variant="danger">
            {errorMessage}
          </Alert>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="username"
              value={username} placeholder="username"
              onChange={(ev) => setUsername(ev.target.value)}
              required={true}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password} placeholder="Enter the password."
              onChange={(ev) => setPassword(ev.target.value)}
              required={true} minLength={4}
            />
          </Form.Group>
          <Button className="mt-3" type="submit">Login</Button>
      </Form>
      </Col>
      </Row>

  )
};

function LogoutButton(props) {
    const navigate = useNavigate();
    return (
      <Button variant="outline-light" onClick={() => { 
        props.logout();
        navigate("/"); 
      }}>Logout</Button>
    )
  }
  

function LoginButton(props) {
  const navigate = useNavigate();
  return (
    <Button variant="outline-light" onClick={()=> navigate('/login')}>Login</Button>
  )
}

export { LoginForm, LogoutButton, LoginButton };