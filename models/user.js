const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const bcrypt = require('bcryptjs');

const UserSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    role: { required: false }
};
exports.UserSchema = UserSchema;

async function createUser(user) {
  userToInsert = user;
  userToInsert.id = null;
  const passwordHash = await bcrypt.hash(userToInsert.password, 8);
  userToInsert.password = passwordHash;
  console.log(userToInsert);
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'INSERT INTO users SET ?',
      userToInsert,
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
exports.createUser = createUser;

function getUserByEmail (email) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [ email ],
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

function getUserById (id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
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

function getStudentCourses (studentId) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT courseId FROM enrollments WHERE studentId = ?',
      [ studentId ],
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

function getInstructorCourses (instructorId) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT id FROM courses WHERE instructorId = ?',
      [ instructorId ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results)
        }
      }
    );
  });
}

exports.getUserDetailById = async function (id) {
  const user = await getUserById(id);
  if (user != null) {
    if (user.role === "student") {
      user.courses = await getStudentCourses(id);
    } else if (user.role === "instructor") {
      user.courses = await getInstructorCourses(id);
    }
  }
  return user;
}

exports.authenticateUser = async function (email, password) {
  const user = await getUserByEmail(email);
  const authenticated = user && await bcrypt.compare(password, user.password);
  if (authenticated) {
    return { id: user.id, email: user.email, role: user.role };
  } else {
    return null;
  }
}
