const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

const {
    AssignmentSchema,
    insertNewAssignment,
    getAssignments,
    getAssignmentById
    } = require('../models/assignments');
const {
    getCourseById
    } = require('../models/course');
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
    const course = await getCourseById(req.body.courseId)
    //console.log(user);
    //console.log(req.body);
    //console.log(course);
    if (user && req.user.role === 'admin' || user && req.user.role === 'instructor' && user.id === course.instructorId){
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
          error: "Request body is not a valid assignment object"
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
      const assignment = await getAssignmentById(parseInt(req.params.id));
      if (assignment) {
        res.status(200).send(assignment);
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(404).send({
        error: "Specified Assignment $req.param.id not found."
      });
    }
  });

  module.exports = router;
