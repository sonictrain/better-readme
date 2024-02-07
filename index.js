const fs = require("fs");
const inquirer = require("inquirer");
// // const path = require('path');
// // const chalk = require("chalk");
// // const TableInput = require("inquirer-table-input");
// // const generateMarkdown = require("./utils/generateMarkdown");

// readme global configuration object
let readmeConfig = {
        sections: [],
        repoLink: '',
        liveLink: ''
    }

// init function - readmeConfig builder
async function init() {
    getConsent()
}

// getConsent from user
async function getConsent() {
    const consent = {
        type: 'confirm',
        message: 'Do you want to generate a README?',
        name: 'readmeConsent',
        default: true,
    }
    
    await inquirer
    .prompt(consent)
    .then((answer) => {
        console.log(answer.readmeConsent)
        if (answer.readmeConsent) {
            getMainSections()
        }
    })
    .catch((err) => console.error(err))
}

// get information for main sections
async function getMainSections() {

    const mainSections = [
        {
            type: 'input',
            message: `Please type the Title of the project:`,
            name: 'projectTitle',
        },
        {
            type: 'input',
            message: `Now please add a short description to display under the Project title as an Intro (be aware that a long description will follow):`,
            name: 'shortDescription',
        },
        {
            type: 'editor',
            message: `It's time for a long description please press <enter> to use the editor (and note that Markdown language is allowed):`,
            name: 'longDescription',
        },
        {
            type: 'list',
            message: `Lastly, I need you to pick a License for your project from the list below:`,
            name: 'license',
            // TODO get license list from Github API
            choices: [
                'GNU Affero General Public License v3.0',
                'Apache License 2.0',
                'BSD 2-Clause "Simplified" License',
                'BSD 3-Clause "New" or "Revised" License',
                'Boost Software License 1.0',
                'Creative Commons Zero v1.0 Universal',
                'Eclipse Public License 2.0',
                'GNU General Public License v2.0',
                'GNU General Public License v3.0',
                'GNU Lesser General Public License v2.1',
                'MIT License',
                'Mozilla Public License 2.0',
                'The Unlicense',
            ]
        },
        {
            type: 'confirm',
            message: 'Alright, I have captured all the mandatory information. Do you want to add any custom sections to your README?',
            name: 'extraConsent',
            default: true,
        }
    ]

    await inquirer
    .prompt(mainSections)
    .then((answers) => {
        if (answers.extraConsent) {
            //run a function to ask for any extra sections
        }
    })
    .catch((err) => console.error(err))
}

// launch the initialisation process
init();

// const initReadme = [
//     {
//         type: 'confirm',
//         message: 'Do you want to generate a README?',
//         name: 'consent',
//         default: true
//     },
//     {
//         type: 'input',
//         message: `What's the name of your project?`,
//         name: 'projectTitle',
//         when: (answer) => answer.consent === true
//     },
//     {
//         type: 'input',
//         message: `Please send me the link to the project's repository`,
//         name: 'repoLink',
//         when: (answer) => answer.consent === true
//     },
//     {
//         type: 'input',
//         message: `Please send me the link to the live app, if any`,
//         name: 'liveLink',
//         when: (answer) => answer.consent === true
//     },
//     {
//         type: 'list',
//         message: `Choose a License for your project from the list below:`,
//         name: 'license',
//         // TODO get license list from Github API
//         choices: [
//             'Apache License 2.0',
//             'GNU General Public License',
//             'MIT License',
//             'Creative Commons Zero v1.0',
//             'BSD 2-Clause "Simplified" License',
//             'BSD 3-Clause "New" or "Revised" License',
//             'Boost Software License 1.0',
//             'Eclipse Public License 2.0',
//             'GNU Affero General Public License v3.0',
//             'GNU General Public License v2.0',
//             'GNU Lesser General Public License v2.1',
//             'Mozilla Public License 2.0',
//             'The Unlicense'
//         ],
//         when: (answer) => answer.consent === true
//     }
// ]

// async function addExtraSections() {
    
//     let needSection = true;
//     const extraSections = [
//         {
//             type: 'input',
//             message: 'Please input the section title',
//             name: 'sectionTitle'
//         },
//         {
//             type: 'confirm',
//             message: 'Do you want to another section to the README?',
//             name: 'needSection',
//             default: true
//         }
//     ]
//     while (needSection) {
//         await inquirer
//         .prompt(extraSections)
//         .then((answers) => {
//             needSection = answers.needSection
//         })
//     }
// }

// const mainSections = []


//     const dayjs = require('dayjs')

//     const date = dayjs()
//     await inquirer
//         .prompt(initReadme)
//         .then((answers) => {

//             const title = answers.projectTitle;
//             // TODO Destructure the readmeConfig Obj and the answersObj too if necessary
//             readmeConfig.sections.projectTitle = title
//             readmeConfig.license = answers.license
//             readmeConfig.repoLink = answers.repoLink
//             readmeConfig.liveLink = answers.liveLink

//             const folderTitle = title.toLowerCase().replace(' ', '_');
//             const folderPath = `./output/${date.format('YYYYMMDD')}/${date.format('HHmmss')}-${folderTitle}`

//             fs.mkdirSync(folderPath,
//                 { recursive: true },
//                 (err) => {
//                     if (err) throw err;
//                 }
//                 );

//             fs.writeFileSync(
//                 `${folderPath}/README.md`,
//                 `# ${title}`,
//                 (err) =>
//                     err ? console.error(err) : console.log(`README Saved in ${folderPath}!`)
//                 );

//             fs.writeFileSync(
//                 `${folderPath}/conf.json`,
//                 `${JSON.stringify(readmeConfig, null, 4)}`,
//                 (err) =>
//                     err ? console.error(err) : console.log(`Configuration file saved in ${folderPath}!`)
//                 );

//             console.log(JSON.stringify(readmeConfig));
//         }
//         )
//     addExtraSections()