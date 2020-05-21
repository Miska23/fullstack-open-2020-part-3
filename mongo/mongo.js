const mongoose = require('mongoose')

const password = process.argv[2]

const url =
  `mongodb+srv://dbMiska:${password}@cluster0-wv3yl.mongodb.net/fso-2020?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: Number
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

if (process.argv.length === 3) {
  Person
  .find({})
  .then(persons => {
    console.log('Phonebook:')
    persons.map(p => console.log(p.name, p.number))
    mongoose.connection.close()
  })
}

if (process.argv.length === 5) {

  //! Kurssimateriaalin malli:
/*   const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  } */
  new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  Person
    .save()
    .then(response => {
      console.log(`added ${response.name} number ${response.number} to phonebook`)
      mongoose.connection.close()
  })
}


