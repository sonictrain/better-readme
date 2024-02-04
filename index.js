const fs = require("fs");
const path = require('path');
const inquirer = require("inquirer");
const chalk = require("chalk");
const TableInput = require("inquirer-table-input");
const generateMarkdown = require("./utils/generateMarkdown");

const initReadme = [
    {
        type: 'confirm',
        message: 'Do you want to generate an awsome README for your awesome project?',
        name: 'consent',
        default: true
    },
    {
        type: 'input',
        message: `What's the name of your project?`,
        name: 'projectTitle',
        when: (answer) => answer.consent === true
    }
]


function init() {
    const dayjs = require('dayjs')

    const date = dayjs()
    
    inquirer
        .prompt(initReadme)
        .then((answers) => {

            const title = answers.projectTitle;
            const folderTitle = answers.projectTitle.toLowerCase().replace(' ', '_');
            const folderPath = `./output/${date.format('YYYYMMDD')}/${date.format('HHmmss')}-${folderTitle}`


            fs.mkdir(folderPath,
                { recursive: true },
                (err) => {
                    if (err) throw err;
                }
                );
            
            fs.writeFile(
                `${folderPath}/README.md`,
                `# ${title}`,
                (err) =>
                    err ? console.error(err) : console.log(`README Saved in ${folderPath}!`)
                )
        }
        )
}

init();