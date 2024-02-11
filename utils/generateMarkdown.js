const fs = require("fs");
const dayjs = require('dayjs')

// generate and return Markdown
const generateMarkdown = async (readmeConfig) => {
  const { projectTitle, sections, badges, attribution, questionsSection, tableOfContents } = readmeConfig

  const licenseDescription = await getLicenseDescription(
    sections[sections.map(function (l) {
      if (l.isLicense) {
        return true
      } else {
        return false
      }
    }).indexOf(true)].licenseKey
  )

  let content = [...sections.map((s) => {
    if (s.isTitle) {
      return `
# ${s.bodyContent}
${generateBadgesMD(badges)}
${tableOfContents ? '## Table of Contents' && attachTableOfContents(readmeConfig).join(' ') : ''}`
    }
    else if (s.isMedia) {
      return `
## ${s.sectionName}
![${s.sectionName}](${s.bodyContent})`
    }
    else if (s.isLicense) {
      return `
${questionsSection ? getQuestionsSection(readmeConfig) : ''}
## ${s.sectionName}
${licenseDescription}`
    }
    else {
      return `\n
## ${s.sectionName}
${s.bodyContent}`
    }
  }), attributionBR(attribution)].join(' ')

  const date = dayjs()

  const folderTitle = projectTitle.toLowerCase().split(" ").join("_");
  const versionFolderPath = `./output/${folderTitle}/${date.format('YYYYMMMDD')}/${date.format('HHmmss')}`

  fs.mkdirSync(versionFolderPath,
    { recursive: true },
    (err) => {
      if (err) throw err;
    }
  );

  fs.writeFileSync(
    `${versionFolderPath}/README.md`,
    `${content}`,
    (err) => {
      if (err) {
        throw err
      }
    }
  );
  console.log(`✅ README Succesfully saved in ${versionFolderPath}/README.md`)

  fs.writeFileSync(
    `${versionFolderPath}/conf.json`,
    `${JSON.stringify(readmeConfig, null, 4)}`,
    (err) => {
      if (err) {
        throw err
      }
    }
  )
  console.log(`✅ Configuration file available here: ${versionFolderPath}/conf.json`)
}

// build Shield.io badges component
const generateBadgesMD = (badgesArr) => {
  return badgesArr.map((b) => {
    if (b.label.length === 1) {
      return `![${b.label}](https://img.shields.io/badge/${b.label}-${b.color})`
    } else {
      return `![${b.label[0]}](https://img.shields.io/badge/${b.label[0]}-${b.label[1]}-${b.color})`
    }
  }).join(' ');
}

// build table of contents
const attachTableOfContents = (readmeConfig) => {

  const { tableOfContents, sections } = readmeConfig

  if (tableOfContents) {
    return sections.map((s, i) => {
      if (i>0) {
        return `
${i}. [${s.sectionName}](#${s.sectionName})`
      }
    })
  }
}

// create question section
const getQuestionsSection = (readmeConfig) => {
  const { user } = readmeConfig
  return `## Got any questions?
If you have any questions or feedback, please feel fre to reach out sending an email to the provided [email address](${user.email}) or [visiting the GitHub profile](http://github.com/${user.username}/). Your inquiries and input are valuable, appreciate your engagement with the project!\n`
}

const getLicenseDescription = async (licenseName) => {
  try {
    const res = await fetch(`https://api.github.com/licenses/${licenseName}`)
    if (res.status === 200) {
      licenseData = await res.json()
      return licenseData.description
    }
  } catch {
    (err) => console.error(err)
  }
}

// create attribution
const attributionBR = (attribution) => {
  if (attribution) {
    return `
\n---\n
Generate with [Better Readme](https://github.com/sonictrain/better-readme) Copyright (c) 2024, [Nicola Brucoli](https://github.com/sonictrain).`
  }
}

module.exports = generateMarkdown;