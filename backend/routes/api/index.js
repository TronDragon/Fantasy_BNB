// backend/routes/api/index.js
const express = require('express');
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const { restoreUser } = require("../../utils/auth.js");
const spotsRouter = require('./spots.js');
// const createSpotRouter = require('./createSpot.js');
// const addSpotRouter = require('./addSpot');

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null


  router.use(restoreUser);

  // router.get('/restore-user', (req, res) => {
  //     return res.json(req.user);
  //   }
  // );

// // GET /api/set-token-cookie
// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: 'Demo-lition'
//     }
//   });
//   setTokenCookie(res, user);
//   return res.json({ user: user });
// });

// // GET /api/require-auth
// const { requireAuth } = require('../../utils/auth.js');
// router.get(
//   '/require-auth',
//   requireAuth,
//   (req, res) => {
//     return res.json(req.user);
//   }
// );

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

// router.use('/create-spot', createSpotRouter);

// router.use('/add-spot', addSpotRouter);


// router.post('/test', (req, res) => {
//   res.json({ requestBody: req.body });
// });

module.exports = router;
