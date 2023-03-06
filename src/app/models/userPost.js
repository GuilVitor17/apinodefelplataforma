const mongoose = require('../../database')
const bcryipt =  require('bcryptjs')


const UserSchemaPost = new mongoose.Schema({
    name:{
        type: String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
    },
    password:{
        type: String,
        required : true,
        select : false,
    },

});

UserSchemaPost.pre('save', async function(next){
  const hash = await bcryipt.hash(this.password, 10);
  this.password = hash;

  next()
});


const User = mongoose.model('UserPost', UserSchemaPost)

module.exports = User;