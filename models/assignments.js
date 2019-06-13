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
