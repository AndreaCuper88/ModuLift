const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

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

//Rotta per ottenere l'altezza dell'utente
router.get('/:userId/getHeight', userController.getHeight);

//Rotta per ottenere il profilo dell'utente
router.get('/:userId/profilo', verifyToken, userController.getProfilo);


 module.exports = router;