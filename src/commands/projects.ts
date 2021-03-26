import {Command, flags} from '@oclif/command'

import cli from 'cli-ux'
import {clientFromConfig} from '../api'

const axios = require('axios')
const os = require('os')
const path = require('path')
const states = require('fs').constants
const fs = require('fs').promises
const yaml = require('js-yaml')
const express = require('express')

export default class Projects extends Command {
  static description = 'Project Overview'

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
    const data = await client.getProjects()

    cli.table(
      data.projects,
      {
        status: {},
        customer_name: {header: 'Customer'},
        project_name: {header: 'Name'},
        description: {},
        rate: {},
      },
    )
  }
}
