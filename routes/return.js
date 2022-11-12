const express = require('express');
const { getOrder, getOrderItems } = require('../find');
const { Book, Order } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const orderItems = await getOrderItems(req.user.id);
        const order = await getOrder(req.user.id);

        console.log('1234', order.status);

        res.render('returnView', { orderItems, order }); 
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/cancel', async (req, res, next) => {
    const returnReason = req.body.returnReason;
    try {
        const order = await getOrder(req.user.id);

        if (order.status == 'ready') {
            // order.status = 'cancel';
            // order.save();
            Order.update({
                status: 'cancel'
            }, {
                where: {
                    user_id: req.user.id,
                }
            })
        } else if (order.status == 'cancel') {
            Order.update({
                status: 'return'
            }, {
                where: {
                    user_id: req.user.id,
                }
            })
        } else if (order.status == 'return') {
            Order.update({
                status: 'allReturn',
                returnReason: returnReason,
                returnCallDate: new Date(),
            }, {
                where: {
                    user_id: req.user.id,
                }
            })

            const orders = await getOrderItems(req.user.id);


            for(let i = 0; i < orders.length; i++) {
                const book = await Book.findOne({
                    where: {
                        number: orders[i].book_number,
                    }
                });

                // 재고량이 추가
                book.stock += orders[i].quantity;
                book.save();
            }
        }

        res.redirect('/return');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;