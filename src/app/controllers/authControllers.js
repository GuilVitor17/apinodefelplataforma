
const express = require('express');

const bcryptjs = require('bcryptjs');

const User = require('../models/user');

const router = express.Router();

const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth.json')

const crypto = require('crypto');

const sgMail = require('@sendgrid/mail');
const { Console } = require('console');



function generateToken(params = {}) {
    return jwt.sign(params , authConfig.secret,{
        expiresIn:86400
    });
}



router.post('/register', async (req, res) =>{

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


router.post('/authenticate', async (req, res) =>{
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
router.post('/forgot_password', async (req, res) =>{
  
    const { email } = req.body
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)


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

        const msg = {
            to: email, // Change to your recipient
            from: 'contatofelplataforma@gmail.com', // Change to your verified sender
            subject: 'FEL PLATAFORMA',
            text: 'and easy to do anywhere, even with Node.js',
            html: `<h2>Olá - ${email}</h2><br />
            <h3>Esqueceu sua senha? Não tem Problema!</h3><br />
            <strong>Esse é seu código para mudar senha</strong><br />
            <h1>${token}</h1><br />
            <h4>Use esse código para mudar a sua senha na plataforma da (FEL)</h4><br />
            <h5>Depois de 2h o código sera inspirado e você sera forçado a criar outro.</h5><br />`,
          }
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')
              console.log(msg)
            })
            res.status(200).send({msg: 'codigo enviado com sucesso'})
            
           
    } catch (err) {
        console.log(err)

        res.status(400).send({error: 'Error ao recuperar Senha'})
        .catch((error) => {
          console.error(error)
        })
    }
})

router.post('/reset_password', async(req, res) =>{
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

module.exports = app => app.use('/auth', router);