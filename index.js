const fs = require("fs");
const inquirer = require("inquirer");
// // const path = require('path');
// // const chalk = require("chalk");
// // const TableInput = require("inquirer-table-input");
// // const generateMarkdown = require("./utils/generateMarkdown");

// readme global configuration object
let readmeConfig = {
        sections: [
        ],
        repoLink: '',
        liveLink: ''
    }

// create licenses arr container to be filled with a fetch call to the github API
let licensesArr;

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
            choices: licensesArr.map((x) => x.name),
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

        const { projectTitle, shortDescription, longDescription, license } = answers

        readmeConfig.sections.push(
            {
                sectionName: "Title",
                bodyContent: projectTitle
            },
            {
                sectionName: "Intro",
                bodyContent: shortDescription
            },
            {
                sectionName: "Description",
                bodyContent: longDescription
            },
            {
                sectionName: "License",
                bodyContent: license
            },
        )

        console.log(readmeConfig)

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
            name: 'extraTitle'
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
            name: 'extraBody',
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

            const { extraTitle, extraBody } = answers

            needSection = answers.needSection
            let appendAtIndex = Object.values(readmeConfig.sections).indexOf(answers.position.split(' ')[1]);
            pushExtraSection(
                {
                    sectionName: extraTitle,
                    bodyContent: extraBody
                },
                appendAtIndex);

            console.log(readmeConfig)
        })
        .catch((err) => console.error(err))
    }
}

// get position for the extra sections
function orderSelector() {
    let sectionsArray = []
    for (let i=0; i < readmeConfig.sections.length; i++) {
        sectionsArray.push(new inquirer.Separator(`>>>>${readmeConfig.sections[i].sectionName.toUpperCase()}<<<<`))
        switch(i) {
            case readmeConfig.sections.length-1:
                break;
            default:
                sectionsArray.push(`After ${readmeConfig.sections[i].sectionName}`)
        }
    }
    return sectionsArray
}

async function getLicenses() {
    try {
        const res = await fetch('https://api.github.com/licenses')
        if (res.status === 200) {
            licensesArr = await res.json();
            licenses = licensesArr.forEach((x) => {return x.name})
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

// add the extra section in the position selected by the user
const pushExtraSection = (newSectionObj, index) => {
    const head = readmeConfig.sections.slice(0, index);
    const tail = readmeConfig.sections.slice(index);
    readmeConfig.sections = [...head, newSectionObj, ...tail]
}

//     const dayjs = require('dayjs')

//     const date = dayjs()
//     await inquirer
//         .prompt(initReadme)
//         .then((answers) => {

//             const title = answers.projectTitle;
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