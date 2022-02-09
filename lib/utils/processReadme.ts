import path from 'path'
import fs from 'fs-extra'

type ReadmeOptions = {
  extensionName: string
  templatePath: string
  targetPath: string
}

export default function processReadme({
  extensionName,
  templatePath,
  targetPath
}: ReadmeOptions) {
  let readmeEN = fs.readFileSync(path.resolve(templatePath, 'README.md'), {
    encoding: 'utf-8'
  })
  let readmeCN = fs.readFileSync(path.resolve(templatePath, 'README-CN.md'), {
    encoding: 'utf-8'
  })

  const extensionNamePlaceholder = '{{ extensionName }}'
  const extensionNameRegexp = /{{\s?extensionName\s?}}/g

  if (readmeEN.includes(extensionNamePlaceholder)) {
    readmeEN = readmeEN.replace(extensionNameRegexp, extensionName)
  }

  if (readmeCN.includes(extensionNamePlaceholder)) {
    readmeCN = readmeCN.replace(extensionNameRegexp, extensionName)
  }

  fs.writeFileSync(path.resolve(targetPath, 'README.md'), readmeEN)
  fs.writeFileSync(path.resolve(targetPath, 'README-CN.md'), readmeCN)
}
