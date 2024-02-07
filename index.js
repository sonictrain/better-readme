const fs = require("fs");
const inquirer = require("inquirer");
// // const path = require('path');
// // const chalk = require("chalk");
// // const TableInput = require("inquirer-table-input");
// // const generateMarkdown = require("./utils/generateMarkdown");

// readme global configuration object
let readmeConfig = {
        sections: ['Title', 'Intro', 'Description', 'License'],
        repoLink: '',
        liveLink: ''
    }

// create licenses arr container to be filled with a fetch call to the github API
let licensesArrObj;

// init function - readmeConfig builder
async function init() {
    getLicenses();
    getConsent();
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
            message: `Now please add a short description to serve as an Intro (a long description will follow):`,
            name: 'shortDescription',
        },
        {
            type: 'editor',
            message: `It's time for the long description (please note that Markdown language is allowed):`,
            name: 'longDescription',
        },
        {
            type: 'list',
            message: `Lastly, I need you to pick a License for your project from the list below:`,
            name: 'license',
            choices: licensesArrObj.map((x) => x.name),
            loop: false,
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
            getExtraSections()
        }
    })
    .catch((err) => console.error(err))
}

// get extra sections if any
async function getExtraSections() {

    let needSection = true;
    const extraSections = [
        {
            type: 'input',
            message: 'Please input the section title',
            name: 'sectionTitle'
        },
        {
            type: 'list',
            message: `Where do you want to add the section?`,
            name: 'position',
            choices: orderSelector(),
            pageSize: 10,
            loop: false,
        },
        {
            type: 'editor',
            message: 'Add the body of the section (Markdown is allowed):',
            name: 'sectionBody',
        },
        {
            type: 'confirm',
            message: 'Do you want to add another section to the README?',
            name: 'needSection',
            default: true
        }
    ]

    while (needSection) {
        await inquirer
        .prompt(extraSections)
        .then((answers) => {
            needSection = answers.needSection
            console.log(answers.position.split(' ')[1])
        })
    }
}

// get position for the extra sections
function orderSelector() {
    let sectionsArray = []
    for (let i=0; i < readmeConfig.sections.length; i++) {
        sectionsArray.push(new inquirer.Separator(`>>>>${readmeConfig.sections[i].toUpperCase()}<<<<`))
        switch(i) {
            case readmeConfig.sections.length-1:
                break;
            default:
                sectionsArray.push(`After ${readmeConfig.sections[i]}`)
        }
    }
    console.log(sectionsArray);
    return sectionsArray
}

async function getLicenses() {
    try {
        const res = await fetch('https://api.github.com/licenses')
        if (res.status === 200) {
            licensesArrObj = await res.json();
            licensesArr = licensesArrObj.forEach((x) => {return x.name})
        } else {
            console.log(`Error ${res.status}`);
        }
    }
    catch {
        (err) => console.error(err)
    }
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