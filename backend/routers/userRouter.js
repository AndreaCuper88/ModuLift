const express = require('express');
const router = express.Router();

//Import del controller di user
const userController = require('../controllers/userController');


// Rotta POST /api/users/register → crea un nuovo utente
 router.post('/register', userController.createUser);

// Rotta POST /api/users/login → login utente
 router.post('/login', userController.login);

 // Rotta POST /api/users/logout → logout utente
router.post('/logout', userController.logout);

// Rotta POST /api/users/refresh-token → endpoint per permettere il refresh dell'access token
//Reso automatico da axiosInstance ecc..
router.post('/refresh-token', userController.refreshToken);

//Rotta per ottenere l'età dell'utente
router.get('/:userId/getAge', userController.getAge);


//Rotta per ottenere l'età dell'utente
router.get('/:userId/getSex', userController.getSex);



 module.exports = router;