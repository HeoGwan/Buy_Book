const e = require('express');
const { Order, OrderItem, Cart, Book, CartItem, User, CreditCard, ShippingAddress } = require('../models');

const getOrders = (userID) => {
    return Order.findAll({
        where: {
            user_id: userID,
        }
    });
}

const getOrder = (userID) => {
    return Order.findOne({
        where: {
            user_id: userID,
        }
    });
}

const getOrderItems = (userID) => {
    return OrderItem.findAll({
        include: [{
            model: Cart,
            where: {
                user_id: userID,
            }
        }, {
            model: Book,
        }]
    })
}

const getOrderItem = (userID) => {
    return OrderItem.findOne({
        include: [{
            model: Cart,
            where: {
                user_id: userID,
            }
        }, {
            model: Book,
        }]
    })
}

const getCartItems = (userID) => {
    return CartItem.findAll({
        include: [{
            model: Cart,
            where: {
                user_id: userID,
            }
        }, {
            model: Book,
        }]
    })
}

const getCartItem = (userID) => {
    return CartItem.findOne({
        include: [{
            model: Cart,
            where: {
                user_id: userID,
            }
        }, {
            model: Book,
        }]
    })
}

const getBooks = (bookNumber) => {
    return Book.findAll({
        where: {
            number: bookNumber,
        }
    });
}

const getBook = (bookNumber) => {
    return Book.findOne({
        where: {
            number: bookNumber,
        }
    });
}

const getUser = (userID) => {
    return User.findOne({
        where: {
            id: userID,
        }
    });
}

const getCreditCards = (userID) => {
    return CreditCard.findAll({
        where: {
            user_id: userID,
        }
    });
}

const getCreditCard = (userID) => {
    return CreditCard.findOne({
        where: {
            user_id: userID,
        }
    })
}

const getAddresses = (userID) => {
    return ShippingAddress.findAll({
        where: {
            user_id: userID,
        }
    })
}

const getAddress = (userID) => {
    return ShippingAddress.findOne({
        where: {
            user_id: userID,
        }
    })
}

module.exports = {
    getOrder,
    getOrders,
    getOrderItems,
    getOrderItem,
    getCartItems,
    getCartItem,
    getBooks,
    getBook,
    getUser,
    getCreditCards,
    getCreditCard,
    getAddresses,
    getAddress,
}