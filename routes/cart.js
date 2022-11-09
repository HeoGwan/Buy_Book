const express = require('express');
const Op = require('sequelize').Op;
const { isLoggedIn } = require('./middlewares');
const { Cart, CartItem, Book, sequelize, User } = require('../models');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const cartItems = await CartItem.findAll({
            include: [{
                model: Cart,
                where: {
                    user_id: req.user.id,
                }
            }, {
                model: Book,
            }],
        });

        console.log(cartItems);
        res.render('cartView', { cartItems });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/', isLoggedIn, async (req, res, next) => {
    console.log('asdf', req.body);

    const bookNumber = req.body.bookNumber;
    const quantity = req.body.quantity;

    const t = await sequelize.transaction();
    try {
        const cart = await Cart.findOne({
            where: {
                user_id: req.user.id,
            },
            include: {
                model: User,
                attributes: ['id'],
            }
        }, { t });

        const book = await Book.findOne({
            where: {
                number: bookNumber,
            },
        }, { t });

        if (book.stock < quantity) {
            return res.send('<script>alert("재고량이 부족하여 장바구니에 담을 수 없습니다."); \
            window.location = document.referrer;</script>');
        }

        cart.addBook(book, { through: { quantity } });
        
        await t.commit();
        res.send('<script>alert("장바구니에 등록되었습니다.");window.location = document.referrer;</script>');
    } catch (err) {{
        console.error(err);
        await t.rollback();
        next(err);
    }}
})

router.post('/remove', async (req, res, next) => {
    const bookNumber = req.body.bookNumber;
    try {
        const removeCartItem = await CartItem.findOne({
            attributes: ['number'],
            include: [{
                model: Cart,
                where: {
                    user_id: req.user.id,
                }
            }, {
                model: Book,
                where: {
                    number: bookNumber,
                }
            }]
        })

        await CartItem.destroy({
            where: {
                number: removeCartItem.number,
            }
        });

        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;