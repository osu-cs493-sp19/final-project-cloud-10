const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

const {
    AssignmentSchema,
    insertNewAssignment,
    getAssignments
    } = require('../models/assignments');
const { getUserById } = require('../models/user');

router.get('/', async (req, res) => {
    try {
      /*
       * Fetch page info, generate HATEOAS links for surrounding pages and then
       * send response.
       */
      const userPage = await getAssignments();

      res.status(200).send(userPage);
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error fetching businesses list.  Please try again later."
      });
    }
  });
router.post('/', requireAuthentication, async (req, res) => {
    const user = await getUserById(req.user.sub);
    if (user){
     // if (validateAgainstSchema(req.body, AssignmentSchema)) {
      if (req.body.courseId && req.body.title && req.body.points && req.body.due) {
        try {
          const id = await insertNewAssignment(req.body);
          res.status(201).send({
            id: id,
            links: {
              assignment: `/assignments/${id}`
            }
          });
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Error inserting assignment into DB.  Please try again later."
          });
        }
      } else {
        res.status(400).send({
          error: "Request body is not a valid course object"
        });
      }
    } else {
      res.status(403).send({
        error: "Unauthorized to insert the specified resource"
      });
    }
  });

  /*
   * Route to fetch info about a specific course.
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const course = await getCourseById(parseInt(req.params.id));
      if (course) {
        res.status(200).send(course);
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch course.  Please try again later."
      });
    }
  });

  module.exports = router;
