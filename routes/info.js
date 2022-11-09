const express = require('express');
const { CreditCard, ShippingAddress, User } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    // 신용카드 정보와 배송지 정보를 가져와서 보여줌
    try {
        const user = await User.findOne({
            where: {
                id: req.user.id,
            }
        });

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

        res.render('showInfoView', { user, cardInfos, addressInfos });
    } catch (err) {
        console.error(err);
        next(err);
    }
})



router.get('/:addressZipCode/address', async (req, res, next) => {
    const zipCode = req.params.addressZipCode;
    try {
        // 유저가 가지고 있는 해당 카드를 가져온 뒤
        // 정보를 가공해 넘겨줌
        const addressInfo = await ShippingAddress.findOne({
            where: {
                zipCode,
                user_id: req.user.id,
            } 
        })

        res.json({ addressInfo });
    } catch (err) {
        console.error(err);
        next(err);
    }
})


router.get('/:cardNumber/card', async (req, res, next) => {
    const cardNumber = req.params.cardNumber;
    console.log(cardNumber);
    try {
        // 유저가 가지고 있는 해당 카드를 가져온 뒤
        // 정보를 가공해 넘겨줌
        const creditCardInfo = await CreditCard.findOne({
            where: {
                number: cardNumber,
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


        res.json({ cardInfo });
    } catch (err) {
        console.error(err);
        next(err);
    }
})


module.exports = router;