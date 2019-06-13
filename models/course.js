const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const CourseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true }
};
exports.CourseSchema = CourseSchema;

/*
 * Executes a MySQL query to replace a specified photo with new data.
 * Returns a Promise that resolves to true if the photo specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
function replaceCourseById(id, course) {
  return new Promise((resolve, reject) => {
    course = extractValidFields(course, CourseSchema);
    mysqlPool.query(
      'UPDATE courses SET ? WHERE id = ?',
      [ course, id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.replaceCourseById = replaceCourseById;

/*
 * Executes a MySQL query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
function insertNewCourse(course) {
  return new Promise((resolve, reject) => {
    course = extractValidFields(course, CourseSchema);
    course.id = null;
    mysqlPool.query(
      'INSERT INTO courses SET ?',
      course,
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}
exports.insertNewCourse = insertNewCourse;

/*
 * Executes a MySQL query to fetch a course by id.  Returns
 * a Promise that resolves to this record.
 */
function getCourseById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM courses WHERE id = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
}
exports.getCourseById= getCourseById;

/*
 * Executes a MySQL query to fetch the total number of courses.  Returns
 * a Promise that resolves to this count.
 */
function getCoursesCount() {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT COUNT(*) AS count FROM courses',
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      }
    );
  });
}

/*
 * Executes a MySQL query to delete a course specified by its ID.  Returns
 * a Promise that resolves to true if the course specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
function deleteCourseById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM courses WHERE id = ?',
      [ id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.deleteCourseById = deleteCourseById;

/*
 * Executes a MySQL query to return a single page of courses.  Returns a
 * Promise that resolves to an array containing the fetched page of courses.
 */
function getCoursesPage(page) {
  return new Promise(async (resolve, reject) => {
    /*
     * Compute last page number and make sure page is within allowed bounds.
     * Compute offset into collection.
     */
     const count = await getCoursesCount();
     const pageSize = 10;
     const lastPage = Math.ceil(count / pageSize);
     page = page > lastPage ? lastPage : page;
     page = page < 1 ? 1 : page;
     const offset = (page - 1) * pageSize;

    mysqlPool.query(
      'SELECT * FROM courses ORDER BY id LIMIT ?,?',
      [ offset, pageSize ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            courses: results,
            page: page,
            totalPages: lastPage,
            pageSize: pageSize,
            count: count
          });
        }
      }
    );
  });
}
exports.getCoursesPage = getCoursesPage;


/*
 * Returns list of student IDs of students enrolled in given course
 */
function getCourseEnrollments(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT studentId FROM enrollments WHERE courseId = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          let studArr = [];
          for (var i of results) {
            studArr.push(i.studentId);
          }
          resolve(studArr);
        }
      }
    );
  });
}
exports.getCourseEnrollments = getCourseEnrollments;

/*
 * Executes a MySQL query to delete the appropriate row of the 'enrollments' table.  Returns
 * a Promise that resolves to true if the enrollment specified by the student id and the course id
 * existed and was successfully deleted or to false otherwise.
 */
function unenrollStudent(sid, cid) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM enrollments WHERE studentId = ? AND courseId = ?',
      [ sid, cid ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.unenrollStudent = unenrollStudent;

/*
 * Executes a MySQL query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
function enrollStudent(sid, cid) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      "INSERT INTO enrollments SET studentId = ?, courseId = ?, grades = 'A'",
      [ sid, cid ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
}
exports.enrollStudent = enrollStudent;

/*
 * Returns student's name, ID, and email address
 */
function getStudentInfo(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
}
exports.getStudentInfo = getStudentInfo;