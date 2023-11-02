import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, ToggleButton, ButtonGroup, Button, ToggleButtonGroup, Form, Alert } from 'react-bootstrap';
import '../index.css';
import API from "../API";
import { LoadingLayout } from "./PageLayout";


function SeatView(props) {
    const navigate = useNavigate();

    const [selectedSeats, setSelectedSeats] = useState([]); // Array of seat ids

    // Define the types of planes
    const planeTypes = [
        { plane: "local", f: 15, p: 4 },
        { plane: "regional", f: 20, p: 5 },
        { plane: "international", f: 25, p: 6 }
    ];

    // Get the plane type from the URL
    const { planetype } = useParams();
    const [currentPlane, setCurrentPlane] = useState();
    const [occupiedSeats, setOccupiedSeats] = useState([]); // Array of seat ids
    const [reservedSeats, setReservedSeats] = useState([]); // Array of seat ids
    const [hasReservation, setHasReservation] = useState(false); // Array of seat ids
    const [localLoading, setLocalLoading] = useState(true);
    const [takenSeats, setTakenSeats] = useState([]);


    function reserveRandomSeats(numSeats, occupiedSeats, totalSeats) {
        setSelectedSeats([]); // Reset selected seats
        // Create a list of all seats
        let allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
        // Remove occupied seats from the list of all seats
        let availableSeats = allSeats.filter(seat => !occupiedSeats.includes(seat));

        // Check if there are enough seats available
        if (numSeats > availableSeats.length) {
            throw new Error("Not enough seats available");
        }

        // Select random seats
        let selectedSeatsTemp = [];
        for (let i = 0; i < numSeats; i++) {
            let randomIndex = Math.floor(Math.random() * availableSeats.length);
            let selectedSeat = availableSeats[randomIndex];

            // Remove the selected seat from the list of available seats
            availableSeats.splice(randomIndex, 1);

            // Add the selected seat to the list of selected seats
            selectedSeatsTemp.push(selectedSeat);
        }
        setSelectedSeats((currentSeats) => [...currentSeats, ...selectedSeatsTemp]);
    }

    // Find the plane type in the planeTypes array, if not found navigate to error page
    useEffect(() => {
        const matchedPlane = planeTypes.find(planeType => planeType.plane === planetype);
        if (!matchedPlane) {
            navigate("/error");
        } else {
            setCurrentPlane(matchedPlane);
        }
    }, [planetype]);

    // Check if the user has a reservation for the current plane
    function reservationCheck(planetype) {
        API.checkUserReservation(planetype).then((resSeats) => {
            if (resSeats.reservations) {
                setHasReservation(true);
                setReservedSeats(resSeats.reservations.map(reservation => reservation.id));
            }
            else {
                setHasReservation(false);
            }
        })
    }

    // Get the occupied seats from the server and check if the user has a reservation
    useEffect(() => {
        setLocalLoading(true);
        props.loggedIn ? reservationCheck(planetype) : null;
        API.checkOccupiedSeats(planetype).then((occupiedSeats) => {
            setOccupiedSeats(occupiedSeats);
            setLocalLoading(false);
        });
    }, [planetype]);


    // Reset the taken seats after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setTakenSeats([]);
        }, 5000);

        return () => clearTimeout(timer);
    }, [takenSeats]);



    // Calculate seat id based on row and column
    const getSeatId = (rowIndex, colIndex, numSeatsPerRow) => {
        return rowIndex * numSeatsPerRow + colIndex + 1;
    };


    const toggleSeatSelection = (seatId) => {
        setSelectedSeats((currentSeats) => {
            if (currentSeats.includes(seatId)) {
                // If seatId is already in the array, remove it
                return currentSeats.filter(seat => seat !== seatId);
            } else {
                // Otherwise, add it
                return [...currentSeats, seatId];
            }
        });

    };


    return localLoading ? <LoadingLayout /> : (
        <Container>
            <Row>
                <Col>
                    <InformationBar user={props.user} occupiedSeats={occupiedSeats}
                        setReservedSeats={setReservedSeats} reservedSeats={reservedSeats}
                        hasReservation={hasReservation} setHasReservation={setHasReservation}
                        setOccupiedSeats={setOccupiedSeats} currentPlane={currentPlane}
                        reserveRandomSeats={reserveRandomSeats} setSelectedSeats={setSelectedSeats}
                        selectedSeats={selectedSeats} loggedIn={props.loggedIn} setLocalLoading={setLocalLoading}
                        takenSeats={takenSeats} setTakenSeats={setTakenSeats} />
                </Col>
                <Col>
                    {currentPlane && (
                        <>
                            {/* Row for column labels */}
                            <Row >
                                <Col xs={1}></Col> {/* Empty space for row labels */}
                                {Array.from({ length: currentPlane.p }).map((_, colIndex) => (
                                    <Col key={colIndex} style={{ padding: '0.25rem 0.1rem' }} xs={1}>
                                        <Container>{String.fromCharCode(colIndex + 65)}</Container>
                                    </Col>
                                ))}
                            </Row>

                            {/* Rows for seats */}
                            {Array.from({ length: currentPlane.f }).map((_, rowIndex) => (
                                <Row key={rowIndex} className="no-gutters">
                                    {/* Column for row labels */}
                                    <Col style={{ padding: '0.25rem 0.1rem' }} xs={1}>
                                        <Container>{rowIndex + 1}</Container>
                                    </Col>

                                    {/* Columns for seats */}
                                    {Array.from({ length: currentPlane.p }).map((_, colIndex) => {
                                        const seatNumber = `${rowIndex + 1}${String.fromCharCode(colIndex + 65)}`; // 65 is the ASCII value for 'A'
                                        const seatId = getSeatId(rowIndex, colIndex, currentPlane.p); // Calculate the seat id
                                        return (
                                            <Col key={colIndex} style={{ padding: '0.25rem 0.1rem' }} xs={1}>
                                                <ToggleButtonGroup type="checkbox" >
                                                    <Button id={seatId.toString()}
                                                        onClick={() => {
                                                            if (!occupiedSeats.includes(seatId)) {
                                                                toggleSeatSelection(seatId);
                                                            }
                                                        }}
                                                        variant={(selectedSeats.includes(seatId) ? "success" : reservedSeats.includes(seatId) ? "warning" : "outline-success")}
                                                        className={reservedSeats.includes(seatId) ? "reserved-seat" : takenSeats.includes(seatId) ? "taken-seat" : occupiedSeats.includes(seatId) ? "disabled-seat" : ""}
                                                        style={{ padding: '2px 5px', width: "50px", pointerEvents: occupiedSeats.includes(seatId) || reservedSeats.includes(seatId) || !props.loggedIn || hasReservation ? 'none' : 'auto' }} >
                                                        {seatNumber}
                                                    </Button>




                                                </ToggleButtonGroup>
                                            </Col>

                                        );
                                    })}
                                </Row>
                            ))}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
}


function InformationBar(props) {
    const { planetype } = useParams();
    const availableSeats = props.currentPlane ? props.currentPlane.f * props.currentPlane.p - props.occupiedSeats.length - props.selectedSeats.length : 0;
    const totalSeats = props.currentPlane ? props.currentPlane.f * props.currentPlane.p : 0;
    const [amountRequestedSeats, setAmountRequestedSeats] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Check if the user has a reservation for the current plane
    function checkUserReservation() {
        API.checkUserReservation(planetype).then((resSeats) => {
            if (resSeats.reservations) {
                props.setHasReservation(true);
                props.setReservedSeats(resSeats.reservations.map(reservation => reservation.id));
                props.setLocalLoading(false);
            }
            else {
                props.setHasReservation(false);
                props.setLocalLoading(false);
            }
        })
    }

    // Cancel the user's reservation
    function cancelReservation() {
        props.setLocalLoading(true);
        API.cancelReservation(planetype)
            .then(() => {
                props.setHasReservation(false);
                API.checkOccupiedSeats(planetype).then((occupiedSeats) => {
                    props.setOccupiedSeats(occupiedSeats);
                    checkUserReservation();
                    props.setOccupiedSeats((currentSeats) => currentSeats.filter((seat) => !props.reservedSeats.includes(seat)));
                    props.setSelectedSeats([]);
                    props.setReservedSeats([]);
                    props.setLocalLoading(false);
                });
                //checkUserReservation();
                // Remove the seats that were previously reserved by the user from the list of occupied seats

                //props.setLocalLoading(false);
            });
    }


    // Confirm the user's reservation
    function confirmReservation() {
        if (props.loggedIn) {
            if (props.selectedSeats.length > 0) {
                props.setLocalLoading(true);
                API.reserveSeats(props.selectedSeats, planetype).then(() => {
                    props.setHasReservation(true);
                    API.checkOccupiedSeats(planetype).then((occupiedSeats) => {
                        props.setOccupiedSeats(occupiedSeats);
                        props.setSelectedSeats([]);
                        checkUserReservation();

                        //props.setLocalLoading(false);
                    });


                })
                    // If the reservation fails, check the occupied seats again
                    .catch((err) => {
                        props.setOccupiedSeats([]);
                        API.checkOccupiedSeats(planetype).then((occupiedSeats) => {
                            const takenSeats = props.selectedSeats.filter(seat => occupiedSeats.includes(seat));
                            props.setTakenSeats(takenSeats);
                            props.setOccupiedSeats(occupiedSeats);
                            props.setSelectedSeats([]);
                            props.setLocalLoading(false);

                        });

                    });
            } else {
                setAlertMessage("Please select at least one seat");
                setShowAlert(true);
                //alert("Please select at least one seat");
            }
        }
    }

    return (
        <Container>
            <Row>
                <Row className="justify-content-center">
                {showAlert ? <Alert variant="danger"  className="mt-2" >{alertMessage}</Alert> : null}
                </Row>
                {props.takenSeats.length > 0 ? <Row className="justify-content-center">
                    <Col xs="auto">
                        <Alert key="danger" variant="danger" className="mt-2">
                            Some of the chosen seats are no longer available. Please select new seats.
                        </Alert>
                    </Col>
                </Row> : null}
                <Col>
                    <h1>Seat Selection</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3>Flight: {planetype}</h3>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3>Total Seats: {totalSeats} </h3>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3>Available Seats:
                        <span style={{ color: 'green' }}> {availableSeats}</span>
                    </h3>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3>Occupied Seats:
                        <span style={{ color: 'red' }}> {props.occupiedSeats.length}</span>
                    </h3>
                </Col>
            </Row>
            {props.loggedIn && !props.hasReservation ? <Row>
                <Col>
                    <h3>
                        Requested Seats:
                        <span> {props.selectedSeats.length}</span>
                    </h3>
                </Col>
            </Row> : <Row>
                <Col>
                    <h3>
                        Reserved Seats:
                        <span> {props.reservedSeats.length}</span>
                    </h3>
                </Col>
            </Row>}



            {props.loggedIn ? (props.hasReservation ? <Row className="mb-3">
                <Col>
                    <Button variant="danger" onClick={cancelReservation}>
                        Cancel Reservation
                    </Button>
                </Col>
            </Row> :
                <Container>
                    <Row >
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Seats</Form.Label>
                                <div className="col-md-6">  {/* adjust as needed */}
                                    <Form.Control
                                        type="number"
                                        placeholder="enter amount of seats to book"
                                        onKeyDown={(ev) => {
                                            // prevent non-numeric input
                                            if (!isFinite(ev.key) && ev.key !== 'Backspace') {
                                                ev.preventDefault();
                                            }
                                        }}
                                        onChange={(ev) => {
                                            let numSeats = ev.target.value;
                                            if (numSeats < 0) {
                                                setAlertMessage("Please enter a positive number");
                                                setShowAlert(true);
                                                ev.target.value = 0;
                                            } else if (numSeats > availableSeats) {
                                                setAlertMessage("The number of seats cannot exceed the available seats");
                                                setShowAlert(true);
                                                numSeats = availableSeats;
                                                ev.target.value = availableSeats;
                                            } else {
                                                setShowAlert(false);
                                            }
                                            setAmountRequestedSeats(numSeats);
                                        }}
                                    />

                                </div>
                            </Form.Group>

                            <Button className="mb-3" variant="primary" onClick={() => { props.reserveRandomSeats(amountRequestedSeats, props.occupiedSeats, totalSeats); }}>
                                Randomize Seats
                            </Button>
                        </Form>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Button variant="success" onClick={confirmReservation}>
                                Confirm Reservation
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Button variant="danger" onClick={() => props.setSelectedSeats([])}>
                                Cancel Reservation
                            </Button>
                        </Col>
                    </Row>
                </Container>) : null}
        </Container>
    )
}







export { SeatView, InformationBar }
