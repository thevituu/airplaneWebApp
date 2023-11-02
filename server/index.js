'use strict';

const flightdb = require('./flightseats-dao.js');

const PORT = 3000;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userDao = require('./user-dao.js');

const app = express();
app.use(morgan('combined'));
app.use(express.json());



const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
  };
  app.use(cors(corsOptions));

const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)


/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUser(username, password)
    if(!user)
      return callback(null, false, 'Incorrect username or password');  
      
    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
  }));
  
  // Serializing in the session the user object given from LocalStrategy(verify).
  passport.serializeUser(function (user, callback) { // this user is id + username + name 
    callback(null, user);
  });
  
  // Starting from the data in the session, we extract the current (logged-in) user.
  passport.deserializeUser(function (user, callback) { // this user is id + email + name 
    // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
    // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));
  
    return callback(null, user); // this will be available in req.user
  });
  
  /** Creating the session */
  const session = require('express-session');

  
app.use(session({
    secret: "secret phrase wuhuuu",
    cookie: {
        sameSite: 'lax'
    },
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.authenticate('session'));
  
  
  /** Defining authentication verification middleware **/
  const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
  }
  
  
  /*** Utility Functions ***/
  
  // This function is used to format express-validator errors as strings
  const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return `${location}[${param}]: ${msg}`;
  };

  // POST /api/sessions 
// This route is used for performing login.
app.post('/api/login', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => { 
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).json({ error: info});
        }
        // success, perform the login and extablish a login session
        req.login(user, (err) => {
          if (err)
            return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUser() in LocalStratecy Verify Fn
          return res.json(req.user);
        });
    })(req, res, next);
  });

  // GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.status(200).json(req.user);}
    else
      res.status(401).json({error: 'Not authenticated'});
  });

  // DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.status(200).json({});
    });
  });
  

app.get('/api/local-flight-allseats', (req, res) => {
    flightdb.getLocalAllSeats()
        .then((allSeats) => {
            if (allSeats) res.json(allSeats);
            else res.status(404).json(res.error);
        })
        .catch((err) => { res.status(500).json(err); });
});

app.get('/api/regional-flight-allseats', (req, res) => {
    flightdb.getRegionalAllSeats()
        .then((allSeats) => {
            if (allSeats) res.json(allSeats);
            else res.status(404).json(res.error);
        })
        .catch((err) => { res.status(500).json(err); });
});

app.get('/api/international-flight-allseats', (req, res) => {
    flightdb.getInternationalAllSeats()
        .then((allSeats) => {
            if (allSeats) res.json(allSeats);
            else res.status(404).json(res.error);
        })
        .catch((err) => { res.status(500).json(err); });
});


app.patch('/api/reserve-seats', isLoggedIn, (req, res) => {
    const { seatIds, flightType } = req.body; 
    flightdb.reserveSeats(seatIds, req.user.id, flightType)
        .then((result) => {
            if (result.changes > 0) {
                res.json({ success: true, message: `${result.changes} seat(s) reserved.` });
            } else {
                res.status(404).json({ success: false, message: "No seats were reserved. The seats may not exist or may already be reserved." });
            }
        })
        .catch((err) => {
            res.status(500).json({ success: false, message: "An error occurred while trying to reserve seats.", error: err });
        });
});

app.patch('/api/cancel-reservation', isLoggedIn, (req, res) => {
    const { flightType } = req.body;

    flightdb.cancelReservation(req.user.id, flightType)
        .then((result) => {
            if (result.changes > 0) {
                res.json({ success: true, message: `Cancelled ${result.changes} reservations.` });
            } else {
                res.status(404).json({ success: false, message: 'No reservations found for this user and flight type.' });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
});


app.get('/api/check-user-reservation', isLoggedIn, (req, res) => {
    const { flightType } = req.query;
    flightdb.checkUserReservation(req.user.id, flightType)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => { res.status(500).json(err); });
});

app.get('/api/check-occupied-seats', (req, res) => {
    const { flightType } = req.query;
    flightdb.getOccupiedIdByPlanetype(flightType)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => { res.status(500).json(err); });
});


            
app.listen(PORT, () => console.log('Listening on port 3000'));