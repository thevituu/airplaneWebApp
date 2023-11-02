import { useState, useEffect, useContext } from 'react';
import { Button, Col, Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavigationBar } from './components/NavigationBar';
import { PlaneSelectionLayout, NotFoundLayout, SeatSelectionLayout, LoginLayout, LoadingLayout } from './components/PageLayout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate, Navigate } from 'react-router-dom';
import API from './API';


function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginButtonOn, setLoginButtonOn] = useState(false);
  const [message, setMessage] = useState('');

    // If an error occurs, the error message will be shown in a toast.
    const handleErrors = (err) => {
      let msg = '';
      if (err.error) msg = err.error;
      else if (String(err) === "string") msg = String(err);
      else msg = "Unknown Error";
      setMessage(msg);
    }


  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setLoginButtonOn(false);
        const user = await API.getUserInfo();  // user info, if already logged in
        setUser(user);
        setLoggedIn(true); 
        setLoginButtonOn(true);
        setLoading(false);
      } catch (err) {
        handleErrors(err); // mostly unauthenticated user, thus set not logged in
        setUser(null);
        setLoggedIn(false);
        setLoginButtonOn(true);
        setLoading(false);
      }
    };
    init();
  }, []);  // This useEffect is called only the first time the component is mounted.

  // login function, pass it to the login component
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  // logout function, pass it to the navigation bar
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };

  return (
    <BrowserRouter>
    <Container fluid className='App'>
      <NavigationBar loggedIn={loggedIn} user={user} logout={handleLogout} loginButtonOn={loginButtonOn} />
      <Routes>
        <Route path="/" element={<PlaneSelectionLayout />} />
        <Route path="/flight-view/:planetype" element={loading ? <LoadingLayout/> : <SeatSelectionLayout loggedIn={loggedIn} user={user}/>} />
        <Route path="/login" element={!loggedIn ? <LoginLayout login={handleLogin} /> : <Navigate replace to='/' />} />
        <Route path="*" element={<NotFoundLayout />} />
      </Routes>
    </Container>
    </BrowserRouter>
  )
}

export default App
