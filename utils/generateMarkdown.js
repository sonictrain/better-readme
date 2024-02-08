// generate and return Markdown
const generateMarkdown = (readmeConfig) => {

  const { attribution, tableOfContents, sections, user, badges } = readmeConfig

  let content = [...sections.map((s) => {
    if (s.isTitle) {
      return `# ${s.bodyContent}
${generateBadgesMD(badges)}\n
${attachTableOfContents(readmeConfig).join(' ')}\n
`
    } else if (s.isMedia) {
      return `## ${s.sectionName}
![${s.sectionName}](${s.bodyContent})\n
`
    } else {
      return `## ${s.sectionName}
${s.bodyContent}\n
`}
  }), questionSection(readmeConfig), attributionBR(attribution)]
  return content.join(' ')
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
    return sections.map((s) => {
      return `- [${s.sectionName}](#${s.sectionName})\n`
    })
  }
}

// create question section
const questionSection = (readmeConfig) => {
  return `## Questions
If you have any questions or feedback, please feel fre to reach out to the developer sending an email to the provided [email address](${readmeConfig.user.email}) or [visiting the GitHub profile](http://github.com/${readmeConfig.user.username}/). Your inquiries and input are valuable, appreciate your engagement with the project.\n`
}

// create attribution
const attributionBR = (attribution) => {
  if (attribution) {
    return `---\n
Generate with [Better Readme](https://github.com/sonictrain/better-readme) Copyright (c) 2024, [Nicola Brucoli](https://github.com/sonictrain).\n`
  }
}

module.exports = generateMarkdown;