const express = require('express');

const bcryptjs = require('bcryptjs');

const User = require('../models/userPost');

const router = express.Router();

const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth.json')

const crypto = require('crypto');



function generateToken(params = {}) {
    return jwt.sign(params , authConfig.secret,{
        expiresIn:86400
    });
}


router.post('/registerPost', async (req, res) =>{

    const { email } = req.body

    try {
        if( await User.findOne({ email }))
        return res.status(400).send({msg:'Usuario já existente'});

        const user = await User.create(req.body);

        user.password = undefined

        return res.send({
               user,
               token: generateToken({ id: user.id }),
            })

    } catch (error) {

        return res.status(400).send({msg:'registro falhou'})
        
    }

});


router.post('/authenticatePost', async (req, res) =>{
    const { email,  password} = req.body;

    const  user = await User.findOne({email}).select('+password');

    if(!user)
    return res.status(400).send({error: "Usuario não encontrado"})

    if(!await bcryptjs.compare(password, user.password))
    return res.status(400).send({error: "Senha errada "})

    user.password = undefined


    res.send({ 
         user,
         token: generateToken({ id: user.id }),
        })


});

router.post('/forgot_passwordPost', async (req, res) =>{
  
    const { email } = req.body

    try {
        
        const  user = await User.findOne({ email });

        if(!user)
        return res.status(400).send({error: 'Email não encontrado'})

        const token =  crypto.randomBytes(5).toString('hex')

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
          '$set': {
            passwordResetToken: token,
            passwordResetExpires: now
          }  
        });

         mailer.sendMail({

            to: email,
            from: 'guilvitor05@gmail.com',
            template: 'auth/forgot_password',
            context : { token },

        }, (err) => { 
            if (err)
               return res.status(400).send({error:'Error ao recupera a senha'});

            return res.send();
    })


    } catch (err) {
        console.log(err)

        res.status(400).send({error: 'Error ao recuperar Senha'})
        
    }
});

router.post('/reset_passwordPost', async(req, res) =>{
   const { email, token, password } = req.body;

   try {

    const user = await User.findOne({ email })
    .select('+passwordResetToken passwordResetExpires')

    if(!user)
    return res.status(400).send({error: "Usuario não encontrado"})


    if(token !== user.passwordResetToken)
    return res.status(400).send({error: "Token invalido"})

    const now = new Date();

    if(now > user.passwordResetExpires)
    return res.status(400).send({error: 'Token Inpirado, gere um novo'})


    user.password = password;

    await user.save();

    res.send();

    
   } catch (error) {

    res.status(400).send({error: 'Error ao mudar a senha'})
    
   }
});

module.exports = app => app.use('/authPost', router);