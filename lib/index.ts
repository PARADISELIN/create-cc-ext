#!/usr/bin/env node

import path from 'path'
import prompts, { PromptObject } from 'prompts'
import { red, green, bold } from 'kolorist'
import fs from 'fs-extra'

import { canSafelyOverwrite } from './utils'
import { showBanner } from './utils/banner'
import {
  getCocosEditorsInfo,
  getCocosProjectsInfo,
  getExtensionTargetPath
} from './utils/cocos'
import processPackageJson from './utils/processPackageJson'
import processReadme from './utils/processReadme'
import type { PromptsResult } from './types'

const defaultExtensionName = 'cc-extension'
const scopeChoices = [
  { title: 'Project', description: 'project-level extension' },
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
      description: item.path
    }))
  : []

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
      if (values.extensionScope === 1 && !editorsInfo) {
        throw new Error(
          red('✖') +
            ' Operation cancelled, you may not have any versions of the editor installed.'
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
  {
    name: 'shouldOverwrite',
    type: (prev, { extensionName, projectName: idx }) => {
      const extensionTargetPath = getExtensionTargetPath(
        extensionName,
        idx !== undefined && projectsInfo ? projectsInfo[idx] : null
      )
      return canSafelyOverwrite(extensionTargetPath) ? null : 'confirm'
    },
    message: (prev, { extensionName, projectName: idx }) => {
      const extensionTargetPath = getExtensionTargetPath(
        extensionName,
        idx !== undefined && projectsInfo ? projectsInfo[idx] : null
      )
      const dirForPrompt = `Target directory "${green(extensionTargetPath)}"`

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
  showBanner()

  let result = {}

  try {
    result = await prompts(promptsQuestions, promptsOptions)
  } catch (cancelled: any) {
    console.log(cancelled.message)
    process.exit(1)
  }

  const {
    editorVersion,
    projectName: projectIdx,
    extensionTemplate,
    extensionName,
    shouldOverwrite
  } = result as PromptsResult

  const isProjectScope = projectIdx !== undefined
  const project =
    isProjectScope && projectsInfo ? projectsInfo[projectIdx] : null
  const targetPath = getExtensionTargetPath(extensionName, project)

  // overwrite target path
  if (shouldOverwrite) {
    fs.emptyDirSync(targetPath)
  } else if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath)
  }

  console.log(`\nScaffolding project in ${targetPath}...\n`)

  // extension default template path
  const templatePath = path.resolve(
    __dirname,
    'template',
    templateChoices[extensionTemplate].dirname
  )

  // package.json: update name and write package.json
  const packageJsonOptions = {
    extensionName,
    templatePath,
    targetPath,
    editorVersion,
    project
  }
  processPackageJson(packageJsonOptions)

  // README: write readme
  const readmeOptions = { extensionName, templatePath, targetPath }
  processReadme(readmeOptions)

  // write base file
  const filterFunc = (src: string): boolean => {
    return !(src.includes('package.json') || src.includes('README'))
  }
  fs.copySync(templatePath, targetPath, { filter: filterFunc })

  // finish log
  console.log(`\nDone. Now run:\n`)

  const cwd = process.cwd()
  if (targetPath !== cwd) {
    console.log(`  ${bold(green(`cd ${targetPath}`))}\r\n`)
  }
  console.log(`  ${bold(green('yarn install'))}`)
  console.log(`  ${bold(green('yarn build'))}`)
  console.log()
}

init().catch((err) => {
  console.log(err)
})
