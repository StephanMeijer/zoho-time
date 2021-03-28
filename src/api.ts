import axios from 'axios'
import {ProjectResourcesResponse, TaskResourcesResponse, TimeEntryResourceResponse, TimeEntryResource, UserResource, UserResourcesResponse} from './api.types'
import {authorizationHeader} from './config'
import {API} from './constants'

export class ApiClient {
    protected header: { Authorization: string };

    constructor(header: { Authorization: string }) {
      this.header = header
    }

    public async getTasks(project_id: string): Promise<TaskResourcesResponse> {
      return this.request<TaskResourcesResponse>(API.tasks(project_id))
    }

    public async getProjects(): Promise<ProjectResourcesResponse> {
      return this.request<ProjectResourcesResponse>(API.projects())
    }

    public async getTimeEntries(): Promise<TimeEntryResourceResponse> {
      return this.request<TimeEntryResourceResponse>(API.timeEntries())
    }

    public async getUsers(project_id: string): Promise<UserResourcesResponse> {
      return this.request<UserResourcesResponse>(API.users(project_id))
    }

    public async getCurrentUser(project_id: string): Promise<UserResource | undefined> {
      const {users} = await this.request<UserResourcesResponse>(API.users(project_id))

      return users.find(u => u.is_current_user)
    }

    public async createTimeEntry(entry: TimeEntryResource) {
      await axios.post('https://books.zoho.eu/api/v3/projects/timeentries', entry, {headers: this.header})
    }

    protected async request<T>(url: string): Promise<T> {
      const response = await axios.get<T>(url, {headers: this.header})
      return response.data
    }
}

export const clientFromConfig = async () => new ApiClient(await authorizationHeader())
