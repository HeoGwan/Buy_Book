const express = require('express');
const { getOrderItems, getOrder, getBook } = require('../find');
const { Book, Order, User, sequelize, Cart, CartItem, CreditCard, ShippingAddress } = require('../models');
const Op = require('sequelize').Op;

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const orderItems = await getOrderItems(req.user.id);
        const order = await getOrder(req.user.id);

        console.log(order);
        console.log(order.status);

        res.render('returnView', { orderItems, order })
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/', async (req, res, next) => {
    const returnReason = req.body.returnReason;
    // 반품
    try {
        // 도서 불량이면 환불총액: 주문총액 - 5000원
        // 고객 변심이면 환불총액: 주문총액
        const order = await getOrder(req.user.id);
        const totalPrice = order.totalPrice;

        if (returnReason === 'badBook') {
            const returnPrice = totalPrice - 5000;
           await Order.update({
                totalReturnPrice: returnPrice,
           }, {
            where: {
                user_id: req.user.id,
            }
           })
        } else if (returnReason === 'changeMind') {
            await Order.update({
                 totalReturnPrice: totalPrice,
            }, {
             where: {
                 user_id: req.user.id,
             }
            })
        }
        
        const returnCallDate = new Date();
        const returnDate = new Date();
        returnDate.setDate(returnCallDate.getDate() + 3);

        await Order.update({
            status: 'allReturn',
            returnCallDate: returnCallDate,
            returnReason: returnReason,
            returnDate: returnDate,
        }, {
            where: {
                user_id: req.user.id,
            }
        });

        const orderItems = await getOrderItems(req.user.id);

        for(let i = 0; i < orderItems.length; i++) {
            const book = await Book.findOne({
                where: {
                    number: orderItems[i].book_number,
                }
            });

            // 재고량이 있을 경우
            book.stock += orderItems[i].quantity;
            book.save();
        }

        res.redirect('/return');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/cancel', async (req, res, next) => {
    // 주문 취소
    try {
        await Order.update({
            status: 'cancel',
        }, {
            where: {
                user_id: req.user.id,
            }
        });
        
        res.redirect('/return');
    }  catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/completeDeliever', async (req, res, next) => {
    // 주문 취소
    try {
        await Order.update({
            status: 'completeDeliever',
        }, {
            where: {
                user_id: req.user.id,
            }
        });
        
        res.redirect('/return');
    }  catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/part', async (req, res, next) => {
    const returnReason = req.body.returnReason;
    const orderNumber = req.body.orderNumber;
    const returnQuantity = req.body.quantity;
    // 반품
    try {
        // 도서 불량이면 환불총액: 주문총액 - 5000원
        // 고객 변심이면 환불총액: 주문총액
        const orderItem = await getOrderItem(req.user.id, orderNumber);
        const book = await getBook(orderItem.book_number);
        const totalPrice = book.price * returnQuantity;

        if (returnReason === 'badBook') {
            const returnPrice = totalPrice - 5000;
           await Order.update({
                totalReturnPrice: returnPrice,
           }, {
            where: {
                user_id: req.user.id,
            }
           })
        } else if (returnReason === 'changeMind') {
            await Order.update({
                 totalReturnPrice: totalPrice,
            }, {
             where: {
                 user_id: req.user.id,
             }
            })
        }
        
        const returnCallDate = new Date();
        const returnDate = new Date();
        returnDate.setDate(returnCallDate.getDate() + 3);

        await Order.update({
            status: 'partReturn',
            returnCallDate: returnCallDate,
            returnReason: returnReason,
            returnDate: returnDate,
        }, {
            where: {
                user_id: req.user.id,
            }
        });

        const orderItems = await getOrderItems(req.user.id);

        for(let i = 0; i < orderItems.length; i++) {
            const book = await Book.findOne({
                where: {
                    number: orderItems[i].book_number,
                }
            });

            book.stock += orderItems[i].quantity;
            book.save();
        }

        res.redirect('/return');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;