import {Command, flags} from '@oclif/command'

import {CLIError} from '@oclif/errors'

import cli from 'cli-ux'
import {clientFromConfig} from '../api'
import {TimeEntryResource} from '../api.types'

import {valiDate} from '../lib/date'

export default class TimeEntriesLogInteractive extends Command {
  static description = 'Interactive time logging'

  static aliases = ['time:interactive', 'time:i', 'log:i']

  static examples = [
    `$ zt projects
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = []

  async run() {
    const client = await clientFromConfig()

    const {projects} = await client.getProjects()

    cli.table(
      projects.map((p, i) => ({i, ...p})),
      {
        i: {header: 'Index'},
        status: {},
        customer_name: {header: 'Customer'},
        project_name: {header: 'Name'},
        description: {},
        rate: {},
      },
    )

    console.log('')

    const postData: Partial<TimeEntryResource> = {}

    const projectI = await cli.prompt('What customer and project do you want to log for?')

    console.log('')

    const project = projects[parseInt(projectI, 10)]

    postData.project_id = project.project_id

    const {task} = await client.getTasks(project.project_id)

    cli.table(
      task.map((p, i) => ({i, ...p})),
      {
        i: {header: 'Index'},
        customer_name: {header: 'Customer'},
        project_name: {header: 'Project'},
        task_name: {header: 'Task'},
        description: {},
      },
    )

    console.log('')

    const taskI = await cli.prompt('What task do you want to log for?')

    postData.task_id = task[taskI].task_id

    postData.log_date = valiDate(await cli.prompt('On what date do you want to log? (today, yesterday, tomorrow, sunday, ..saturday, YYYY-MM-DD)')) as string

    const timeOrPeriod = await cli.prompt('Time or period? [T / P]')

    if (timeOrPeriod === 'T') {
      postData.log_time = await cli.prompt('How long? [HH:MM]')
    } else {
      postData.begin_time = await cli.prompt('When did it begin? [HH:MM]')
      postData.end_time = await cli.prompt('When did it end? [HH:MM]')
    }

    postData.notes = await cli.prompt('Description')

    const currentUser = await client.getCurrentUser(project.project_id)

    if (currentUser) {
      cli.log(`Current user: ${currentUser.email}`)

      postData.user_id = currentUser.user_id

      await client.createTimeEntry(postData as TimeEntryResource)
    } else {
      throw new CLIError('Could not find current user. User select is not programemd yet.')
    }
  }
}
