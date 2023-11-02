import Card from 'react-bootstrap/Card';
import { Link, useLocation } from 'react-router-dom';

function PlaneSelection() {

    const location = useLocation();

    return (
      <div className="d-flex justify-content-center" style={{ marginTop: '20px' }}>
        <Card style={{ width: '18rem', margin: '0 10px' }}>
          <Card.Body>
            <Card.Title>Local Flight</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Total seats: 60</Card.Subtitle>
            <Card.Text>
              F = 15, P = 4
            </Card.Text>
            <Link to="/flight-view/local" state={{nextpage: location.pathname}}>Book seats</Link>
          </Card.Body>
        </Card>
        <Card style={{ width: '18rem', margin: '0 10px' }}>
          <Card.Body>
            <Card.Title>Regional Flight</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Total seats: 100</Card.Subtitle>
            <Card.Text>
              F = 20, P = 5
            </Card.Text>
            <Link to="/flight-view/regional" state={{nextpage: location.pathname}}>Book seats</Link>
          </Card.Body>
        </Card>
        <Card style={{ width: '18rem', margin: '0 10px' }}>
          <Card.Body>
            <Card.Title>International Flight</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Total seats: 150</Card.Subtitle>
            <Card.Text>
              F = 25, P = 6
            </Card.Text>
            <Link to="/flight-view/international" state={{nextpage: location.pathname}}>Book seats</Link>
          </Card.Body>
        </Card>
      </div>
    );
  }
  



export { PlaneSelection};