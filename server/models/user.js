const mongoose = require('mongoose');
const encryptAES256CTR = require('../helpers/encryptAES256CTR');
let Schema = mongoose.Schema;
const URL = 'mongodb://localhost:27017/learning-ecommerce'
mongoose.Promise = global.Promise;
mongoose.connect(URL);

let userSchema = new Schema({
  'username': {
    type: String,
    required: true,
    unique: true
  },
  'password': {
    type: String,
    required: true
  },
  'fullname': {
    type: String,
    required: true
  },
  'role': {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  'createdAt': {
    type: Date,
    default: Date.now
  },
  'updatedAt': {
    type: Date,
    default: Date.now
  }
})

userSchema.pre('save', function(next) {
  this.createdAt = Date.now();
  this.password = encryptAES256CTR(this.password);
  next();
})

userSchema.pre('update', function(next) {
  this.findOne({
      _id: this._conditions._id
    })
    .then(value => {
      let password = encryptAES256CTR(value.password);
      this.updateOne({
          _id: this._conditions._id
        }, {
          password: password,
          updatedAt: Date.now()
        })
        .then(() => {
          next();
        })
        .catch(reason => {
          console.log(reason);
        });
    })
    .catch(reason => {
      console.log(reason);
    })
})

module.exports = mongoose.model('User', userSchema);
