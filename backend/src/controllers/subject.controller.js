const Subject = require("../models/Subject");

exports.getAllSubjects = async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
};

exports.createSubject = async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json(subject);
};
