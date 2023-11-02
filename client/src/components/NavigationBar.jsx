import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { LoginButton, LogoutButton } from './Auth';
import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


function NavigationBar(props) {

  const [loggedIn, setLoggedIn] = useState(props.loggedIn);

  useEffect(() => {
    setLoggedIn(props.loggedIn);
  }, [props.loggedIn]);

  return (
    <Navbar bg="primary" className="navbar-dark">
      <Container>
        <Navbar.Brand href="/">Planeseat Booking</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {loggedIn && (
            <Navbar.Text style={{marginRight: "20px"}}>
              Signed in as: {props.user ? props.user.name : ""}
            </Navbar.Text>
          )}
          {loggedIn ? (
            <LogoutButton logout={props.logout} />
          ) : props.loginButtonOn ? (
            <LoginButton>
              <Link to="/login" />
            </LoginButton>
          ) : null}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export {NavigationBar}
