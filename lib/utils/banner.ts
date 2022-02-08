import figlet from 'figlet'
import { blue } from 'kolorist'

// @ts-ignore
import Big from 'figlet/importable-fonts/Big'

figlet.parseFont('Big', Big)

export function showBanner() {
  figlet('CC Extension', { font: 'Big' }, (err, data) => {
    if (err) {
      console.log(
        `\n${blue('An easy way to create a cocos creator extension.')}\n`
      )
    } else {
      console.log(blue(data as string))
    }
  })
}
