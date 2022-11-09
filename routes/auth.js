const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const Cart = require('../models/cart');
const { sequelize } = require('../models');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { id, password, name } = req.body;
    console.log(id, password, name);
    try {
        const exUser = await User.findOne({ where: { id } });
        if (exUser) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            id,
            password: hash,
            name,
        });
        await Cart.create({
            user_id: id,
            createDate: new Date(),
        });
        
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
})

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, loginError => {
            if (loginError) {
                alert(loginError);
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        })
    })(req, res, next);
})

router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect('/');
    })
})

module.exports = router;