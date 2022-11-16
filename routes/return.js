const express = require('express');
const { getOrder, getOrderItems, getBook, getOrderItem } = require('../find');
const { Order, Book, OrderItem, sequelize } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        // 주문 상태와 주문 항목을 전달함
        const order = await getOrder(req.user.id);
        const orderItems = await getOrderItems(req.user.id);

        res.render('returnView', { order, orderItems });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/cancel', async (req, res, next) => {
    try {
        // 주문 상태를 cancel로 변경
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

router.post('/completeDeliver', async (req, res, next) => {
    try {
        // 주문 상태를 completeDeliver 변경
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

router.post('/all', async (req, res, next) => {
    // 반품 요청일
    const returnCallDate = new Date();
    // 반품 사유
    const returnReason = req.body.returnReason;

    const transaction = await sequelize.transaction();
    try {
        // 전체 반품
        // 환불 총액: 주문 총액
        // 반품 사유가 고객 변심이면 주문 총액 - 5000

        const order = await getOrder(req.user.id);

        let totalReturnPrice = 0;
        if (returnReason === 'badBook') {
            totalReturnPrice = order.totalPrice;
        } else if (returnReason === 'changeMind') {
            totalReturnPrice = order.totalPrice - 5000;            
        }

        const returnDate = new Date;
        returnDate.setDate(returnCallDate.getDate() + 3);

        await Order.update({
            returnReason,
            returnCallDate,
            totalReturnPrice,
            returnDate,
            status: 'allReturn',
        }, {
            where: {
                user_id: req.user.id,
            }
        });

        // 재고량 만큼 복귀 -> 여러 주문 항목을 전부 바꿈
        const orderItems = await getOrderItems(req.user.id);

        for(let i = 0; i < orderItems.length; i++) {
            const book = await Book.findOne({
                where: {
                    number: orderItems[i].book_number,
                }
            }, { transaction });

            const returnBookStock = book.stock + orderItems[i].quantity;

            // 재고량 복귀
            await Book.update({
                stock: returnBookStock,
            }, {
                where: {
                    number: orderItems[i].book_number,
                }
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

router.post('/part', async (req, res, next) => {
    // 일부 반품
    // 반품 요청일
    const returnCallDate = new Date();
    // 반품 사유
    const returnReason = req.body.returnReason;
    const returnQuantity = req.body.returnQuantity;
    const returnBookNumber = req.body.returnBookNumber;
    try {
        // 전체 반품

        const book = await getBook(returnBookNumber);

        // 환불 총액: 책 가격 * 반품 수량

        let totalReturnPrice = book.price * returnQuantity;
        if (returnReason === 'changeMind') {
            totalReturnPrice -= 5000;
        }

        const returnDate = new Date;
        returnDate.setDate(returnCallDate.getDate() + 3);

        await Order.update({
            returnReason,
            returnCallDate,
            totalReturnPrice,
            returnDate,
            returnQuantity,
            status: 'partReturn',
        }, {
            where: {
                user_id: req.user.id,
            }
        });

        // 책 한 권만 재고량 복귀
        const orderItem = await getOrderItem(req.user.id, returnBookNumber);

        const returnBookStock = book.stock + orderItem.quantity;

        // 주문 항목 수량 반품 수량 만큼 깎음
        await OrderItem.update({
            quantity: (orderItem.quantity - returnQuantity),
        }, {
            where: {
                number: orderItem.number,
            }
        });

        // 재고량 복귀
        await Book.update({
            stock: returnBookStock,
        }, {
            where: {
                number: orderItem.book_number,
            }
        })

        res.redirect('/return');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/count', async (req, res, next) => {
    // console.log('/address')
    const bookNumber = req.body.orderBookNumber;
    try {
        const orderItem = await getOrderItem(req.user.id, bookNumber);

        return res.json({ orderItem });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;