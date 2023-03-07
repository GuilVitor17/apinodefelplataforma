const mongoose = require('../../database')
const bcryipt =  require('bcryptjs')


const ProjectsSchema = new mongoose.Schema({
   
    title: {
        type:String,
        require: true,
    },
    description: {
        type:String,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    tasks : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    createdAt : {
        type : Date,
        default : Date.now,
    },
});

const Projects = mongoose.model('Projects', ProjectsSchema)

module.exports = Projects;