import {CLIError} from '@oclif/errors'
import axios from 'axios'
import {API, REDIRECT_URI} from './constants'

const os = require('os')
const path = require('path')
const states = require('fs').constants
const fs = require('fs').promises
const yaml = require('js-yaml')

export interface Auth<T> {
    access_token: string;
    refresh_token: string;
    api_domain: string;
    expires_in: number;
    expires_at: T;
    token_type: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    api_domain: string;
    expires_in: number;
    token_type: string;
}

export interface RefreshTokenResponse {
    access_token: string;
    token_type: string;
    api_domain: string;
    expires_in: number;
}

export interface Config<T> {
    client_id: string;
    client_secret: string;
    auth?: Auth<T>;
}

const filepath = path.join(os.homedir(), '.zt.yml')

export const getConfig = async (): Promise<Config<Date>> => {
  await fs.access(filepath, states.R_OK)
  const content = await fs.readFile(filepath)
  const config = yaml.load(content) as Config<string>

  if (config.auth) {
    return {
      ...config,
      auth: {
        ...config.auth,
        expires_at: new Date(config.auth.expires_at),
      },
    }
  }

  const {client_id, client_secret} = config

  return {client_id, client_secret}
}

export const setConfig = async (config: Config<Date>): Promise<void> => {
  const codedConfig: Config<string> = {
    ...config,
    auth: config.auth ? {
      ...config.auth,
      expires_at: config.auth.expires_at.toISOString(),
    } : undefined,
  }

  await fs.writeFile(filepath, yaml.dump(codedConfig))
}

export const validToken = async (config: Config<Date> | undefined = undefined): Promise<boolean> => {
  if (!config) {
    config = await getConfig()
  }

  if (config.auth) {
    return new Date() < new Date(config.auth.expires_at)
  }

  return false
}

export const authorizationHeader = async (config: Config<Date> | undefined = undefined): Promise<{ Authorization: string }> => {
  if (!config) {
    config = await getConfig()
  }

  if (!config.auth) {
    throw new CLIError('Please run `zt login`.')
  }

  if (!await validToken()) {
    const dateTimeOfRequest = new Date()
    const response = await axios.post<RefreshTokenResponse>(API.RefreshToken(config.client_id, config.client_secret, config.auth.refresh_token))

    dateTimeOfRequest.setTime(dateTimeOfRequest.getTime() + 1000 * response.data.expires_in)
    config.auth = {...config.auth, ...response.data, expires_at: dateTimeOfRequest}
    setConfig(config)
  }

  return {Authorization: `Bearer ${config.auth.access_token}`}
}
