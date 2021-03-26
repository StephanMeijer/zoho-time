import {Command, flags} from '@oclif/command'

import {CLIError} from '@oclif/errors'

import cli from 'cli-ux'
import {clientFromConfig} from '../api'
import {AuthorizationHeader, getConfig, setConfig} from '../config'

import {API} from '../constants'

const axios = require('axios')
const os = require('os')
const path = require('path')
const states = require('fs').constants
const fs = require('fs').promises
const yaml = require('js-yaml')
const express = require('express')

export default class TimeEntriesLog extends Command {
  static description = 'Project Overview'

  static aliases = ['time:log', 'time:new', 'time:create']

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
