import os from 'os'
import path from 'path'
import fs from 'fs-extra'

// TODO: 拆分常量以及类型、分类函数到多文件

const globalCreatorDirname = '.CocosCreator'
const globalCocosDirname = '.Cocos'
const extensionDirname = 'extensions'

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
type ProjectProfile = {
  name: string
  path: string
  type: string
  version: string
  otime: number
  mtime: number
}

function getGlobalCocosPath() {
  return path.join(os.homedir(), globalCocosDirname)
}

function getGlobalCreatorExtensionPath() {
  return path.join(os.homedir(), globalCreatorDirname, extensionDirname)
}

export function isValidPackageName(projectName: string): boolean {
  return /^(?:@[a-z0-9-*~][a-z0-9-*.,_~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  )
}

export function toValidPackageName(projectName: string): string {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-')
}

export function canSafelyOverwrite(dir: string): boolean {
  return !fs.existsSync(dir) || fs.readdirSync(dir).length === 0
}

export function getTargetDirname(
  scope: number,
  projectPath: string,
  extensionName: string
): string {
  const isProjectScope = scope === 0

  if (isProjectScope) {
    return path.join(projectPath, extensionDirname, extensionName)
  }

  // global
  return path.join(getGlobalCreatorExtensionPath(), extensionName)
}

export function getCocosEditorsInfo(): EditorProfile[] | null {
  const cocosPath = getGlobalCocosPath()
  const editorFilePath = path.join(cocosPath, 'profiles', 'editor.json')
  const contentStr = fs.readFileSync(editorFilePath, { encoding: 'utf-8' })
  const contentObj = JSON.parse(contentStr)

  if (!contentObj) {
    return null
  }
  if (!contentObj['editor']) {
    return null
  }

  const ret = contentObj['editor']['Creator3D']
  if (!ret || ret.length === 0) {
    return null
  }

  return ret
}

export function getCocosProjectsInfo(): ProjectProfile[] | null {
  const cocosPath = getGlobalCocosPath()
  const editorFilePath = path.join(cocosPath, 'profiles', 'project.json')
  const contentStr = fs.readFileSync(editorFilePath, { encoding: 'utf-8' })
  const contentObj = JSON.parse(contentStr)

  if (!contentObj) {
    return null
  }

  const map = contentObj['map']
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
