import { useLocation } from "react-router-dom";
import { PlaneSelection } from "./PlaneSelection";
import { InformationBar, SeatView } from "./SeatSelection";
import { Col, Row } from "react-bootstrap";
import { LoginForm } from "./Auth";

function PlaneSelectionLayout(props) {

    const location = useLocation();


    return (
        <PlaneSelection />
    );
}

function SeatSelectionLayout(props) {

    const location = useLocation();
    return (
        <SeatView loggedIn={props.loggedIn} user={props.user}/>

    );
}

function NotFoundLayout() {
    return (
        <div>
            <h1>404 - Not Found</h1>
        </div>
    );
}


function LoginLayout(props) {
    return (
      <Row className="vh-100">
        <Col md={12} className="below-nav">
          <LoginForm login={props.login} />
        </Col>
      </Row>
    );
  }

  function LoadingLayout(props) {
    return (
      <Row className="vh-100">
        <Col md={4} bg="light" className="below-nav" id="left-sidebar">
        </Col>
        <Col md={8} className="below-nav">
          <h1>Loading ...</h1>
        </Col>
      </Row>
    )
  }

export { PlaneSelectionLayout, SeatSelectionLayout, NotFoundLayout, LoginLayout, LoadingLayout };