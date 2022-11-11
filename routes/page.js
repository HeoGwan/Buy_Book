const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Book, CreditCard, ShippingAddress, Order } = require('../models');
const { getOrder, getOrders } = require('../find');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})

router.get('/', async (req, res, next) => {
    // Book의 리스트를 몇 개 가져와
    // main.html에 보낸다.
    try {
        const books = await Book.findAll({
            order: [
                ['number', 'desc']
            ],
            limit: 10,
        });
        res.render('main', { books });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/book', async (req, res, next) => {
    const bookNumber = req.query.bookNumber;
    try {
        const book = await Book.findOne({
            where: {
                number: bookNumber,
            },
        });

        let canOrder = true;

        if (book.stock <= 0) {
            canOrder = false;
        }

        console.log('book', book);
        return res.render('detailView', { book, canOrder });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('login');
})

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join');
})

router.get('/addBook', (req, res) => {
    res.render('addBook');
})

router.get('/creditCard', async (req, res, next) => {
    try {
        const creditCardInfo = await CreditCard.findOne({
            where: {
                user_id: req.user.id,
            }
        });

        const creditCard = {};
        
        if (creditCardInfo !== null || creditCardInfo !== undefined) {
            creditCard.cardNumber1 = creditCardInfo.number.substr(0, 4);
            creditCard.cardNumber2 = creditCardInfo.number.substr(4, 4);
            creditCard.cardNumber3 = creditCardInfo.number.substr(8, 4);
            creditCard.cardNumber4 = creditCardInfo.number.substr(12, 4);
            creditCard.expirationDay = creditCardInfo.expiration.substr(0, 2),
            creditCard.expirationYear = creditCardInfo.expiration.substr(2, 2),
            creditCard.cardType = creditCardInfo.type;
        }

        res.json({ creditCard });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/address', async (req, res, next) => {
    console.log('/address')
    try {
        const address = await ShippingAddress.findOne({
            where: {
                user_id: req.user.id,
            }
        });

        return res.json({ address });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;