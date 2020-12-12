const server = require('express')()
const envvar = require('envvar')
const compression = require('compression')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const { Future, Maybe } = require('exalted.future')
const { query, pool } = require('./pool')

delete Array.prototype.toJSON

// Morgan middleware
const originalSend = server.response.send

server.response.send = function sendOverWrite(body) {
  originalSend.call(this, body)
  this.__custombody__ = body
}

morgan.token(
  'res-body',
  (_req, res) => (res.statusCode > 399 ? JSON.stringify(res.__custombody__) : 'OK'))

const format =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent" ":res-body"'

// Middleware
server.use(morgan(format))
server.use(bodyParser.json())
server.use(bodyParser.text())
server.use(compression())
server.use(helmet())
server.disable('x-powered-by')
server.use(cors())

const env = envvar.string('ENV', 'env not set')
const git_version = envvar.string('GIT_VERSION', 'version not set')

server.get('/healthz', async (_, res, next) =>
  Future.all(
    Future((no, ok) => pool.getConnection((err, con) => (err ? no(err) : (con.release(), ok(con)))))
  ).cata({
    Left: () => next('Err'),
    Right: () => res.send(`Ok, ${env}, ${git_version}, ${Date.now()}`)
  }))

const types = {
  aim: b =>
    query(
      `INSERT INTO cheetah.aim (experiment, allocation, variants, variant, anonymous_id, headersj, traits) VALUES (?,?,?,?,?,?,?);`,
      [
        b.experiment,
        b.allocation,
        JSON.stringify(b.variants),
        b.variant,
        b.anonymousId,
        b.headers,
        JSON.stringify(b.traits)
      ]
    ),
  launch: b =>
    query(
      `INSERT INTO cheetah.launch (experiment, variant, anonymous_id, headersj, traits) VALUES (?,?,?,?,?);`,
      [b.experiment, b.variant, b.anonymousId, b.headers, JSON.stringify(b.traits)]
    ),
  hit: b =>
    query(
      `INSERT INTO cheetah.hit (experiment, variant, anonymous_id, headersj, traits) VALUES (?,?,?,?,?);`,
      [b.experiment, b.variant, b.anonymousId, b.headers, JSON.stringify(b.traits)]
    ),
  default: b => Left(`Unknown type: ${JSON.stringify(b)}`)
}

server.post('/m', (req, res) =>
  Maybe(req.body)
    .chain(b => (types[b.type] || types.default)({...b, headers: JSON.stringify( req.headers)}))
    .cata({
      Left: err => (console.error('Error inserting aim. ', err), res.json({ message: 'Ok' })),
      Right: data => (
        console.log('Insert aim succeeded. ', data.message), res.json({ message: 'Ok' }))
    }))

server.post('/a', (req, res) =>
  Maybe(req.body)
    .chain(b =>
      query(
        `INSERT INTO cheetah.aim (experiment, allocation, variants, anonymous_id, headers) VALUES (?,?,?,?,?);`,
        [
          b.experiment,
          b.allocation,
          JSON.stringify(b.variants),
          b.anonymousId,
          JSON.stringify(req.headers)]
      ))
    .cata({
      Left: err => (console.error('Error inserting aim. ', err), res.json({ message: 'Ok' })),
      Right: data => (
        console.log('Insert aim succeeded. ', data.message), res.json({ message: 'Ok' }))
    }))

server.post('/l', (req, res) =>
  Maybe(req.body)
    .chain(b =>
      query(
        `INSERT INTO cheetah.launch (experiment, variant, anonymous_id, headers) VALUES (?,?,?,?);`,
        [b.experiment, b.variant, b.anonymousId, JSON.stringify(req.headers)]
      ))
    .cata({
      Left: err => (console.error('Error inserting launch. ', err), res.json({ message: 'Ok' })),
      Right: data => (
        console.log('Insert launch succeeded. ', data.message), res.json({ message: 'Ok' }))
    }))

server.post('/h', (req, res) =>
  Maybe(req.body)
    .chain(b =>
      query(
        `INSERT INTO cheetah.hit (experiment, variant, anonymous_id, headers) VALUES (?,?,?,?);`,
        [b.experiment, b.variant, b.anonymousId, JSON.stringify(req.headers)]
      ))
    .cata({
      Left: err => (console.error('Error inserting hit. ', err), res.json({ message: 'Ok' })),
      Right: data => (
        console.log('Insert hit succeeded. ', data.message), res.json({ message: 'Ok' }))
    }))

// Error handling
server.use((err, req, res, next) => {
  console.error(err)

  switch (err.code) {
    case 'ER_BAD_NULL_ERROR':
      res.status(400).json({ message: 'ER_BAD_NULL_ERROR' })
    case 'ER_BAD_FIELD_ERROR':
      res.status(400).json({ message: 'ER_BAD_FIELD_ERROR' }) // return just the key instead of stack "ER_BAD_FIELD_ERROR"
    case 'ER_DUP_ENTRY':
      res.status(409).json({ message: 'ER_DUP_ENTRY' })
    case 'ER_NOT_FOUND':
      res.status(404).json({ message: 'ER_NOT_FOUND' })
    case 'ER_SIGNAL_EXCEPTION':
      res.status(400).json({ message: err.message })
    default:
      res.status(500).json({ message: 'Something went wrong' })
  }
})

// Server Listen
server.listen(9090)
