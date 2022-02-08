export type PromptsResult = {
  extensionScope: number
  editorVersion?: string
  projectName?: string
  extensionName: string
  shouldOverwrite?: boolean
  extensionTemplate: number
}

// Cocos Creator Editor Profile
export type EditorProfile = {
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

export type EditorPromptItem = {
  title: string
  description: string
}

// Cocos Project Profile
export type ProjectProfile = {
  name: string
  path: string
  type: string
  version: string
  otime: number
  mtime: number
}

export type ProjectPromptItem = {
  title: string
  path: string
  description: string
}
