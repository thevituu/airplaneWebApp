'use strict';

const sqlite = require('sqlite3');
const db = new sqlite.Database('./flights.db', (err) => {
    if (err) {
        throw err;
    }});


exports.getLocalAllSeats = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM local_flights`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

exports.getRegionalAllSeats = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM regional_flights`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

exports.getInternationalAllSeats = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM international_flights`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}


exports.getOccupiedIdByPlanetype = (planetype) => {

    const validPlanetypes = ["local", "regional", "international"];
    if (!validPlanetypes.includes(planetype)) {
        return Promise.reject(new Error(`Invalid planetype: ${planetype}`));
    }

    return new Promise((resolve, reject) => {
        // Formatiere den SQL-String dynamisch auf Basis des planetype
        const sql = `SELECT * FROM ${planetype}_flights WHERE occupied = 1`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows.map(row => row.id));
        });
    });
}





exports.reserveSeats = (seatIds, userId, flightType) => {
    return new Promise((resolve, reject) => {
        // Stellen Sie sicher, dass flightType eine der zulässigen Werte ist
        const validFlightTypes = ["local", "regional", "international"];
        if (!validFlightTypes.includes(flightType)) {
            reject("Invalid flight type");
            return;
        }

        // Überprüfen Sie zunächst, ob die Sitze bereits belegt sind
        const checkSql = `SELECT * FROM ${flightType}_flights WHERE id IN (${seatIds.map(() => '?').join(',')}) AND occupied = 1`;

        db.all(checkSql, seatIds, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows.length > 0) {
                // Wenn ein oder mehrere Sitze bereits belegt sind, lösen Sie die Versprechung mit einer Fehlermeldung aus
                reject("One or more of the requested seats are already occupied");
                return;
            }

            // Wenn kein Sitz belegt ist, fahren Sie mit der Aktualisierung fort
            const sql = `UPDATE ${flightType}_flights SET occupied = 1, userid = ? WHERE id IN (${seatIds.map(() => '?').join(',')})`;

            // Generieren Sie die Parameterliste für die SQL-Anweisung
            // Der erste Parameter ist die User-ID, die anderen sind die Sitz-IDs
            const params = [userId].concat(seatIds);

            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    });
};


exports.cancelReservation = (userId, flightType) => {
    return new Promise((resolve, reject) => {
        // Stellen Sie sicher, dass flightType eine der zulässigen Werte ist
        const validFlightTypes = ["local", "regional", "international"];
        if (!validFlightTypes.includes(flightType)) {
            reject("Invalid flight type");
            return;
        }

        // Generieren Sie die SQL-Anweisung
        const sql = `UPDATE ${flightType}_flights SET occupied = 0, userid = NULL WHERE userid = ?`;

        db.run(sql, [userId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
}

exports.checkUserReservation = (userId, flightType) => {
    return new Promise((resolve, reject) => {
        // Stellen Sie sicher, dass flightType eine der zulässigen Werte ist
        const validFlightTypes = ["local", "regional", "international"];
        if (!validFlightTypes.includes(flightType)) {
            reject("Invalid flight type");
            return;
        }

        // Generieren Sie die SQL-Anweisung
        const sql = `SELECT * FROM ${flightType}_flights WHERE userid = ?`;

        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length > 0) {
                    resolve({ hasReservation: true, reservations: rows });
                } else {
                    resolve({ hasReservation: false });
                }
            }
        });
    });
}









