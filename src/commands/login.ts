import {Command, flags} from '@oclif/command'

import {CLIError} from '@oclif/errors'

import cli from 'cli-ux'
import express = require('express')
import {Socket} from 'net'
import {getConfig, TokenResponse, setConfig} from '../config'
import {REDIRECT_URI} from '../constants'

const axios = require('axios')

interface ExpressSocket extends Socket {
  server: {
    close: () => void;
  };
}

export default class Login extends Command {
  static description = 'Perform OAuth'

  static examples = []

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = []

  static initialYaml = 'client_id:\nclient_secret:\n'

  async run() {
    // const {_args, _flags} = this.parse(Config)

    const app = express()
    const generatedState = Math.random().toString(36).substring(2)
    const config = await getConfig()

    let grant

    app.get('/redirect', (req: express.Request, res: express.Response) => {
      if (generatedState !== req.query.state) {
        (res.connection as ExpressSocket).server.close()
        throw new CLIError(`State does not match generated state. State generated: ${generatedState}, state given: ${req.query.state}`)
      }

      grant = req.query

      this.log('Succesfull!')

      res.send('<script>window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";</script>');

      (res.connection as ExpressSocket).server.close()

      const generatedStateSnd = Math.random().toString(36).substring(2)

      const url = `${grant['accounts-server']}/oauth/v2/token?code=${grant.code}&client_id=${config.client_id}&state=${generatedStateSnd}&client_secret=${config.client_secret}&redirect_uri=${REDIRECT_URI}&grant_type=authorization_code`

      const dateTimeOfRequest = new Date()

      axios.post(url).then((response: { data: TokenResponse }) => {
        dateTimeOfRequest.setTime(dateTimeOfRequest.getTime() + (1000 * response.data.expires_in))
        config.auth = {...response.data, expires_at: dateTimeOfRequest}

        setConfig(config)

        console.dir(config)
      })
    })

    app.listen(8182, () => {
      cli.open(
        `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=${config.client_id}&state=${generatedState}&response_type=code&redirect_uri=${REDIRECT_URI}&access_type=offline&prompt=consent`,
      )
    })
  }
}
