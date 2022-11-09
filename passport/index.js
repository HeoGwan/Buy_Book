const passport = require('passport');
const local = require('./localStrategy');
const { User } = require('../models');

module.exports = () => {
    passport.serializeUser((user, done) => { // 세션에 아이디로 저장
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => { // 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러오는 것
        User.findOne({ 
            where: { id },
        })
        .then(user => done(null, user))
        .catch(err => done(err));
    });

    local();
}