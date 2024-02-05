const fs = require("fs");
// const path = require('path');
const inquirer = require("inquirer");
// const chalk = require("chalk");
// const TableInput = require("inquirer-table-input");
// const generateMarkdown = require("./utils/generateMarkdown");

let readmeConfig = {
        project: '',
        description: '',
        license: '',
    }

const initReadme = [
    {
        type: 'confirm',
        message: 'Do you want to generate a README?',
        name: 'consent',
        default: true
    },
    {
        type: 'input',
        message: `What's the name of your project?`,
        name: 'projectTitle',
        when: (answer) => answer.consent === true
    },
    {
        type: 'list',
        message: `Choose a License for your project from the list below:`,
        name: 'license',
        choices: ['Apache License 2.0', 'GNU General Public License', 'MIT License', 'Creative Commons Zero v1.0'],
        when: (answer) => answer.consent === true
    }
]

async function addSection2conf() {
    
    let needSection = true;
    
    const addSections = [
        {
            type: 'input',
            message: 'Please input the section title',
            name: 'sectionTitle'
        },
        {
            type: 'confirm',
            message: 'Do you want to another section to the README?',
            name: 'needSection',
            default: true
        }
    ]

    while (needSection) {
        await inquirer
        .prompt(addSections)
        .then((answers) => {
            needSection = answers.needSection
        })
    }

}

async function init() {
    const dayjs = require('dayjs')

    const date = dayjs()
    
    await inquirer
        .prompt(initReadme)
        .then((answers) => {

            const title = answers.projectTitle;
            // TODO Destructure the readmeConfig Obj and the answersObj if necessary
            readmeConfig.project = title
            readmeConfig.license = answers.license

            const folderTitle = answers.projectTitle.toLowerCase().replace(' ', '_');
            const folderPath = `./output/${date.format('YYYYMMDD')}/${date.format('HHmmss')}-${folderTitle}`

            fs.mkdirSync(folderPath,
                { recursive: true },
                (err) => {
                    if (err) throw err;
                }
                );
            
            fs.writeFileSync(
                `${folderPath}/README.md`,
                `# ${title}`,
                (err) =>
                    err ? console.error(err) : console.log(`README Saved in ${folderPath}!`)
                )
            
            console.log(JSON.stringify(readmeConfig));
        }
        )
    addSection2conf();
}

init();