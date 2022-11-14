const express = require('express');
const { renderString } = require('nunjucks');
const { CreditCard, ShippingAddress, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    const changeInfo = req.query.changeInfo;
    // console.log(changeInfo)
    try {
        let add = false;
        if (changeInfo == 'address') {
            const zipCode = req.query.zipCode;
            // saveView에 addressInfo정보 뿌려줌
            const addressInfo = await ShippingAddress.findOne({
                where: {
                    zipCode,
                    user_id: req.user.id,
                }
            });
    
            res.render('saveView', { addressInfo });
        } else if (changeInfo == 'creditCard') {
            const cardNumbers = req.query.cardNumber;
            let creditCardNumber = '';
            cardNumbers.forEach(number => {
                creditCardNumber += number;
            });
            // saveView에 cardInfo정보 뿌려줌
            const creditCardInfo = await CreditCard.findOne({
                where: {
                    number: creditCardNumber,
                    user_id: req.user.id,
                }
            });
            
            const cardInfo = {};
            if (creditCardInfo != null || creditCardInfo != undefined) {
                cardInfo.cardNumber1 = creditCardInfo.number.substr(0, 4);
                cardInfo.cardNumber2 = creditCardInfo.number.substr(4, 4);
                cardInfo.cardNumber3 = creditCardInfo.number.substr(8, 4);
                cardInfo.cardNumber4 = creditCardInfo.number.substr(12, 4);
                cardInfo.expirationDay = creditCardInfo.expiration.substr(0, 2),
                cardInfo.expirationYear = creditCardInfo.expiration.substr(2, 2),
                cardInfo.cardType = creditCardInfo.type;
            }

            res.render('saveView', { cardInfo });
        } else {
            // 추가할 때
            add = req.query.addPart;
            res.render('saveView', { add });
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/name', isLoggedIn, async (req, res, next) => {
    const userName = req.body.userName;
    try {
        await User.update({
            name: userName,
        },
            {
            where: {
                id: req.user.id,
            },
        });

        res.send('<script>alert("이름 수정 완료");location.href = "/info";</script>')
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/add/creditCard', isLoggedIn, async (req, res, next) => {
    // 신용카드
    const from = req.body.from;
    const cardNumbers = req.body.cardNumber;
    let creditCardNumber = '';
    cardNumbers.forEach(number => {
        creditCardNumber += number;
    });
    
    const creditCardExpirationDay = req.body.expirationDay;
    const creditCardExpirationYear = req.body.expirationYear;
    const creditCardExpiration = creditCardExpirationDay + creditCardExpirationYear;
    const creditCardType = req.body.creditCardType;

    try {
        await CreditCard.create({
            number: creditCardNumber,
            expiration: creditCardExpiration,
            type: creditCardType,
            user_id: req.user.id,
        });

        if (from == 'form') {
            res.send('<script>alert("신용카드를 등록하였습니다.");location.href = "/info";</script>');
        } else {
            res.send('success');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/update/creditCard', isLoggedIn, async (req, res, next) => {
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

    try {
        const cardInfo = await CreditCard.update({
            number: creditCardNumber,
            expiration: creditCardExpiration,
            type: creditCardType,
        },
        {
            where: {
                number: creditCardNumber,
                user_id: req.user.id,
            }
        });

        if (cardInfo === undefined || cardInfo === null) {
            res.send('<script>alert("등록된 신용카드가 없습니다.");window.location = document.referrer;</script>');
        } else {
            res.send('<script>alert("신용카드를 등록하였습니다.");location.href = "/info";</script>');
        }

    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/add/address', async (req, res, next) => {
    // 배송지
    const from = req.body.from;
    const zipCode = parseInt(req.body.zipCode);
    const basicAddress = req.body.basicAddress;
    const detailAddress = req.body.detailAddress;

    try {
        await ShippingAddress.create({
            zipCode,
            basicAddress,
            detailAddress,
            user_id: req.user.id,
        });
        if (from == 'form') {
            res.send('<script>alert("배송지를 등록하였습니다.");location.href = "/info";</script>');
        } else {
            res.send('success');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.post('/update/address', async (req, res, next) => {
    // 배송지
    const zipCode = parseInt(req.body.zipCode);
    const basicAddress = req.body.basicAddress;
    const detailAddress = req.body.detailAddress;

    try {
        const addressInfo = await ShippingAddress.update({
            zipCode,
            basicAddress,
            detailAddress,
        }, {
            where: {
                zipCode,
                user_id: req.user.id,
            }
        });
        
        if (addressInfo === undefined || addressInfo === null) {
            res.send('<script>alert("등록된 배송지가 없습니다.");window.location = document.referrer;</script>');
        } else {
            res.send('<script>alert("배송지를 등록하였습니다.");location.href = "/info";</script>');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;