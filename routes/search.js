const express = require('express');
const Op = require('sequelize').Op;
const { Book } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    console.log(req.query);
    const searchWord = req.query.search;

    try {
        const getBooks = await Book.findAll({
        where: {
            title: {
                [Op.like]: `%${searchWord}%`,
            },
        },
        });

        let books = [];

        getBooks.forEach(book => {
            if (book.stock <= 0) {
                books.push({
                    number: book.number,
                    title: book.title,
                    price: book.price,
                    imageSource: book.imageSource,
                    canOrder: false,
                })
            } else {
                books.push({
                    number: book.number,
                    title: book.title,
                    price: book.price,
                    imageSource: book.imageSource,
                    canOrder: true,
                })
            }
        })

        console.log('books', books);
        return res.render('searchList', { books });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;