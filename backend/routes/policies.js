const express = require('express');
const router = express.Router();
const Note = require('../models/Policy.js');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser.js');

//Fetching Notes Route
router.get('/fetchallnotes', fetchUser, async (req, res)=>{
    try {
        const notes = await Note.find({user: req.user.id});
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

//Adding a Note Route
router.post('/addnote', fetchUser, [
     body('title', 'Enter a valid Title').isLength({min: 3}),
     body('description', 'Description must be atleast 3 characters').isLength({min: 3}),
], async (req, res)=>{
    try {
        const {title, description, tag} = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();
        res.json(savedNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

//Updating/Editing a Note Route
router.put('/updatenote/:id', fetchUser, [
     body('title', 'Enter a valid Title').isLength({min: 3}),
     body('description', 'Description must be atleast 3 characters').isLength({min: 3}),
], async (req, res)=>{
    try {
        const {title, description, tag} = req.body;
        const newNote = {};
        if(title){newNote.title = title}
        if(description){newNote.description = description}
        if(tag){newNote.tag = tag}

        //Find the Note to be Updated then update it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Sorry, Note Not Found" )}
        if(note.user.toString() !== req.user.id){return res.status(401).send("Access Denied!")}
        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        res.json({note});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

//Deleting a Note Route
router.delete('/deletenote/:id', fetchUser, async (req, res)=>{
    try {
        //Find the Note to be Deleted then delete it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Sorry, Note Not Found" )}
        if(note.user.toString() !== req.user.id){return res.status(401).send("Access Denied!")}
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({"Success": "Note has been Deleted", note: note});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;