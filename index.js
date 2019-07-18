require('dotenv').config()

const fastify = require('fastify')({ logger: true })
const Datastore = require('nedb')
const db = new Datastore()
const jwt = require('jsonwebtoken')
const cors = require('cors')

fastify.use(cors())

fastify.post('/api/auth', {
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          token: { type: 'string' },
        },
      },
    },
  },
  handler: (req, res) => {
    jwt.sign(
      {
        email: req.body.email,
      },
      process.env.SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.log(err)
          return res.status(500).send({ message: 'Something went wrong' })
        }
        res.send({
          message: 'Authenticated Successfully!',
          token,
        })
      }
    )
  },
})

fastify.get('/api/users', {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
      },
    },
  },
  handler: (req, res) => {
    db.find({}, (err, docs) => {
      if (err) {
        console.log(err)
        return res.send(err)
      }
      console.log(docs)
      res.send(docs)
    })
  },
})

fastify.post('/api/users', {
  schema: {
    body: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
      required: ['firstName', 'lastName'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      },
    },
  },
  handler: (req, res) => {
    console.log(req.body)
    db.insert(req.body, (err, doc) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err)
      }
      console.log('done')
      res.send(doc)
    })
  },
})

const start = async () => {
  try {
    await fastify.listen(process.env.PORT || 3000, '0.0.0.0')
    console.log(
      `Server listening on: http://${fastify.server.address().address}:${
        fastify.server.address().port
      }`
    )
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

start()
