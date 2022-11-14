const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { Book } = require('../models');

try {
    fs.readdirSync('uploads');
} catch (err) {
    console.error('uploads폴더가 없어 uploads폴더를 만듭니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })
});

router.post('/img', upload.single('img'), (req, res) => {
    // console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
})

const bookUpload = multer();
router.post('/', bookUpload.none(), async (req, res, next) => {
    // console.log(req.body, req.query, req.param);
    // console.log(req.body);
    try {        
        const book = await Book.create({
            title: req.body.title,
            stock: req.body.stock,
            price: req.body.price,
            info: req.body.info,
            imageSource: req.body.url,
        });        
        // console.log(`${req.body.title} 등록에 성공했습니다!`);
        res.redirect('/');
    } catch (err) {
        console.error(err)
    }
})

module.exports = router;