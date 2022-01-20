#!/usr/bin/env node

import path from 'path'
import prompts, { PromptObject } from 'prompts'
import { red, blue, green, bold } from 'kolorist'
import figlet from 'figlet'
import fs from 'fs-extra'
// @ts-ignore
import Big from 'figlet/importable-fonts/Big'

import {
  canSafelyOverwrite,
  getTargetDirname,
  getCocosEditorsInfo,
  getCocosProjectsInfo
} from './utils'

figlet.parseFont('Big', Big)

type PromptsResult = {
  extensionScope: number
  editorVersion?: string
  projectName?: string
  extensionName: string
  shouldOverwrite?: boolean
  extensionTemplate: number
}

const defaultExtensionName = 'cocos-extension'
const scopeChoices = [
  { title: 'Project', description: 'project extension' },
  { title: 'Global', description: 'global extension' }
]

const templateChoices = [
  { title: 'blank', dirname: 'blank', description: 'A blank extension' },
  { title: 'html', dirname: 'html', description: 'Extension with a panel' },
  {
    title: 'Vue2.x',
    dirname: 'vue2',
    description: 'Extension with a panel based on Vue2.x'
  },
  {
    title: 'Vue3.x',
    dirname: 'vue3',
    description: 'Extension with a panel based on Vue3.x'
  },
  {
    title: 'Vue3.x + tsx',
    dirname: 'vue3tsx',
    description: 'Extension with a panel based on Vue3.x + tsx'
  }
]

const editorsInfo = getCocosEditorsInfo()
const editorVersionChoices = editorsInfo
  ? editorsInfo.map((item) => ({
      title: item.version,
      description: item.file
    }))
  : []

const projectsInfo = getCocosProjectsInfo()
const projectNameChoices = projectsInfo
  ? projectsInfo.map((item) => ({
      title: item.name,
      path: item.path,
      description: item.path
    }))
  : []

// TODO: 整理
// Prompts:
// - Extension scope: project / global
//   - Project dir check
// - Extension name:
//   - whether to overwrite the existing directory or not?
//   - enter a valid package name for package.json
// - Engine version:
//   - check cwd
//   - package.json -> creator.version
// - Extension template: blank / html / vue2.x / vue3.x / vue3.x + tsx

const promptsQuestions: PromptObject[] = [
  {
    name: 'extensionScope',
    type: 'select',
    message: 'Extension scope:',
    choices: scopeChoices,
    initial: 0
  },
  {
    name: 'editorVersion',
    type: (prev, values) => {
      if (!editorsInfo) {
        throw new Error(
          red('✖') +
            ' Operation cancelled, you may not have any version of the editor installed.'
        )
      }
      return values.extensionScope === 1 && editorsInfo ? 'select' : null
    },
    message: 'Editor Version:',
    choices: editorVersionChoices
  },
  {
    name: 'projectName',
    type: (prev, values) => {
      if (values.extensionScope === 0 && !projectsInfo) {
        throw new Error(
          red('✖') +
            ' Operation cancelled, you may not have any cocos projects yet.'
        )
      }
      return values.extensionScope === 0 && projectsInfo ? 'select' : null
    },
    message: 'Project name:',
    choices: projectNameChoices
  },
  // TODO: validate extension name
  {
    name: 'extensionName',
    type: 'text',
    message: 'Extension name:',
    initial: defaultExtensionName
  },
  // TODO: optimize, encapsulate
  {
    name: 'shouldOverwrite',
    type: (prev, values) => {
      const { extensionScope, extensionName, projectName: projectIdx } = values
      const project =
        extensionScope === 0 ? projectNameChoices[projectIdx] : null
      const projectPath = project ? project.path : ''
      const targetDirname = getTargetDirname(
        extensionScope,
        projectPath,
        extensionName
      )
      return canSafelyOverwrite(targetDirname) ? null : 'confirm'
    },
    message: (prev, values) => {
      const { extensionScope, extensionName, projectName: projectIdx } = values
      const project =
        extensionScope === 0 ? projectNameChoices[projectIdx] : null
      const projectPath = project ? project.path : ''
      const targetDirname = getTargetDirname(
        extensionScope,
        projectPath,
        extensionName
      )
      const dirForPrompt = `Target directory "${green(targetDirname)}"`

      return `${dirForPrompt} is not empty. Remove existing files and continue?`
    }
  },
  {
    name: 'overwriteChecker',
    type: (prev, values = {}) => {
      if (values.shouldOverwrite === false) {
        throw new Error(red('✖') + ' Operation cancelled')
      }
      return null
    }
  },
  {
    name: 'extensionTemplate',
    type: 'select',
    message: 'Extension template:',
    choices: templateChoices,
    initial: 0
  }
]

const promptsOptions = {
  onCancel: () => {
    throw new Error(red('✖') + ' Operation cancelled')
  }
}

async function init() {
  figlet('CC Extension', { font: 'Big' }, (err, data) => {
    if (err) {
      console.log(
        `\n${blue('An easy way to create a cocos creator extension.')}\n`
      )
    } else {
      console.log(blue(data as string))
    }
  })

  console.log(process.env.npm_execpath)

  let result = {}

  try {
    result = await prompts(promptsQuestions, promptsOptions)
  } catch (cancelled: any) {
    console.log(cancelled.message)
    process.exit(1)
  }

  const {
    extensionScope,
    editorVersion,
    projectName: projectIdx,
    extensionTemplate,
    extensionName,
    shouldOverwrite
  } = result as PromptsResult
  const isProjectScope = extensionScope === 0
  const project =
    isProjectScope && projectIdx !== undefined
      ? projectNameChoices[projectIdx]
      : null
  const projectPath = project ? project.path : ''
  const root = getTargetDirname(extensionScope, projectPath, extensionName)

  console.log(root)

  // overwrite target dir
  if (shouldOverwrite) {
    fs.emptyDirSync(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\nScaffolding project in ${root}...\n`)

  const templateRoot = path.resolve(__dirname, 'template')
  const templateDir = path.resolve(
    templateRoot,
    templateChoices[extensionTemplate].dirname
  )

  // package.json: update name and write package.json
  const pkgJson = fs.readFileSync(path.resolve(templateDir, 'package.json'), {
    encoding: 'utf-8'
  })
  const pkgObj = JSON.parse(pkgJson)
  console.log('239', isProjectScope)
  pkgObj.name = extensionName
  pkgObj.editor = '>=' + isProjectScope ? project?.version : editorVersion
  pkgObj.description = `i18n:${extensionName}.description`

  // FIXME: this is temporary handle
  if (pkgObj.panels) {
    pkgObj.panels.default.title = `${extensionName} Default Panel`
  }
  if (pkgObj.contributions) {
    pkgObj.contributions.menu.forEach(
      (item: { path: string }, index: number) =>
        (item.path = `i18n:menu.${
          index === 0 ? 'panel' : 'develop'
        }/${extensionName}`)
    )
  }

  fs.writeFileSync(
    path.resolve(root, 'package.json'),
    JSON.stringify(pkgObj, null, 2)
  )

  // README: write readme
  // TODO: use js string generate, do not read file
  let readmeEN = fs.readFileSync(path.resolve(templateDir, 'README.md'), {
    encoding: 'utf-8'
  })
  let readmeCN = fs.readFileSync(path.resolve(templateDir, 'README-CN.md'), {
    encoding: 'utf-8'
  })
  const extensionNamePlaceholder = '{{ extensionName }}'
  if (readmeEN.includes(extensionNamePlaceholder)) {
    readmeEN = readmeEN.replaceAll(extensionNamePlaceholder, extensionName)
  }
  if (readmeCN.includes(extensionNamePlaceholder)) {
    readmeCN = readmeCN.replaceAll(extensionNamePlaceholder, extensionName)
  }
  fs.writeFileSync(path.resolve(root, 'README.md'), readmeEN)
  fs.writeFileSync(path.resolve(root, 'README-CN.md'), readmeCN)

  // write base file
  const filterFunc = (src: string): boolean => {
    return !(src.includes('package.json') || src.includes('README'))
  }
  fs.copySync(templateDir, root, { filter: filterFunc })

  // finish log
  console.log(`\nDone. Now run:\n`)

  const cwd = process.cwd()
  if (root !== cwd) {
    console.log(`  ${bold(green(`cd ${root}`))}\r\n`)
  }
  console.log(`  ${bold(green('yarn install'))}`)
  console.log(`  ${bold(green('yarn build'))}`)
  console.log()
}

init().catch((err) => {
  console.log(err)
})
