import axios from "axios";
import { IProjectsResponse, ITasksResponse, ITimeEntriesResponse, ITimeEntry, IUser, IUsersResponse } from "./api.types";
import { authorizationHeader } from "./config";
import { API } from "./constants";

export class ApiClient {
    protected header: { Authorization: string };

    constructor(header: { Authorization: string }) {
        this.header = header
    }

    public async getTasks(project_id: string): Promise<ITasksResponse> {
        return this.request<ITasksResponse>(API.Tasks(project_id));
    }

    public async getProjects(): Promise<IProjectsResponse> {
        return this.request<IProjectsResponse>(API.Projects());
    }

    public async getTimeEntries(): Promise<ITimeEntriesResponse> {
        return this.request<ITimeEntriesResponse>(API.TimeEntries());
    }

    public async getUsers(project_id: string): Promise<IUsersResponse> {
        return this.request<IUsersResponse>(API.Users(project_id));
    }

    public async getCurrentUser(project_id: string): Promise<IUser | undefined> {
        const { users } = await this.request<IUsersResponse>(API.Users(project_id));

        return users.find(u => u.is_current_user);
    }

    public async createTimeEntry(entry: Partial<ITimeEntry>, organization_id: string) {
        await axios.post(`https://books.zoho.eu/api/v3/projects/timeentries`, entry, { headers: this.header })
    }

    protected async request<T>(url: string): Promise<T> {
        const response = await axios.get<T>(url, { headers: this.header })
        return response.data
    }
}

export const clientFromConfig = async () => new ApiClient(await authorizationHeader())