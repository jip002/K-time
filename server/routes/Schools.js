const express = require('express');
const router = express.Router();
const { School } = require('../models');

router.get('/', (req, res) => {
    res.send('Schools');
});

router.post('/', async (req, res) => {
    const school = req.body;
    const newSchool = await School.create(school);
    res.json(newSchool.schoolName);
});

module.exports = router;