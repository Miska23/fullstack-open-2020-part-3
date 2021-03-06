const express = require('express')
const app = express()

require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

//! oma custom token
morgan.token('requestBody', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return '- request does not have a body'
  }
})

morgan((tokens, req, res) => {
  return [
    tokens.requestBody(req, res),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})

//! määrätään järjestys jossa tokenien tiedot näytetään
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestBody')
)

app.use(express.static('build'))

app.use(express.json())

app.use(cors())

app.get('/info', (req, res) => {
  Person.find().estimatedDocumentCount().then(count => {
    console.log('count is: ', count)
    res.send(`<p>Phonebook has info for ${count} people.</p> <p>${new Date}</p>`)
  })
})

//? tälle myös next erroreita varten?
app.get('/api/persons', (req, res) => {
  console.log('from getAll / 1')
    Person.find({}).then(persons => {
      console.log('from getAll / 2, find started')
      res.json(persons)
      console.log('from getAll / 3, find resolved, persons is: ', persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
    console.log('from getOne / 1, person is: ', person)
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()//! jos id ok mutta ei löydy (selaimessa: 'ei löydy')
    }
  })
  .catch(error => next(error))
})

app.post('/api/persons/', (req, res, next) => {

  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      console.log('from app.post / 4 / .then started')
      res.json(savedPerson)
      console.log('from app.post / 4 / .then resolved, savedPerson is: ', savedPerson)
    })
    .catch(error => next(error)) //! error on koko virheolio
  })

//! fronttia voisi muokata mallivastauksen mukaan siten että
//! nimi tulee olem. olevasta henkilöstä eikä kentästä
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  console.log('from updateOne / 1, req.body is: ', req.body)

  //! ei Person-kontruktorilla!
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { runValidators: true, context: 'query', new: true })
    .then(updatedPerson => {
      console.log('from updateOne / 2, updatedPerson is: ', updatedPerson)
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  console.log('from deleteOne / 1, req.params is: ', req.params)
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      console.log('from deleteOne / 2 / .then, result is: ', result)
      if (result) {
        res.status(204).end()
      } else { //! tämä vie frontissa .catchiin
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

//! jos ei löydy reittiä (lähinnä GET?)
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  //! node-konsoliin oletusvirhe
  console.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ err: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ err: err.message })
  }
  //! jos virhe ei ole CastError, virhe menee Expressin oletusvirheidenkäsittelijälle
  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})