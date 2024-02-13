const express = require('express');
const router = express.Router();
const {Subcomment} = require('../models');

router.get('/', async (req, res) => {
    const SubcommentList = await Subcomment.findAll();
    res.json(SubcommentList);
});

router.post('/', async (req, res) => {
    const Subcomment = req.body;
    const newSubcomment = await Subcomment.create(Subcomment);
    res.json(newSubcomment.text);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const Subcomment = await Subcomment.findByPk(id);
    res.json(Subcomment);
});

router.delete('/:id', async (req, res) => {
    const SubcommentId = req.params.id;
    Subcomment.destroy({
        where: {
            id: SubcommentId
        }
    });
    res.json(`${SubcommentId} deleted from the database`);
});

module.exports = router;