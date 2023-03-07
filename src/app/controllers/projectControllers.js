const express = require('express');

const authMiddleware = require('../middlewares/auth');
const Projects = require('../models/projects');

const  Project = require('../models/projects')
const  Task = require('../models/task')

const router = express();

router.use(authMiddleware);

router.get('/', async (req, res) =>{

    try {

        const projects = await Projects.find().populate(['user', 'tasks']);

        return res.send({ projects });
        
    } catch (error) {
        return res.status(400).send({ error: 'Error ao carregar projeto' })
        
    }
});

router.get('/:projectId', async (req, res) =>{
    try {

        const projects = await Projects.findById(req.params.projectId).populate(['user', 'tasks']);

        return res.send({ projects });
        
    } catch (error) {
        return res.status(400).send({ error: 'Error ao carregar projeto por Id' })
        
    }
});

router.post('/', async (req, res) => {

    try {

        const { title , description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId});

        await Promise.all(tasks.map(async task =>{

            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);

        }));

        await project.save();

        return res.send({ project })
        
    } catch (error) {

        return res.status(400).send({ error: 'Error ao criar novo projeto' })
        
    }

});

router.put('/:projectId', async (req, res) =>{

    try {

        const { title , description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate( req.params.projectId,{
            title,
            description
        }, {new: true});

        project.tasks = [];
        await Task.remove({ projet: project._id })

        await Promise.all(tasks.map(async task =>{

            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);

        }));

        await project.save();

        return res.send({ project })
        
    } catch (error) {

        return res.status(400).send({ error: 'Error ao atualizar novo projeto' })
        
    }
});

router.delete('/:projectId', async (req, res) =>{
    try {

        const projects = await Projects.findByIdAndRemove(req.params.projectId);

        return res.send({ projects });
        
    } catch (error) {
        return res.status(400).send({ error: 'Error ao remover projeto' })
        
    }
});

module.exports = app => app.use('/projects', router);