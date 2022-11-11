const e = require('express');
const { Order, OrderItem, Cart, Book, CartItem, User, CreditCard, ShippingAddress } = require('../models');

const getOrders = (userID) => {
    return new Promise((resolve, reject) => {
        Order.findAll({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getOrder = (userID) => {
    return new Promise((resolve, reject) => {
        Order.findOne({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getOrderItems = (userID) => {
    return new Promise((resolve, reject) => {
        OrderItem.findAll({
            include: [{
                model: Order,
                where: {
                    user_id: userID,
                }
            }, {
                model: Book,
            }]
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getOrderItem = (userID) => {
    return new Promise((resolve, reject) => {
        OrderItem.findOne({
            include: [{
                model: Order,
                where: {
                    user_id: userID,
                }
            }, {
                model: Book,
            }]
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })      
    })
}

const getCarts = (userID) => {
    return new Promise((resolve, reject) => {
        Cart.findAll({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getCart = (userID) => {
    return new Promise((resolve, reject) => {
        Cart.findOne({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getCartItems = (userID) => {
    return new Promise((resolve, reject) => {
        CartItem.findAll({
            include: [{
                model: Cart,
                where: {
                    user_id: userID,
                }
            }, {
                model: Book,
            }]
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getCartItem = (userID) => {
    return new Promise((resolve, reject) => {
        CartItem.findOne({
            include: [{
                model: Cart,
                where: {
                    user_id: userID,
                }
            }, {
                model: Book,
            }]
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getBooks = (bookNumber) => {
    return new Promise((resolve, reject) => {
        Book.findAll({
            where: {
                number: bookNumber,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getBook = (bookNumber) => {
    return new Promise((resolve, reject) => {
        Book.findOne({
            where: {
                number: bookNumber,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getUser = (userID) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getCreditCards = (userID) => {
    return new Promise((resolve, reject) => {
        CreditCard.findAll({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getCreditCard = (userID) => {
    return new Promise((resolve, reject) => {
        CreditCard.findOne({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getAddresses = (userID) => {
    return new Promise((resolve, reject) => {
        ShippingAddress.findAll({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getAddress = (userID) => {
    return new Promise((resolve, reject) => {
        ShippingAddress.findOne({
            where: {
                user_id: userID,
            }
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

module.exports = {
    getOrder,
    getOrders,
    getOrderItems,
    getOrderItem,
    getCarts,
    getCart,
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