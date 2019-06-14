const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

function removeUploadedFile (file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const assignmentTypes = {
    'application/pdf': 'pdf',
  };

  const upload = multer({
    storage: multer.diskStorage({
      destination: `${__dirname}/../uploads`,
      filename: (req, file, callback) => {
        const basename = crypto.pseudoRandomBytes(16).toString('hex');
        const extension = assignmentTypes[file.mimetype];
        callback(null, `${basename}.${extension}`);
      }
    }),
    fileFilter: (req, file, callback) => {
      callback(null, !!assignmentTypes[file.mimetype])
    }
  });

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

const {
    AssignmentSchema,
    insertNewAssignment,
    getAssignments,
    getAssignmentById,
    getEnrollmentByCourseIdStudentId,
    updateAssignment,
    deleteAssignmentById,
    insertNewSubmission,
    getAssignmentSubmissionsByAssignmentId,
    getSubmissionsPage,
    getCourseByAssignmentId
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

router.patch('/:id', requireAuthentication, async (req, res) => {
  const user = await getUserById(req.user.sub);
  const assign = await getAssignmentById(req.params.id)

  const course = await getCourseById(assign.courseId)
  //console.log(user);
  //console
 // console.log(assign);
  //console.log(course);
  if (user && req.user.role === 'admin' || user && req.user.role === 'instructor' && user.id === course.instructorId){
   // if (validateAgainstSchema(req.body, AssignmentSchema)) {
  if(assign){
    if (req.body.courseId || req.body.title || req.body.points || req.body.due) {
      try {
        const id = await updateAssignment(req.params.id, req.body);
        console.log(assign);
        res.status(200).send({
          id: id,
          links: {
            assignment: `/assignments/${id}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error updating assignment in DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid assignment object"
      });
    }
  }else {
      res.status(404).send({
        error: "Specified assignment id not found"
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to insert the specified resource"
    });
  }
});

router.delete('/:id', requireAuthentication, async (req, res) => {
    const user = await getUserById(req.user.sub);
    const assign = await getAssignmentById(req.params.id)

    const course = await getCourseById(assign.courseId)
    //console.log(user);
    //console
   // console.log(assign);
    console.log(course);
    if (user && req.user.role === 'admin' || user && req.user.role === 'instructor' && user.id === course.instructorId){
     // if (validateAgainstSchema(req.body, AssignmentSchema)) {
      if (assign) {
        try {
          const finish = await deleteAssignmentById(req.params.id);
          console.log(assign);
          res.status(204).send();
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Unable to delete assignment. Try again later."
          });
        }
      } else {
        res.status(404).send({
          error: "Specified assignment $req.params.id not found"
        });
      }
    } else {
      res.status(403).send({
        error: "Unauthorized to insert the specified resource"
      });
    }
  });

router.get('/:id/submissions', requireAuthentication, async (req, res, next) => {
  const course = await getCourseByAssignmentId(req.params.id);
  if (req.user && (req.user.role == 'admin' || (req.user.role == 'instructor' && req.user.sub == course.instructorId))) {
    const assignment = await getAssignmentById(req.params.id);
    if (assignment) {
      const submissions = await getAssignmentSubmissionsByAssignmentId(parseInt(req.params.id));
      for  (i = 0; i < submissions.length; i++) {
        var basename = crypto.pseudoRandomBytes(16).toString('hex');
        var extension = "pdf";
        var filename = `${basename}.${extension}`;
        var filepath = `./downloads/${filename}`;

        var writableStream = fs.createWriteStream(filepath);
        writableStream.write(submissions[i].file);
        writableStream.end();

        submissions[i].file = filepath;
      }
      res.status(200).send(submissions);
    } else {
      res.status(404).send({
        error: "Specified Assignment `id`` not found"
      });
    }
  } else {
    res.status(403).send({
      error: "The request was not made by an authenticated User"
    });
  }
});

router.post('/submissions', requireAuthentication, upload.single('assignment'), async (req, res, next) => {
    var timestamp = new Date();

    if (req.file && req.body && req.body.studentId && req.body.assignmentId) {
      const course = await getCourseByAssignmentId(req.body.assignmentId);
      if (req.user.role == 'admin' || (req.user.role == 'instructor' && req.user.sub == course.instructorId) || (req.user.role == 'student' && req.user.sub == req.body.studentId)) {
        const assignment = await getAssignmentById(req.body.assignmentId);
        const due = new Date(assignment.due);
        console.log(due);
        if (assignment) {
          const enrollment = await getEnrollmentByCourseIdStudentId(assignment.courseId, req.body.studentId);
          if (enrollment) {
            if (timestamp <= due) {
              timestamp = timestamp.toISOString();
              try {
                const data = fs.readFileSync(req.file.path);

                console.log(req.file);
                console.log(data);

                const id = await insertNewSubmission(req.body.studentId, req.body.assignmentId, timestamp, data);
                await removeUploadedFile(req.file);

                res.status(201).send({
                  _id: id
                });
              } catch (err) {
                next(err);
              }
            } else {
              res.status(404).send({
                error: "The submission window for this assignment has closed"
              });
            }
          } else {
            res.status(403).send({
              error: "Submission can not be approve because student is not enroll in the course"
            });
          }
        } else {
          res.status(404).send({
            error: `Specified assignment id does not exist`
          });
        }
      } else {
        res.status(403).send({
          error: "The request was not made by an authenticated user"
        });
      }
    } else {
      res.status(400).send({
        error: "The request body was either not present or did not contain a valid Submission object"
      });
    }
});

module.exports = router;
