import path from 'path'
import os from 'os'
import fs from 'fs-extra'

import {
  GLOBAL_COCOS_DIRNAME,
  GLOBAL_CREATOR_DIRNAME,
  EXTENSION_DIRNAME
} from './constants'

// Cocos Creator Editor Profile
type EditorProfile = {
  type: string
  version: string
  ctime: number
  file: string
  url: string
  progress: string
  state: string
  percent: number
  unzipDist: string
}

// Cocos Project Profile
type ProjectProfile = {
  name: string
  path: string
  type: string
  version: string
  otime: number
  mtime: number
}

type ProjectPromptItem = {
  title: string
  path: string
  description: string
}

export function getGlobalCocosPath() {
  return path.join(os.homedir(), GLOBAL_COCOS_DIRNAME)
}

export function getGlobalCreatorExtensionPath() {
  return path.join(os.homedir(), GLOBAL_CREATOR_DIRNAME, EXTENSION_DIRNAME)
}

/**
 * get all versions of the cocos editor (Creator3D)
 */
export function getCocosEditorsInfo(): EditorProfile[] | null {
  const cocosPath = getGlobalCocosPath()
  const editorProfilePath = path.join(cocosPath, 'profiles', 'editor.json')

  if (!fs.pathExistsSync(editorProfilePath)) {
    return null
  }

  const content = fs.readFileSync(editorProfilePath, { encoding: 'utf-8' })
  const profile = JSON.parse(content)

  if (!profile) {
    return null
  }

  if (!profile['editor']) {
    return null
  }

  const ret = profile['editor']['Creator3D']
  if (!ret || ret.length === 0) {
    return null
  }

  return ret
}

/**
 * get all cocos projects information
 */
export function getCocosProjectsInfo(): ProjectProfile[] | null {
  const cocosPath = getGlobalCocosPath()
  const projectProfilePath = path.join(cocosPath, 'profiles', 'project.json')

  if (!fs.pathExistsSync(projectProfilePath)) {
    return null
  }

  const content = fs.readFileSync(projectProfilePath, { encoding: 'utf-8' })
  const profile = JSON.parse(content)

  if (!profile) {
    return null
  }

  const map = profile['map']
  if (!map) {
    return null
  }
  if (Object.keys(map).length === 0) {
    return null
  }

  return Object.keys(map).map((item) => {
    const pathArr = item.split(path.sep)
    const name = pathArr[pathArr.length - 1]
    return {
      path: item,
      name,
      type: map[item].type,
      version: map[item].version,
      otime: map[item].otime,
      mtime: map[item].mtime
    }
  })
}

/**
 * get the final extension target path
 * if `project` is valid, the extension is a project-level extension
 * @param {string} extensionName
 * @param {ProjectPromptItem | null} project
 */
export function getExtensionTargetPath(
  extensionName: string,
  project: ProjectPromptItem | null
): string {
  if (project != null) {
    const projectPath = project.path
    const projectExtensionPath = path.join(projectPath, EXTENSION_DIRNAME)

    // by default, the `extension` directory does not exist for the project
    if (!fs.pathExistsSync(projectExtensionPath)) {
      fs.mkdirSync(projectExtensionPath)
    }

    return path.join(projectPath, EXTENSION_DIRNAME, extensionName)
  }

  return path.join(getGlobalCreatorExtensionPath(), extensionName)
}
