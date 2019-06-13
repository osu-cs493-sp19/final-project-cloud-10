const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const {
  CourseSchema,
  insertNewCourse,
  replaceCourseById,
  getCourseById,
  deleteCourseById,
  getCoursesPage,
  getCourseEnrollments,
  enrollStudent,
  unenrollStudent,
  getStudentInfo } = require('../models/course');
const { getUserById } = require('../models/user');

/*
 * Route to return a paginated list of courses.
 */
router.get('/', async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const coursePage = await getCoursesPage(parseInt(req.query.page) || 1);
    coursePage.links = {};
    if (coursePage.page < coursePage.totalPages) {
      coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`;
      coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`;
    }
    if (coursePage.page > 1) {
      coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`;
      coursePage.links.firstPage = '/courses?page=1';
    }
    res.status(200).send(coursePage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching courses list.  Please try again later."
    });
  }
});

/*
 * Route to create a new course.
 */
router.post('/', requireAuthentication, async (req, res) => {
  const user = await getUserById(req.user.sub);
  if (user && req.user.role === 'admin') {  
    if (validateAgainstSchema(req.body, CourseSchema)) {
      try {
        const id = await insertNewCourse(req.body);
        res.status(201).send({
          id: id,
          links: {
            course: `/courses/${id}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting course into DB.  Please try again later."
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


/*
 * Route to update a course.
 */
router.patch('/:id', requireAuthentication, async (req, res, next) => {
  try {
    // make sure token is provided and is valid user
    const user = await getUserById(req.user.sub);
    if (user) {
      try {
        const id = parseInt(req.params.id);
        const existingCourse = await getCourseById(id);
        let isInstructor = (user.role === 'instructor' && existingCourse.instructorId === req.user.sub);
        // check if user is admin or the instructor for the course
        if (req.user.role === 'admin' || isInstructor) {
          if (existingCourse) {
            const updateSuccessful = await replaceCourseById(id, req.body);
            if (updateSuccessful) {
              res.status(200).send({
                links: {
                  course: `/courses/${id}`
                }
              });
            } else {
              next();
            }
          } else {
            next();
          }
        } else {
          res.status(403).send({
            error: "Unauthorized to access the specified resource"
          });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update course.  Please try again later."
        });
      }
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to delete a course.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  const user = await getUserById(req.user.sub);

  try {
    const course = await getCourseById(parseInt(req.params.id));
    let isInstructor = (req.user.role === 'instructor' && course.instructorId === req.user.sub); 
    if (user && (req.user.role === 'admin' || isInstructor)) {
      try {
        const deleteSuccessful = await deleteCourseById(parseInt(req.params.id));
        if (deleteSuccessful) {
          console.log('DELETED course: ' + course.title);
          res.status(204).end();
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to delete course.  Please try again later."
        });
      }
    } else {
      res.status(403).send({
        error: "Unauthorized to delete the specified resource"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch courses.  Please try again later."
    });
  }
});

/*
 * Route to fetch a list of the students enrolled in the Course.
 */
router.get('/:id/students', requireAuthentication, async (req, res, next) => {
  try {
    let course = await getCourseById(parseInt(req.params.id));
    if (req.user != null && (req.user.role == "admin" || req.user.sub == course.instructorId)) {
      
        const id = parseInt(req.params.id);
        result = await getCourseEnrollments(id);
        if (result) {
          res.status(200).send({
            students: result
          });
        } else {
          res.status(404).send({
            error: "Specified course if not found"
          });
        }
      } else {
        res.status(403).send("The request was made by an unauthorized user");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch course.  Please try again later."
      });
    }
});

router.post('/:id/students', requireAuthentication, async (req, res, next) => {
  if (req.user != null && (req.user.role == "admin" || req.user.sub == course.instructorId)) {
    try {
      if (req.body.add || req.body.remove) {
        let cid = parseInt(req.params.id);
        let additions = req.body.add;
        let removals = req.body.remove;
        // Enroll students
        if (additions) {
          for (let i of additions) {
            console.log("Enrolling", i, "in", cid);
            await enrollStudent(i, cid);
          }
        }
        // Unenroll students
        if (removals) {
          for (let i of removals) {
            console.log("Unenrolling", i, "from", cid);
            await unenrollStudent(i, cid);
          }
        }
        res.status(200).send("Success");
      } else {
        res.status(400).send("The request body was either not present or did not contain the appropriate fields.");
      }
    } catch (err) {
      console.error(err);
        res.status(500).send({
          error: "Unable to update enrollments.  Please try again later."
        });
    }
  } else {
    res.status(403).send({
      error: "The request was made by an unauthorized user"
    });
  }
});

/*
 * Route to fetch a csv list of the students enrolled in the Course.
 */
router.get('/:id/roster', requireAuthentication, async (req, res, next) => {
  try {
    if (req.user != null && (req.user.role == "admin" || req.user.sub == course.instructorId)) {
      
        const id = parseInt(req.params.id);
        let studentIds = await getCourseEnrollments(id);
        if (studentIds) {
          let roster = "id, name, email\n";
          for (let i of studentIds) {
            let studInfo = await getStudentInfo(i);
            roster = roster + studInfo.id + ", \"" + studInfo.name + "\", \"" + studInfo.email + "\"\n";
          }
            res.set('Content-Type', 'text/csv');
            res.status(200).send(roster);
        } else {
          res.status(404).send({
            error: "Specified course if not found"
          });
        }
      } else {
        res.status(403).send("The request was made by an unauthorized user");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch course.  Please try again later."
      });
    }
});

module.exports = router;
