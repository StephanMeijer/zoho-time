export const API_BASE_URL = 'https://books.zoho.eu/api/v3' // TODO: make .eu dynamic or anything
export const TOKEN_ENDPOINT = 'https://accounts.zoho.eu/oauth/v2/token' // TODO: make .eu dynamic or anything
export const REDIRECT_URI = 'http://localhost:8182/redirect'

export const API = {
  refreshToken: (client_id: string, client_secret: string, refresh_token: string): string => {
    const url = new URL(TOKEN_ENDPOINT)

    url.search = (new URLSearchParams({
      client_secret,
      client_id,
      refresh_token,
      redirect_uri: REDIRECT_URI,
      grant_type: 'refresh_token',
    })).toString()

    return url.toString()
  },

  projects: () => `${API_BASE_URL}/projects`,
  timeEntries: () => `${API_BASE_URL}/projects/timeentries?sort_column=log_date`,
  tasks: (project_id: string) => `${API_BASE_URL}/projects/${project_id}/tasks`,
  users: (project_id: string) => `${API_BASE_URL}/projects/${project_id}/users`,
}
