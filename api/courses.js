const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { CourseSchema, insertNewCourse, getCourseById, getCoursesPage } = require('../models/course');
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
  console.log('****\n userrole: '  + JSON.stringify(req.user) + '\n****');
  const user = await getUserById(req.user.sub);
  console.log('****\n user: '+JSON.stringify(user)+'\n****');
  console.log('****\n req.body: '+JSON.stringify(req.body)+'\n****');
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
 * Route to fetch info about a specific photo.
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
