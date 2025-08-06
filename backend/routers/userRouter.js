const express = require('express');
const router = express.Router();

//Import del controller di user
const userController = require('../controllers/userController');

// Rotta POST /api/user/login → login utente
// router.post('/login',userController.loginUtente);
//
// Rotta POST /api/user/register → crea un nuovo utente
 router.post('/register', userController.createUser);

 module.exports = router;