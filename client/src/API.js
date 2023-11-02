const APIURL = 'http://localhost:3000/api';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise
        .then((response) => {
          if (response.ok) {
  
           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "Cannot parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => 
                reject(obj)
                ) // error msg in the response body
              .catch(err => reject({ error: "Cannot parse server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });
  }


const checkOccupiedSeats = async (planetype) => {
    return getJson(fetch(APIURL + '/check-occupied-seats?flightType=' + planetype, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }))
};



/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
    return getJson(fetch(APIURL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    })
    )
  };
  
  /**
   * This function is used to verify if the user is still logged-in.
   * It returns a JSON object with the user info.
   */
  const getUserInfo = async () => {
    return getJson(fetch(APIURL + '/sessions/current', {
      // this parameter specifies that authentication cookie must be forwared
      credentials: 'include'
    })
    )
  };
  
  /**
   * This function destroy the current user's session and execute the log-out.
   */
  const logOut = async() => {
    return getJson(fetch(APIURL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
    })
    )
  }

  const reserveSeats = async (seatIds, flightType) => {
    return getJson(fetch(APIURL + '/reserve-seats', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({seatIds, flightType}),
    })
    )
    };

    const checkUserReservation = async (flightType) => {
        return getJson(fetch(APIURL + '/check-user-reservation?flightType=' + flightType, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }))
    };
    
    const cancelReservation = async (flightType) => {
        return getJson(fetch(APIURL + '/cancel-reservation', {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({flightType}),
        }))
    };




const API = {checkOccupiedSeats, logIn, getUserInfo, logOut, reserveSeats, cancelReservation, checkUserReservation};
export default API;