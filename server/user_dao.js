"use strict";
// import modules
const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database
const db = new sqlite.Database("CSM_Small.db", (err) => {
    if (err) throw err;
});

// get user by email and password
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Users WHERE email = ?";
        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            else if (row === undefined) {
                resolve(null);
                return;
            }
            const user = {
                id: row.id,
                name: row.name,
                username: row.email,
                isAdmin: row.isAdmin
            }
            const salt = row.salt;
            crypto.scrypt (password, salt, 32, (err, hashedPassword) => {
                if (err){
                    reject(err);
                    return;
                }
                const passwordHash = Buffer.from(row.hash, "hex");
                if (!crypto.timingSafeEqual(passwordHash, hashedPassword)) {
                    resolve(null);
                    return;
                }
                resolve(user);
            });
        });
    });
};

// get user by id for deserializeUser

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            else if (row === undefined) {
                resolve(null);
                return;
            }
            const user = {
                id: row.id,
                name: row.name,
                username: row.email,
                isAdmin: row.isAdmin
            }
            resolve(user);
        });
    });
};

// get all users for admin withou password
exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, name, email, isAdmin FROM Users";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const users = rows.map((row) => ({
                id: row.id,
                name: row.name,
                email: row.email,
                isAdmin: row.isAdmin
            }));
            resolve(users);
        });
    });
};

// update the author of a page
exports.updatePageUser = (user_id, page_id) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE Pages SET author_id = ? WHERE page_id = ?";
        db.run(sql, [user_id, page_id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(page_id);
        });
    });
};