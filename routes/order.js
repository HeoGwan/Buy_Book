const express = require('express');
const { Book, Order, User, sequelize, Cart, CartItem, CreditCard, ShippingAddress, Point } = require('../models');
const Op = require('sequelize').Op;
const { isLoggedIn } = require('./middlewares');
const { getCartItem, getCartItems, getUser } = require('../find');

const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => {
    // 바로 구매
    const payType = req.body.payType;
    const bookNumber = req.body.bookNumber;
    const quantity = req.body.quantity;
    let orderBooks = req.body.orderBook;
    if (typeof orderBooks !== typeof []) {
        // orderBooks가 1개일 때
        // 배열로 만듬
        orderBooks = Array(orderBooks);
    }
    // console.log('orderBooks', orderBooks);
    // console.log('orderBooks', typeof orderBooks);

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
                // console.log(address.zipCode);
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
            // 선택한 도서만 구매하도록 한다.
            // orderBooks는 Array 형식, 요소는 string 형식
            const cartItems = [];

            for (let i = 0; i < orderBooks.length; i++) {
                const orderBookNumber = parseInt(orderBooks[i]);
                const cartItem = await getCartItem(req.user.id, orderBookNumber);
                // console.log('await getCartItem(req.user.id, orderBookNumber)', cartItem);
                cartItems.push(cartItem);
                // console.log('cartItems.push(cartItem);', cartItems);
            }

            

            // 모든 도서 한번에 구매
            // const cartItems = await CartItem.findAll({
            //     include: [{
            //         model: Cart,
            //         where: {
            //             user_id: req.user.id,
            //         }
            //     }, {
            //         model: Book,
            //     }],
            // });

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

                // 적립금이 얼마나 있는지 알려주기 위해 가져옴
                const user = await getUser(req.user.id);

                // console.log(cartItems);
                res.render('orderView', { cartItems, cardInfos, addressInfos, user });
            }
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/pay', async (req, res, next) => {
    // 주문 작성
    let bookNumbers = req.body.bookNumber;
    if (typeof bookNumbers !== typeof []) {
        // orderBooks가 1개일 때
        // 배열로 만듬
        bookNumbers = Array(bookNumbers);
    }
    // console.log('/pay bookNumbers', bookNumbers);
    // 도서 구매 수량
    const quantity = req.body.quantity;
    const payWith = req.body.payWith;

    let totalPrice = req.body.totalPrice;
    
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

    // 사용 적립금 가져오기
    const usePoint = req.body.usePoint;

    let point = 0;

    // 주문을 찾아서 해당 주문에 주문 정보 넣은 후 결제 처리
    const transaction = await sequelize.transaction();
    try {
        console.log('userPoint', usePoint);
        // 적립금 관련 정보를 가지고 오기 위해 사용
        const user = await getUser(req.user.id);

        let payPrice = totalPrice;

        // 적립금 사용 부분 -> 적립금 포인트가 10 이상일 경우
        // 적립금 포인트 10 깎고 적립금 사용 가능
        // (구매총액 - 적립금사용액)의 10% 적립

        if (user.pointStamp < 10 && usePoint > 0) {
            return res.send('<script>alert("적립스탬프가 10개 이상이 되어야 적립금을 사용할 수 있습니다.."); \
            window.location = "/";</script>');
        } else {
                // 적립금은 1000원 단위로만 사용 가능
            if ((usePoint % 1000) != 0) {
                // 500원 단위로 사용 시
                return res.send('<script>alert("적립금은 1000원 단위로 사용하실 수 있습니다."); \
                    window.location = "/";</script>');
            }

            // 결제 금액은 총 주문 금액에 적립금사용액을 뺀 만큼
            payPrice -= usePoint;

            // 적립 스탬프 사용
            console.log('user.pointStamp', user.pointStamp);
            let pointStamp = (parseInt(user.pointStamp) - 10);
            console.log(pointStamp);
            
            point = user.point - usePoint;

            await User.update({
                point,
            }, {
                where: {
                    id: req.user.id,
                }
            });

            await Point.update({
                user_id: null,
            }, {
                where: {
                    user_id: req.user.id,
                }
            });

            // 적립금 사용에 대한 내용 저장
            await Point.create({
                date: new Date(),
                content: '주문',
                price: -usePoint,
                user_id: req.user.id,
                had_user_id: req.user.id,
            })
        }

        // 적립 내용 구형
        // 적립 할 시 이전에 있던건 히스토리로 남긴다.

        // 적립 포인트
        // 적립금 적립
        const curUser = await getUser(req.user.id);
        const getPoint = (totalPrice - usePoint) / 10;
        const plusPoint = parseInt(curUser.point) + parseInt((totalPrice - usePoint) / 10);
        const pointStamp = quantity;

        await User.update({
            point: plusPoint,
            pointStamp,
        }, {
            where: {
                id: req.user.id,
            }
        });
        // 적립금 사용에 대한 내용 저장
        await Point.create({
            date: new Date(),
            content: '주문',
            price: getPoint,
            user_id: req.user.id,
            had_user_id: req.user.id,
        })


        // 이전 주문과 회원 간의 연결 끊음
        await Order.update({
            user_id: null,
        }, {
            where: {
                user_id: req.user.id,
            },
        }, { transaction });

        // 새 주문 정보 추가
        const order = await Order.create({
            totalPrice: payPrice,
            creditCardNumber,
            creditCardExpiration,
            creditCardType,
            zipCode,
            basicAddress,
            detailAddress,
            orderDate: new Date(),
            ordered_user_id: req.user.id,
            user_id: req.user.id,
            usePoint, // 적립금사용액 추가
            status: 'ready',
        });

        if (payWith == 'cart') {
            // 장바구니 결제
            for(let i = 0; i < bookNumbers.length; i++) {
                const userPointStamp = await User.findOne({
                    attributes: ['pointStamp'],
                    where: {
                        id: req.user.id,
                    }
                });

                const book = await Book.findOne({
                    where: {
                        number: bookNumbers[i],
                    }
                }, { transaction });

                // 수량 확인
                if (quantity[i] <= book.stock) {
                    // 재고량이 있을 경우
                    book.stock -= quantity[i];
                    book.save({ transaction });

                    order.addBook(book, { through: { quantity: quantity[i] } });


                    // // 주문 완료 시 해당 주문 금액 만큼 적립금스탬프(pointStamp) 증가
                    // 적립금 쌓임
                    let pointStamp = parseInt(userPointStamp.pointStamp) + parseInt(quantity[i]);

                    await User.update({
                        pointStamp,
                    }, {
                        where: {
                            id: req.user.id,
                        }
                    });

                    // // 적립금 적립에 대한 내용 저장
                    // await Point.create({
                    //     date: new Date(),
                    //     content: '주문',
                    //     price: usePoint,
                    //     user_id: req.user.id,
                    //     had_user_id: req.user.id,
                    // })
                } else {
                    // 재고량이 없을 경우
                    cantOrderBook.push(book.title);
                }
            }
            
            // 카트에 있었던(지금은 제거된) 항목을 제외한 카트 항목 가져오기
            const cartItems = await CartItem.findAll({
                where: {
                    in_cart: 'true',
                },
                include: [{
                    model: Cart,
                    where: {
                        user_id: req.user.id,
                    }
                }, {
                    model: Book,
                }]
            });
            // console.log('cartItems?', cartItems);
            console.log('cartItems.length?', cartItems.length);
            console.log('bookNumbers?', bookNumbers);
            console.log('bookNumbers.length?', bookNumbers.length);
            console.log('cartItems.length - bookNumbers.length?', cartItems.length - bookNumbers.length);
            
            // 해당 도서 카트에서 삭제
            for (let i = 0; i < bookNumbers.length; i++) {
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
                            number: bookNumbers[i],
                        }
                    }]
                });

                await CartItem.update({
                    in_cart: 'false',
                }, {
                    where: {
                        number: removeCartItem.number,
                    },
                    transaction
                });
            };

            if (cartItems.length - bookNumbers.length <= 0) {
                // 모든 카트를 결제한 경우 (카트가 비어있는 경우)
                // 결제 처리 후 새롭게 장바구니를 하나 만들기
                await Cart.update({
                    user_id: null,
                }, {
                    where: {
                        user_id: req.user.id,
                    }
                }, { transaction });

                await Cart.create({
                    user_id: req.user.id,
                    had_user_id: req.user.id,
                    createDate: new Date(),
                });
            }

            await transaction.commit();
            res.redirect('/');
        } else if (payWith == 'none'){
            // 바로 결제
            const book = await Book.findOne({
                where: {
                    number: bookNumbers,
                }
            });

            book.stock -= quantity;
            book.save();

            // order.addBook(book, { through: { quantity } } );

            const userPointStamp = await User.findOne({
                attributes: ['pointStamp'],
                where: {
                    id: req.user.id,
                }
            });

            // 주문 완료 시 해당 주문 금액 만큼 적립금스탬프(pointStamp) 증가
            console.log(quantity);
            // let pointStamp = parseInt(userPointStamp.pointStamp) + parseInt(quantity);

            // await User.update({
            //     pointStamp,
            // }, {
            //     where: {
            //         id: req.user.id,
            //     }
            // });

            // // 적립금 사용에 대한 내용 저장
            // await Point.create({
            //     date: new Date(),
            //     content: '주문',
            //     price: usePoint,
            //     user_id: req.user.id,
            //     had_user_id: req.user.id,
            // })

            res.redirect('/');
        } else {
            throw Error('결제 방법이 이상합니다.');
        }
    } catch (err) {
        console.error(err);
        next(err);
        await transaction.rollback();
    }

    // 결제 처리는 해당 주문 삭제(완료 처리)
})

router.get('/pay/done', async (req, res, next) => {
    // 바로 구매 결제 처리
    // console.log('/pay/done');
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
    // console.log('/pay/done/cart');
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

router.get('/pay/partDone/cart', async (req, res, next) => {
    // 장바구니에서 결제 한 뒤
    // 일부만 결제한 경우
    // console.log('/pay/done/cart');
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