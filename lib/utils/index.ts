import os from 'os'
import path from 'path'
import fs from 'fs-extra'

import { getGlobalCreatorExtensionPath } from './cocos'
import { EXTENSION_DIRNAME } from './constants'

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
