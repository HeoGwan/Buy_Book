const express = require('express');
const { getUser } = require('../find');
const { Point, User } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const points = await Point.findAll({
            where: {
                had_user_id: req.user.id,
            }
        });

        const user = await getUser(req.user.id);

        res.render('pointView', { points, user });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;