const express = require('express');
const router = express.Router();
const { School } = require('../models');

router.get('/', async (req, res) => {
    const schoolList = await School.findAll();
    res.json(schoolList);
});

router.post('/', async (req, res) => {
    const school = req.body;
    const newSchool = await School.create(school);
    res.json(newSchool.schoolName);
});

module.exports = router;