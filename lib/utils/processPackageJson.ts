import fs from 'fs-extra'
import path from 'path'

import type { ProjectProfile } from '../types'

type PackageJsonOptions = {
  extensionName: string
  templatePath: string
  targetPath: string
  editorVersion: string | undefined
  project: ProjectProfile | null
}

export default function processPackageJson({
  extensionName,
  templatePath,
  targetPath,
  editorVersion,
  project
}: PackageJsonOptions) {
  const content = fs.readFileSync(path.resolve(templatePath, 'package.json'), {
    encoding: 'utf-8'
  })
  const pkgJson = JSON.parse(content)

  pkgJson.name = extensionName
  pkgJson.editor = '>=' + (project ? project.version : editorVersion)
  pkgJson.description = `i18n:${extensionName}.description`

  if (pkgJson.panels) {
    pkgJson.panels.default.title = `${extensionName} Default Panel`
  }

  // TODO: check
  if (pkgJson.contributions) {
    pkgJson.contributions.menu.forEach(
      (item: { path: string }, index: number) =>
        (item.path = `i18n:menu.${
          index === 0 ? 'panel' : 'develop'
        }/${extensionName}`)
    )
  }

  fs.writeFileSync(
    path.resolve(targetPath, 'package.json'),
    JSON.stringify(pkgJson, null, 2)
  )
}
