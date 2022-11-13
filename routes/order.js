const express = require('express');
const { Book, Order, User, sequelize, Cart, CartItem, CreditCard, ShippingAddress } = require('../models');
const Op = require('sequelize').Op;
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => {
    // 바로 구매
    const payType = req.body.payType;
    const bookNumber = req.body.bookNumber;
    const quantity = req.body.quantity;

    try {
        // 신용카드 정보랑 배송지 정보 가져오기
        const creditCardInfo = await CreditCard.findAll({
            where: {
                user_id: req.user.id,
            }
        });
        
        let cardInfoIndex = 0;
        let cardInfos = [];

        if (creditCardInfo !== null || creditCardInfo !== undefined) {
            creditCardInfo.forEach(card => {
                const cardInfo = {};
                cardInfo.index = (++cardInfoIndex);
                cardInfo.cardNumber = card.number;
                cardInfos.push(cardInfo);
            })
        }

        const shippingAddressInfos = await ShippingAddress.findAll({
            where: {
                user_id: req.user.id,
            }
        });

        let addressIndex = 0;
        let addressInfos = [];

        if (shippingAddressInfos !== null || shippingAddressInfos !== undefined) {
            shippingAddressInfos.forEach(address => {
                console.log(address.zipCode);
                const addressInfo = {};
                addressInfo.index = (++addressIndex);
                addressInfo.zipCode = address.zipCode;
                addressInfos.push(addressInfo);
            })
        }

        if (payType == 'notCart') {
            // 해당 책을 찾아서 타이틀, 가격, 이미지소스만 꺼내고
            // orderItems에 quantity랑 같이 해서 orderView로 보낸다.
            // 주문에 넣는건 orderView에서 구매하기 눌렀을 때 만듬
            const book = await Book.findOne({
                attributes: ['number', 'title', 'price', 'imageSource', 'stock'],
                where: {
                    number: bookNumber,
                }
            });

            if (book.stock < quantity) {
                return res.send('<script>alert("재고량이 부족하여 주문하실 수 없습니다."); \
                window.location = document.referrer;</script>');
            }

            res.render('orderView', { book, quantity, cardInfos, addressInfos });
        } else if (payType == 'cart') {
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

            if (cartItems.length == 0) {
                res.send('<script>alert("장바구니에 아무것도 담겨있지 않습니다.");window.location = document.referrer;</script>');
            } else {
                cartItems.forEach(cartItem => {
                    if (cartItem.Book.stock < quantity) {
                        const title = cartItem.Book.title;
                        return res.send(`<script>alert("${title}의 재고량이 부족하여 주문하실 수 없습니다."); \
                        window.location = document.referrer;</script>`);
                    }
                })

                console.log(cartItems);
                res.render('orderView', { cartItems, cardInfos, addressInfos });
            }
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/pay', async (req, res, next) => {
    // 주문 작성
    const bookNumbers = req.body.bookNumber;
    const quantity = req.body.quantity;
    const payWith = req.body.payWith;

    const totalPrice = req.body.totalPrice;
    
    // 신용카드
    const cardNumbers = req.body.cardNumber;
    let creditCardNumber = '';
    cardNumbers.forEach(number => {
        creditCardNumber += number;
    });
    
    const creditCardExpirationDay = req.body.expirationDay;
    const creditCardExpirationYear = req.body.expirationYear;
    const creditCardExpiration = creditCardExpirationDay + creditCardExpirationYear;
    const creditCardType = req.body.creditCardType;
    
    // 배송지
    const zipCode = parseInt(req.body.zipCode);
    const basicAddress = req.body.basicAddress;
    const detailAddress = req.body.detailAddress;

    let cantOrderBook = [];

    // 주문을 찾아서 해당 주문에 주문 정보 넣은 후 결제 처리
    try {
        console.log(req.user.id);

        // 이전 주문과 회원 간의 연결 끊음
        Order.update({
            user_id: null,
        }, {
            where: {
                user_id: req.user.id,
            },
        });

        // 새 주문 정보 추가
        const order = await Order.create({
            totalPrice,
            creditCardNumber,
            creditCardExpiration,
            creditCardType,
            zipCode,
            basicAddress,
            detailAddress,
            user_id: req.user.id,
            orderDate: new Date(),
            ordered_user_id: req.user.id,
        });

        if (payWith == 'cart') {
            // 장바구니 결제
            for(let i = 0; i < bookNumbers.length; i++) {
                const book = await Book.findOne({
                    where: {
                        number: bookNumbers[i],
                    }
                });

                // 수량 확인
                if (quantity[i] <= book.stock) {
                    // 재고량이 있을 경우
                    book.stock -= quantity[i];
                    book.save();

                    order.addBook(book, { through: { quantity: quantity[i] } } );
                } else {
                    // 재고량이 없을 경우
                    cantOrderBook.push(book.title);
                }
            }
            res.redirect('/order/pay/done/cart')
        } else if (payWith == 'none'){
            // 바로 결제
            const book = await Book.findOne({
                where: {
                    number: bookNumbers,
                }
            });

            book.stock -= quantity;
            book.save();

            order.addBook(book, { through: { quantity } } );
            res.redirect('/order/pay/done');
        } else {
            throw Error('결제 방법이 이상합니다.');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }

    // 결제 처리는 해당 주문 삭제(완료 처리)
})

router.get('/pay/done', async (req, res, next) => {
    // 바로 구매 결제 처리
    console.log('/pay/done');
    try {
        // 결제 처리 후 메인 페이지로 이동
        // Order.update({
        //     user_id: null,
        // }, {
        //     where: {
        //         user_id: req.user.id,
        //     },
        // });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/pay/done/cart', async (req, res, next) => {
    // 장바구니에서 결제 한 뒤
    console.log('/pay/done/cart');
    try {
        // 결제 처리 후 새롭게 장바구니를 하나 만들기
        Cart.update({
            user_id: null,
        }, {
            where: {
                user_id: req.user.id,
            }
        });

        await Cart.create({
            user_id: req.user.id,
            had_user_id: req.user.id,
            createDate: new Date(),
        });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;