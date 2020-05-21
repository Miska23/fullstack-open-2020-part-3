const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

//! poistaa findOneAndUpdate()`ja `findOneAndDelete() -metodeihin liittyvään varoituksen:
mongoose.set('useFindAndModify', false)

const url = process.env.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, required: true, unique: true },
  number: { type: String, minlength: 8, required: true }
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() //! _id-olio merkkijonoksi ja se olion.id:ksi
    delete returnedObject._id //! ominaisuuden poisto
    delete returnedObject.__v  //! ominaisuuden poisto
  }
})

module.exports = mongoose.model('Person', personSchema)
