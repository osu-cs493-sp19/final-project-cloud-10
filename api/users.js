const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { UserSchema, createUser, getUserDetailById, authenticateUser } = require('../models/user');



router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const user = await authenticateUser(req.body.email, req.body.password);
      if (user != null) {
        const token = generateAuthToken(user.id, user.email, user.role);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      res.status(500).send({
        error: "Error validating user. Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});

/*
 * Route to create a user
 */
 router.post('/', requireAuthentication, async (req, res) => {
   const newUser = req.body;
   if (validateAgainstSchema(newUser, UserSchema)) {
     if (!newUser.role) {
       newUser.role = "student";
     }
   } else {
     res.status(400).send({
       error: "Request body is not a valid user."
     });
   }

   if (
     (
       req.user != null
       && (
         (req.user.role === "admin" && (newUser.role === "admin" || newUser.role === "instructor" || newUser.role === "student"))
         || (req.user.role === "instructor" && newUser.role === "student")
         || (req.user.role === "student" && newUser.role === "student")
          )
      )
     ||
     (
       req.user == null && newUser.role === "student")
     ) {
     try {
       const id = await createUser(newUser);
       res.status(201).send({
         _id: id
       });
     } catch (err) {
       console.error(err);
       res.status(500).send({
         error: "Error inserting user to DB. Please try again later."
       });
     }
   } else {
     res.status(403).send({
       error: "Unauthorized to create account"
     });
   }
 });

/*
 * Route to get user detail by id
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {
  if (req.user != null && (req.user.role === "admin" || req.user.sub == req.params.id)) {
    try {
      const user = await getUserDetailById(req.params.id);
      if (user) {
        res.status(200).send(user);
      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user. Try again later."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

module.exports = router;
