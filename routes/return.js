const express = require('express');
const { getOrder, getOrderItems, getBook, getOrderItem } = require('../find');
const { Order, sequelize, Book, OrderItem } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const order = await getOrder(req.user.id);
        const orderItems = await getOrderItems(req.user.id);

        res.render('returnView', { orderItems, order });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/all', isLoggedIn, async (req, res, next) => {
    const returnCallDate = new Date();
    const returnReason = req.body.returnReason;

    const transaction = await sequelize.transaction();
    try {
        // 주문 상태 변경
        // 환불 총액
        // 도서 불량 -> 주문 총액
        // 고객 변심 -> 주문 총액 - 5000
        const order = await getOrder(req.user.id);

        let totalReturnPrice = 0;

        if (returnReason === 'badBook') {
            totalReturnPrice = order.totalPrice;
        } else if (returnReason === 'changeMind') {
            totalReturnPrice = order.totalPrice - 5000;
        }

        // 환불일자: 반품요청일 + 3일
        const returnDate = new Date();
        returnDate.setDate(returnCallDate.getDate() + 3);

        await Order.update({
            status: 'allReturn',
            returnCallDate,
            returnReason,
            totalReturnPrice,
            returnDate,
        }, {
            where: {
                user_id: req.user.id,
            },
            transaction,
        });

        // 재고량 복귀
        // 모든 주문 항목에 있는 책 변경 및 주문 항목에 반품 수량 추가
        const orderItems = await getOrderItems(req.user.id);

        let bookStock = 0;

        for(let i = 0; i < orderItems.length; i++) {
            const book = await Book.findOne({
                where: {
                    number: orderItems[i].book_number,
                }
            }, { transaction });

            bookStock = book.stock + orderItems[i].quantity;

            await Book.update({
                stock: bookStock,
            }, {
                where: {
                    number: orderItems[i].book_number,
                },
                transaction,
            })

            // 반품 수량 추가
            await OrderItem.update({
                returnQuantity: orderItems[i].quantity,
            }, {
                where: {
                    number: orderItems[i].number,
                },
                transaction,
            })
        }

        await transaction.commit();
        res.redirect('/return');
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        next(err);
    }
})

router.post('/part', isLoggedIn, async (req, res, next) => {
    const returnCallDate = new Date();
    const returnReason = req.body.returnReason;
    const returnQuantity = req.body.returnQuantity;
    const returnBookNumber = parseInt(req.body.returnBookNumber);

    const transaction = await sequelize.transaction();
    try {
        // 주문 상태 변경
        // 환불 총액: 반품할 책 가격 * 반품 수량
        const returnBook = await getBook(returnBookNumber);
        
        let totalReturnPrice = returnBook.price * returnQuantity;
        
        const order = await getOrder(req.user.id);
        
        // 도서 불량 -> 주문 총액
        // 고객 변심 -> 주문 총액 - 5000
        if (returnReason === 'badBook') {
            totalReturnPrice = order.totalPrice;
        } else if (returnReason === 'changeMind') {
            totalReturnPrice = order.totalPrice - 5000;
        }


        // 환불일자: 반품요청일 + 3일
        const returnDate = new Date();
        returnDate.setDate(returnCallDate.getDate() + 3);

        await Order.update({
            status: 'partReturn',
            returnCallDate,
            returnReason,
            totalReturnPrice,
            returnDate,
        }, {
            where: {
                user_id: req.user.id,
            },
            transaction,
        });

        // 재고량 복귀
        // 해당 주문 항목에 있는 책 재고량 변경 및 주문 항목에 반품 수량 추가
        const orderItem = await getOrderItem(req.user.id, returnBookNumber);

        if (orderItem.quantity < returnQuantity || 
            returnQuantity < 0) {
            return res.send('<script>alert("수량보다 많이 반품할 수 없습니다."); \
            window.location = document.referrer;</script>');
        }

        let bookStock = 0;

        bookStock = returnBook.stock + returnQuantity;

        await Book.update({
            stock: bookStock,
        }, {
            where: {
                number: returnBook.number,
            },
            transaction,
        })

        // 반품 수량 추가
        await OrderItem.update({
            returnQuantity,
        }, {
            where: {
                number: orderItem.number,
            },
            transaction,
        })

        await transaction.commit();
        res.redirect('/return');
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        next(err);
    }
})

router.post('/cancel', isLoggedIn, async (req, res, next) => {
    try {
        // 주문 상태를 주문 취소로 변경
        await Order.update({
            status: 'cancel'
        }, {
            where: {
                user_id: req.user.id,
            }
        });

        res.redirect('/return');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/completeDeliver', isLoggedIn, async (req, res, next) => {
    try {
        // 주문 상태를 주문 취소로 변경
        await Order.update({
            status: 'completeDeliver'
        }, {
            where: {
                user_id: req.user.id,
            }
        });

        res.redirect('/return');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;