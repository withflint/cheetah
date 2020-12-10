const envvar = require('envvar')
const { Future } = require('exalted.future')
const mysql = require('mysql')

// Sql Configuration
const pool = mysql.createPool({
  host: envvar.string('SQLHOST'),
  user: envvar.string('SQLUSER'),
  password: envvar.string('SQLPASS'),
  database: envvar.string('SQLDATABASE'),
  multipleStatements: true
})

const query = (statement, values) =>
  Future((err, ok) =>
    pool.getConnection(
      (error, connection) =>
        error
          ? err(error)
          : connection.query(
              statement,
              values,
              (error, results) => (connection.release(), error ? err(error) : ok(results)))))

module.exports = {
  pool,
  query
}
