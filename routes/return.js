const express = require('express');
const { getOrderItems, getOrder, getBook, getOrderItem } = require('../find');

const { Cart, CartItem, Book, sequelize, User, Order, OrderItem } = require('../models');
const router = require('./order');

router.get('/', async (req, res, next) => {
    try {
        const orderItems = await getOrderItems(req.user.id);
        const order = await getOrder(req.user.id);

        res.render('returnView', { orderItems, order });
    } catch (err) {
       console.error(err) 
       next(err);
    }
})

router.post('/cancel', async (req, res, next) => {
    try {
        await Order.update({
            status: 'cancel'
        }, {
            where: {
                user_id: req.user.id,
            }
        })

        res.redirect('/return');
    } catch (err) {
       console.error(err) 
       next(err);
    }
})

router.post('/completeDeliever', async (req, res, next) => {
    try {
        await Order.update({
            status: 'completeDeliever'
        }, {
            where: {
                user_id: req.user.id,
            }
        })

        res.redirect('/return');
    } catch (err) {
       console.error(err) 
       next(err);
    }
})

router.post('/all', async (req, res, next) => {
    const returnReason = req.body.returnReason;
    const returnCallDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnCallDate.getDate() + 3);
    try {
        const order = await getOrder(req.user.id);

        const totalPrice = order.totalPrice;

        if (returnReason === 'badBook') {
            // 도서 불량이면 환불 총액: (주문 총액 - 5000)
            const totalReturnPrice = (totalPrice - 5000)

            await Order.update({
                status: 'allReturn',
                returnReason,
                returnCallDate,
                returnDate,
                totalReturnPrice: totalReturnPrice,
            }, {
                where: {
                    user_id: req.user.id,
                }
            });
        } else if (returnReason === 'badBook') {
            // 도서 불량이면 환불 총액: (주문 총액)
            const totalReturnPrice = (totalPrice - 5000)

            await Order.update({
                status: 'allReturn',
                returnReason,
                returnCallDate,
                returnDate,
                totalReturnPrice: totalReturnPrice,
            }, {
                where: {
                    user_id: req.user.id,
                }
            });
        }

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
        console.error(err) 
        next(err);
     }
})

router.post('/part', async (req, res, next) => {
    const returnReason = req.body.returnReason;
    const bookNumber = req.body.bookNumber;
    const returnCallDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnCallDate.getDate() + 3);
    const returnQuantity = parseInt(req.body.quantity);
    try {
        // 일부 수량 반품이면 해당 수량만큼 orderItem에서 깎이고
        // 책은 그만큼 늘어나야 함
        const orderBook = await getBook(bookNumber);
        const bookQuantity = orderBook.stock + returnQuantity;
        Book.update({
            stock: bookQuantity,
        }, {
            where: {
                number: bookNumber,
            }
        })
        
        const totalReturnPrice = returnQuantity * orderBook.price;

        const orderItem = await getOrderItem(req.user.id, bookNumber);
        const orderItemQuantity = orderItem.quantity - returnQuantity;
        await OrderItem.update({
            quantity: orderItemQuantity,
        }, {
            where: {
                book_number: bookNumber,
            }
        });

        // 주문 수정
        await Order.update({
            status: 'partReturn',
            returnReason,
            returnCallDate,
            returnDate,
            totalReturnPrice: totalReturnPrice,
        }, {
            where: {
                user_id: req.user.id,
            }
        });


        res.redirect('/return');
    } catch (err) {
        console.error(err) 
        next(err);
    }
})

module.exports = router;