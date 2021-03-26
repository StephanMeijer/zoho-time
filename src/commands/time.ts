import {Command, flags} from '@oclif/command'

import cli from 'cli-ux'
import {clientFromConfig} from '../api'

export default class TimeEntries extends Command {
  static description = 'Time Overview'

  static aliases = ['time:list']

  static examples = []

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = []

  async run() {
    const client = await clientFromConfig()
    const data = await client.getTimeEntries()

    cli.table(
      data.time_entries,
      {
        log_date: {header: 'Date'},
        customer_name: {header: 'Customer'},
        project_name: {header: 'Project'},
        log_time: {header: 'Duration'},
        notes: {},
      },
      {
        sort: '-log_date',
      },
    )
  }
}
