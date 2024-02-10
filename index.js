// TODO add interrupt key to prompt the user with a fixed set of questions (like a menu) https://github.com/lnquy065/inquirer-interrupted-prompt
// TODO use https://github.com/anc95/inquirer-file-tree-selection to pick and edit an old README generated with Better Readme 

const inquirer = require("inquirer");
const randomColor = require('randomcolor');
const generateMarkdown = require("./utils/generateMarkdown");

// readme global configuration object
let readmeConfig = {
    projectTitle: '',
    user: {
        username: 'N/A',
        email: 'N/A',
    },
    badges: [],
    sections: [],
    tableOfContents: '',
    questionsSection: '',
    attribution: '',
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
        message: 'Would you like to create a README file?\n',
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
            message: `Enter the project title:\n`,
            name: 'projectTitle',
        },
        {
            type: 'input',
            message: `Provide a brief introduction for the project (a more detailed description will be added later):\n`,
            name: 'brief',
        },
        {
            type: 'editor',
            message: `Can you provide more details about the project for a thorough and in-depth description?\n`,
            name: 'description',
        },
        {
            type: 'list',
            message: `Select a license for your project from the options listed below:`,
            name: 'license',
            choices: licensesArr.map((x) => x.name),
            loop: false,
        },
        {
            type: 'confirm',
            message: 'Do you wish to include a "Got any questions?" section along with your contact details in the README?\n',
            name: 'questions',
            default: true,
        },
        {
            type: 'input',
            message: `Enter your GitHub username:\n`,
            name: 'username',
            when: (answer) => answer.questions === true
        },
        {
            type: 'input',
            message: `Input your email address:\n`,
            name: 'email',
            validate(email) {
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                    return true;
                }
                throw Error('Please provide a valid email.');
            },
            when: (answer) => answer.questions === true
        },
        {
            type: 'confirm',
            message: 'Would you like to include a table of contents in the README?\n',
            name: 'tableOfContents',
            default: true,
        },
        {
            type: 'confirm',
            message: 'Would you like to attribute the "Better Readme" program in your project?\n',
            name: 'attribution',
            default: true,
        },
        {
            type: 'confirm',
            message: 'Alrigth, I have all the essential details, do you wish to include any custom sections in your README?\n',
            name: 'extraConsent',
            default: true,
        }
    ]

    await inquirer
        .prompt(mainSections)
        .then((answers) => {

            const { projectTitle, brief, description, license, username, email, tableOfContents, attribution, questions, extraConsent } = answers

            readmeConfig.projectTitle = projectTitle
            readmeConfig.sections.push(
                {
                    sectionName: "Title",
                    bodyContent: projectTitle,
                    isTitle: true
                },
                {
                    sectionName: "Intro",
                    bodyContent: brief
                },
                {
                    sectionName: "Description",
                    bodyContent: description
                },
                {
                    sectionName: "License",
                    bodyContent: license,
                    isLicense: true
                },
            )

            readmeConfig.questionsSection = questions
            if (questions) {
                readmeConfig.user.username = username
                readmeConfig.user.email = email
            }

            readmeConfig.badges.push({
                label: [license.split(" ").join("_")],
                color: randomColor()
            })

            readmeConfig.tableOfContents = tableOfContents;
            readmeConfig.attribution = attribution;

            if (extraConsent) {
                getExtraSections()
            } else {
                generateMarkdown(readmeConfig);
            }
        })
        .catch((err) => console.error(err))
}

// get extra sections if any
async function getExtraSections() {

    let needSection = true;
    
    while (needSection) {

        const extraSections = [
            {
                type: 'list',
                message: 'Please select the section type:',
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
                    case 'Text': pushExtraSection( {sectionName: extraTitle, bodyContent: extraBody}, appendAtIndex );
                        break;
                    case 'Image': pushExtraSection( {sectionName: extraTitle, bodyContent: extraImage, isMedia: true}, appendAtIndex );
                        break;
                    case 'Badge': readmeConfig.badges.push({ label: extraBadgeLabel.split(',').map(x => x.trim()), color: extraBadgeColor.replace('#', '')})
                        break;
                }
            })
            .catch((err) => console.error(err))
    }
    console.log(readmeConfig);
    console.log(readmeConfig.badges)
    generateMarkdown(readmeConfig);
}

// get position for the extra sections // TODO rewrite using https://github.com/adam-golab/inquirer-select-line?tab=readme-ov-file
function orderSelector() {
    let sectionsArray = []
    for (let i = 0; i < readmeConfig.sections.length; i++) {
        sectionsArray.push(new inquirer.Separator(`>>${readmeConfig.sections[i].sectionName.toUpperCase()}<<`))
        switch (i) {
            case readmeConfig.sections.length - 1:
                break;
            default:
                sectionsArray.push(`After ${readmeConfig.sections[i].sectionName} and before ${readmeConfig.sections[i+1].sectionName}`)
        }
    }
    return sectionsArray
}

async function getLicenses() {
    try {
        const res = await fetch('https://api.github.com/licenses')
        if (res.status === 200) {
            licensesArr = await res.json();
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
    const tail = readmeConfig.sections.slice(index + 1);
    readmeConfig.sections = [...head, newSectionObj, ...tail]
}