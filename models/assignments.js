const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true },

};
exports.AssignmentSchema = AssignmentSchema;

function insertNewAssignment(assignment) {
  return new Promise((resolve, reject) => {
    assignment = extractValidFields(assignment, AssignmentSchema);
    assignment.id = null;
    mysqlPool.query(
      'INSERT INTO assignments SET ?',
      assignment,
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
exports.insertNewAssignment = insertNewAssignment;

function getAssignments() {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM assignments',
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}
exports.getAssignments= getAssignments;

function getSubmissionsCount() {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT COUNT(*) AS count FROM submissions',
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

exports.getSubmissionsPage = function (page, assignmentId) {
  return new Promise(async (resolve, reject) => {
    const count = await getSubmissionsCount();
    const pageSize = 10;
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;

    mysqlPool.query(
      'SELECT * FROM submissions WHERE assignmentId = ? ORDER BY id LIMIT ?,?',
      [ assignmentId, offset, pageSize ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            submissions: results,
            page: page,
            totalPages: lastPage,
            pageSize: pageSize,
            count: count
          });
        }
      }
    );
  });
};

exports.getCourseByAssignmentId = function (assignmentId) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM courses WHERE id = (SELECT courseId FROM assignments WHERE id = ?)',
      [ assignmentId ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
};

exports.getAssignmentSubmissionsByAssignmentId = function (assignmentId) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM submissions WHERE assignmentId = ?',
      [ assignmentId ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
};

exports.getEnrollmentByCourseIdStudentId = function (courseId, studentId) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM enrollments WHERE studentId = ? AND courseId = ?',
      [ studentId, courseId ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
};

function getAssignmentById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM assignments WHERE id = ?',
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
exports.getAssignmentById= getAssignmentById;

function updateAssignment(id, assignment) {
  return new Promise((resolve, reject) => {
    assignment = extractValidFields(assignment, AssignmentSchema);
    mysqlPool.query(
      'UPDATE assignments SET ? WHERE id = ?',
      [ assignment, id ],
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
exports.updateAssignment = updateAssignment;

function deleteAssignmentById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM assignments WHERE id = ?',
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
exports.deleteAssignmentById = deleteAssignmentById;

function insertNewSubmission(studentId, assignmentId, timestamp, fileData) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'INSERT INTO submissions (studentId, assignmentId, timestamp, file) values (?, ?, ?, ?)',
      [ studentId, assignmentId, timestamp, fileData ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve("Success");
        }
      }
    );
  });
}
exports.insertNewSubmission = insertNewSubmission;
