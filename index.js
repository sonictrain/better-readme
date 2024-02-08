const fs = require("fs");
const inquirer = require("inquirer");
// // const path = require('path');
// // const chalk = require("chalk");
// // const TableInput = require("inquirer-table-input");
// // const generateMarkdown = require("./utils/generateMarkdown");

// readme global configuration object
let readmeConfig = {
    user: {},
    badges: [],
    sections: [],
    tableOfContent: true,
    attribution: true,
};

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
        message: 'Do you want to generate a README?\n',
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
            message: `Please type the Title of the project:\n`,
            name: 'projectTitle',
        },
        {
            type: 'input',
            message: `Now please add a short description to serve as an Intro (a long description will follow):\n`,
            name: 'shortDescription',
        },
        {
            type: 'editor',
            message: `It's time for the long description (please note that Markdown language is allowed):\n`,
            name: 'longDescription',
        },
        {
            type: 'list',
            message: `Lastly, I need you to pick a License for your project from the list below:\n`,
            name: 'license',
            choices: licensesArr.map((x) => x.name),
            loop: false,
        },
        {
            type: 'input',
            message: `What's your GitHub username?\n`,
            name: 'username',
        },
        {
            type: 'input',
            message: `And what's your email?\n`,
            name: 'email',
            validate(email) {
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                    return true;
                }
                throw Error('Please provide a valid email.');
            },
        },
        {
            type: 'confirm',
            message: 'Alright, I have captured all the mandatory information.\nDo you want to add any custom sections to your README?\n',
            name: 'extraConsent',
            default: true,
        }
    ]

    await inquirer
        .prompt(mainSections)
        .then((answers) => {

            const { projectTitle, shortDescription, longDescription, license, username, email } = answers

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

            readmeConfig.user = {
                username: username,
                email: email,
            }

            readmeConfig.badges.push({
                label: license.trim(),
                color: 'blue'
            })

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
            type: 'list',
            message: 'Please select the section type:\n',
            name: 'extraType',
            choices: [
                'Text section (Title + paragraph)',
                'Image section (Title + image)',
                'Badge section (1 custom Shield Badge to be attached on top of the Readme)'
            ],
            loop: false,
        },
        {
            type: 'input',
            message: 'Please input the section title:\n',
            name: 'extraTitle',
            when: (answer) => answer.extraType.split(' ')[0] !== 'Badge'
        },
        {
            type: 'list',
            message: `Where do you want to add the section?\n`,
            name: 'position',
            choices: orderSelector(),
            pageSize: 10,
            loop: false,
            when: (answer) => answer.extraType.split(' ')[0] !== 'Badge'
        },
        {
            type: 'editor',
            message: 'Add the body of the section (Markdown is allowed):\n',
            name: 'extraBody',
            when: (answer) => answer.extraType.split(' ')[0] === 'Text'
        },
        {
            type: 'input',
            message: 'Paste here the URL to the image, either an absolute or relative path:\n',
            name: 'extraImage',
            when: (answer) => answer.extraType.split(' ')[0] === 'Image'
        },
        {
            type: 'input',
            message: 'Please input the Shield Badge label (one or two strings separated by a comma):\n',
            name: 'extraBadgeLabel',
            when: (answer) => answer.extraType.split(' ')[0] === 'Badge'
        },
        {
            type: 'chalk-pipe',
            message: 'Paste here the color name or hexcode for the Shield Badge:\n',
            name: 'extraBadgeColor',
            default: 'e.g.: #ff3300 or green',
            when: (answer) => answer.extraType.split(' ')[0] === 'Badge'
        },
        {
            type: 'confirm',
            message: 'Do you want to add another section to the README?\n',
            name: 'needSection',
            default: true
        }
    ]

    while (needSection) {

        inquirer.registerPrompt('chalk-pipe', require('inquirer-chalk-pipe'));

        await inquirer
            .prompt(extraSections)
            .then((answers) => {

                const { extraType, extraTitle, position, extraBody, extraImage, extraBadgeLabel, extraBadgeColor } = answers

                needSection = answers.needSection
                let appendAtIndex

                if (position) {
                    appendAtIndex = Number(readmeConfig.sections.map(x => x.sectionName).indexOf(position.split(' ')[1]));
                }

                switch (extraType.split(' ')[0]) {
                    case 'Text':
                        pushExtraSection(
                            {
                                sectionName: extraTitle,
                                bodyContent: extraBody
                            },
                            appendAtIndex);
                        break;
                    case 'Image':
                        pushExtraSection(
                            {
                                sectionName: extraTitle,
                                bodyContent: extraImage
                            },
                            appendAtIndex);
                        break;
                    case 'Badge':
                        readmeConfig.badges.push({
                            label: extraBadgeLabel.split(',').map(x => x.trim()),
                            color: extraBadgeColor.replace('#', '')
                        })
                        break;
                }

                console.log(readmeConfig)
            })
            .catch((err) => console.error(err))
    }
}

// get position for the extra sections
function orderSelector() {
    let sectionsArray = []
    for (let i = 0; i < readmeConfig.sections.length; i++) {
        sectionsArray.push(new inquirer.Separator(`>>>>${readmeConfig.sections[i].sectionName.toUpperCase()}<<<<`))
        switch (i) {
            case readmeConfig.sections.length - 1:
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
            licenses = licensesArr.forEach((x) => { return x.name })
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
    const head = readmeConfig.sections.slice(0, index + 1);
    console.log(head);
    const tail = readmeConfig.sections.slice(index + 1);
    console.log(tail);
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