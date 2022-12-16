const { Thought, User } = require('../models');

module.exports = {
  // Get all thoughts
  getThoughts(req, res) {
    Thought.find()
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },
  // Get a thought
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select('-__v')
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought with that ID' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Create a thought
  createThought(req, res) {
    Thought.create(req.body)
      .then((thought) => 
      { 
        return User.findOneAndUpdate(
          {_id: req.body.userId},
          {$push: {thoughts: thought._id}},
          {new: true}
        );
      })
      .then((thought)=> {
        if(!thought){
          return res.status(404).json({message: 'thought created but no user with this id'});
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // Delete a thought
  deleteThought(req, res) {
    Thought.findOneAndDelete({ _id: req.params.thoughtId })
      .then((thought) => {
        if(!thought){
          res.status(404).json({ message: 'No thought with that ID' })
        }
        return User.findOneAndUpdate(
            { thoughts: req.params.thoughtId },
            { $pull: { thoughts: req.params.thoughtId } },
            { new: true }
          );
        }
      )
      .then((user) => {
        if(!user){
          res.status(404).json({ message: 'Thoughts deleted but no user with this id!' })
        }
        res.json({ message: 'Thoughts and users deleted!' });
      })

      .catch((err) => res.status(500).json(err));
  },
  // Update a thought
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((thought) => {
        if(!thought){
          res.status(404).json({ message: 'No thought with this id!' })
        }
        res.json(thought);
      })
      .catch((err) => res.status(500).json(err));
  },
};
