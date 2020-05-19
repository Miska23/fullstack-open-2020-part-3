const express = require('express')
const app = express()

const morgan = require('morgan');
const cors = require('cors')

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
);

app.use(express.static('build'))

app.use(express.json())

app.use(cors())

let persons = [
  { 
    name: "Arto Hellas", 
    number: "040-123456",
    id: 1
  },
  { 
    name: "Ada Lovelace", 
    number: "39-44-5323523",
    id: 2
  },
  { 
    name: "Dan Abramov", 
    number: "12-43-234345",
    id: 3
  },
  { 
    name: "Mary Poppendieck", 
    number: "39-23-6423122",
    id: 4
  }

]

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people.</p> <p>${new Date}</p>`);
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const foundPerson = persons.find(person => person.id === id);

  if (foundPerson) {
    res.json(foundPerson);
  } else {
    res.status(200).end();
  }
})

app.post('/api/persons/', (req, res) => {

  const body = req.body;

  console.log('from app.post / 1, body is', body);
  
  if (!body.name) {
    return res.status(400).json({
      error: 'name is missing'
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: 'number is missing'
    })
  }

  //! jos ei löydy, arvoksi tulee undefined joka on falsy
  //! jos löytyy, arvoksi tulee löydetty olio joka on aina truthy
  const nameAlreadyExists = persons.find(person => person.name === body.name)

  console.log('from app.post / 2, nameAlreadyExists is', nameAlreadyExists);

  if (nameAlreadyExists) {
    return res.status(201).json({
      error: `name ${body.name} is already in the phonebook`
    })
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: Number(Math.random().toFixed(4)),
  }

  console.log('from app.post / 3, newPerson is', newPerson);

  persons = persons.concat(newPerson);
  
  console.log('from app.post / 4, persons is', persons);

  res.json(newPerson);

})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  console.log('from app.delete / 1 id is ', id);
  
  persons = persons.filter(person => person.id !== id);

  console.log('from app.delete / 2 persons is now', persons);


  res.status(204).end();
  
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})