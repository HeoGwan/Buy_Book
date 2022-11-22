const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('passport');


dotenv.config();
const pageRouter = require('./routes/page');
const searchRouter = require('./routes/search');
const addBookRouter = require('./routes/addBook');
const orderRouter = require('./routes/order');
const cartRouter = require('./routes/cart');
const authRouter = require('./routes/auth');
const saveRouter = require('./routes/save');
const infoRouter = require('./routes/info');
const returnRouter = require('./routes/return');
const pointRouter = require('./routes/point');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
passportConfig();
app.set('port', process.env.PORT || 8081);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
sequelize.sync({ force: false })
    .then(() => {
        console.log('DB 연결 성공');
    })
    .catch(err => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/search', searchRouter);
app.use('/addBook', addBookRouter);
app.use('/order', orderRouter);
app.use('/cart', cartRouter);
app.use('/auth', authRouter);
app.use('/save', saveRouter);
app.use('/info', infoRouter);
app.use('/return', returnRouter);
app.use('/point', pointRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url}에 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 서버 대기 중`);
})