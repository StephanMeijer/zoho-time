import {Command, flags} from '@oclif/command'

import cli from 'cli-ux'
import {clientFromConfig} from '../api'

import {CLIError} from '@oclif/errors'
import {ProjectResource, TaskResource} from '../api.types'

export default class Tasks extends Command {
  static description = 'Task Overview'

  static examples = [
    `$ zt tasks
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'project',
      required: false,
      description: 'Human name of project',
    },
  ]

  async run() {
    const {args} = this.parse(Tasks)

    const client = await clientFromConfig()
    const projects = await client.getProjects()

    let data: TaskResource[]

    if (args.project) {
      const specificProjects = projects.projects.filter(p => p.project_name.toLowerCase() === args.project.toLowerCase())

      if (specificProjects.length === 0) {
        throw new CLIError(`Project \`${args.project}\` not found. Fuck off.`)
      }

      const specificProject = specificProjects[0]

      data = (await client.getTasks(specificProject.project_id)).task
    } else {
      const tasks: Promise<TaskResource[]>[] = projects.projects.reduce((acc: string[], p: ProjectResource) => {
        if (acc.indexOf(p.project_id) === -1) {
          acc.push(p.project_id)
        }

        return acc
      }, []).map(async project_id => {
        const taskData = await client.getTasks(project_id)
        return taskData.task
      })

      const responses = await Promise.all(tasks)

      data = responses.reduce((acc: TaskResource[], tasks: TaskResource[]) => acc.concat(tasks), [])
    }

    cli.table(
      data,
      {
        customer_name: {header: 'Customer'},
        project_name: {header: 'Project'},
        task_name: {header: 'Task'},
        description: {},
      },
    )
  }
}
