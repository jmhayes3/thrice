const express = require('express');
const router = express.Router();

const questions = [
  { question: "America's oldest trail race is the Dipsea Race, running from Mill Valley to Stinson Beach in which state?", answer: "California" },
  { question: "The 1974 disaster movie Earthquake had two hours of Charlton Heston running along the knife's edge of death, in what state?", answer: "California" },
  { question: "Hustlers, the 101, and very heavy shadows come up in the theme song for The O.C., which was named after a county in what state?", answer: "California" }
];

router.get('/', (req, res) => {
  res.json(questions);
});

module.exports = router;
