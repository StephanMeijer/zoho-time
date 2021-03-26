import {Command, flags} from '@oclif/command'
import { getConfig } from '../config'

const os = require('os')
const path = require('path')
const states = require('fs').constants
const fs = require('fs').promises
const yaml = require('js-yaml')

export default class Config extends Command {
  static description = 'Check or initialize config file'

  static examples = [
    `$ zt config
{....}
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = []

  static initialYaml = 'client_id:\nclient_secret:\n'

  async run() {
    // const {_args, _flags} = this.parse(Config)

    // TODO: or cli option as value
    const filepath = path.join(os.homedir(), '.zt.yml')

    try {
      await fs.access(filepath, states.F_OK)
    } catch (error) {
      await fs.writeFile(filepath, Config.initialYaml)
    }

    const content = await fs.readFile(filepath)

    const config = yaml.load(content)

    console.log('Location:', filepath, "\n")
    console.dir(config)
  }
}

