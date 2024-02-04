const fs = require("fs");
const path = require('path');
const inquirer = require("inquirer");
const generateMarkdown = require("./utils/generateMarkdown");

const answers = [
    {
        type: 'input',
        message: 'Question #1',
        name: 'answer1'
    },
    {
        type: 'input',
        message: 'Question #2',
        name: 'answer2'
    },
]

function init() {
    inquirer.prompt(answers).then((answers) => {console.log(answers)});
}

init()