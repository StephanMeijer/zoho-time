import {Command, flags} from '@oclif/command'

import {CLIError} from '@oclif/errors'
import { boolean } from '@oclif/parser/lib/flags'

import cli from 'cli-ux'
import { clientFromConfig } from '../api'
import { ITimeEntry } from '../api.types'
import { AuthorizationHeader, getConfig, setConfig } from '../config'

import { API } from '../constants'

const axios = require('axios')
const os = require('os')
const path = require('path')
const states = require('fs').constants
const fs = require('fs').promises
const yaml = require('js-yaml')
const express = require('express')

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
    const data = await client.getTimeEntries()
    const config = await getConfig();

    const { projects } = await client.getProjects()

    cli.table(
      projects.map((p, i )=> ({ i, ...p  })),
      {
        i: { header: "Index" },
        status: {},
        customer_name: { header: 'Customer' },
        project_name: { header: 'Name' },
        description: {},
        rate: {}
      }
    )

    console.log("")

    var projectI, taskI, date, timeOrPeriod, start, end, period;

    var postData: Partial<ITimeEntry> = {};

    while (projects[parseInt(projectI)] === undefined) {
      projectI = await cli.prompt("What customer and project do you want to log for?")
    }

    console.log("")

    const project = projects[parseInt(projectI)]

    postData.project_id = project.project_id;
    
    const { task } = await client.getTasks(project.project_id)

    cli.table(
      task.map((p, i )=> ({ i, ...p  })),
      {
        i: { header: "Index" },
        customer_name: { header: 'Customer' },
        project_name: { header: 'Project' },
        task_name: { header: 'Task' },
        description: {}
      }
    )

    console.log("")

    while (projects[parseInt(taskI)] === undefined) {
      taskI = await cli.prompt("What task do you want to log for?")
    }

    postData.task_id = task[taskI].task_id

    const valiDate = (date: string): string | null => {
      if (!date) {
        return null;
      }

      const now = new Date();

      const dateStr = (date: Date) => date.toISOString().substring(0, 10);
      
      const translators = {
        yesterday: (): string => { now.setDate(now.getDate() + 1); return dateStr(now) },
        tomorrow:  (): string => { now.setDate(now.getDate() - 1); return dateStr(now) },
        today:     (): string => dateStr(now)
      }

      if (Object.keys(translators).indexOf(date) > -1) {
        return translators[date as 'yesterday' | 'tomorrow' | 'today']()
      }

      return date.match(/(\d){4}-\d{1,2}-\d{1,2}/) !== null ? date : null;
    }

    while (!postData.log_date) {
      postData.log_date = valiDate(await cli.prompt("On what date do you want to log? (today, yesterday, tomorrow, YYYY-MM-DD)")) as string
    }

    while ([ 'T', 'P' ].indexOf(timeOrPeriod) === -1) {
      timeOrPeriod = await cli.prompt('Time or period? [T / P]')
    }

    if (timeOrPeriod == 'T') {
      postData.log_time = await cli.prompt('How long? [HH:MM]')
    } else {
      postData.begin_time = await cli.prompt('When did it begin? [HH:MM]')
      postData.end_time = await cli.prompt('When did it end? [HH:MM]')
    }

    postData.notes = await cli.prompt('Description')

    const currentUser = await client.getCurrentUser(project.project_id);

    if (currentUser) {
      cli.log(`Current user: ${currentUser.email}`)

      postData.user_id = currentUser.user_id

      await client.createTimeEntry(postData, config.organization_id);
    } else {
      throw new CLIError('Could not find current user. User select is not programemd yet.');
    }
  }
}