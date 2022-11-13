const e = require('express');
const { Order, OrderItem, Cart, Book, CartItem, User, CreditCard, ShippingAddress } = require('../models');


const getOrders = (userID) => {
    // 모든 회원이 주문한 주문 가져오기
    return new Promise((resolve, reject) => {
        Order.findAll({})
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}
const getUserOrders = (userID) => {
    // 해당 회원이 주문한 모든 주문 목록 가져오기
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
    // 해당 회원이 주문한 주문 가져오기
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
    // 해당 회원이 주문한 모든 주문 항목 가져오기
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

// const getOrderItem = (userID) => {
//     return new Promise((resolve, reject) => {
//         OrderItem.findOne({
//             include: [{
//                 model: Order,
//                 where: {
//                     user_id: userID,
//                 }
//             }, {
//                 model: Book,
//             }]
//         })
//         .then(result => {
//             resolve(result);
//         })
//         .catch(err => {
//             console.error(err);
//             reject(err);
//         })      
//     })
// }

function getOrderItem(userID, orderBookNumber) {
    if (arguments.length === 1) {
        // 회원이 주문한 모든 주문 항목
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
    } else if (arguments.length === 2) {
        // 회원이 주문한 주문항목 중 특정 주문 항목만 검색
        return new Promise((resolve, reject) => {
            OrderItem.findOne({
                include: [{
                    model: Order,
                    where: {
                        book_number: orderBookNumber,
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
}

const getCarts = (userID) => {
    // 모든 회원의 장바구니 가져오기
    return new Promise((resolve, reject) => {
        Cart.findAll({})
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
}

const getUserCarts = (userID) => {
    // 해당 회원의 모든 장바구니 가져오기
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
    // 해당 회원의 장바구니 가져오기
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

// const getCartItem = (userID) => {
//     return new Promise((resolve, reject) => {
//         CartItem.findOne({
//             include: [{
//                 model: Cart,
//                 where: {
//                     user_id: userID,
//                 }
//             }, {
//                 model: Book,
//             }]
//         })
//         .then(result => {
//             resolve(result);
//         })
//         .catch(err => {
//             console.error(err);
//             reject(err);
//         })
//     })
// }

function getCartItem(userID, cartBookNumber) {
    if (arguments.length === 1) {
        // 유저가 가지고 있는 장바구니 도서 전부
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
    } else if (arguments.length === 2) {
        // 회원이 가지고 있는 장바구니 항목 중 특정 도서 1개
        return new Promise((resolve, reject) => {
            CartItem.findOne({
                include: [{
                    model: Cart,
                    where: {
                        book_number: cartBookNumber,
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
    getUserOrders,
    getOrders,
    getOrderItems,
    getOrderItem,
    getCarts,
    getUserCarts,
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