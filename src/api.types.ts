export interface IPageContext {
    page: number;
    per_page: number;
    has_more_page: false;
    report_name: string;
    applied_filter: string;
    sort_column: string;
    sort_order: string;
}

export interface IApiResponse {
    code: number;
    message: 'success';
    page_context: IPageContext;
}

export interface IProject {
    project_id: string;
    project_name: string;
    customer_id: string;
    customer_name: string;
    description: string;
    can_be_invoiced: boolean;
    status: 'active';
    billing_type: 'based_on_project_hours';
    rate: number;
    created_time: string;
    last_modified_time: string;
    has_attachment: boolean;
    total_hours: string;
    billable_hours: string;
    other_services_app_source: string;
    users_working: string;
}

export interface ITimeEntry {
    time_entry_id: string;
    project_id: string;
    project_name: string;
    customer_id: string;
    customer_name: string;
    user_id: string;
    is_current_user: boolean;
    user_name: string;
    log_date: string;
    begin_time: string;
    end_time: string;
    log_time: string;
    is_billable: boolean;
    billed_status: string;
    invoice_id: string;
    notes: string;
    timer_started_at: string;
    timer_duration_in_minutes: string;
    created_time: string;
    cost_rate: number;
    cost_amount: number;
}

export interface ITask {
    project_id: string;
    task_id: string;
    customer_id: string;
    currency_id: string;
    task_name: string;
    project_name: string;
    customer_name: string;
    billed_hours: string;
    log_time: string;
    unbilled_hours: string;
    description: string;
    rate: string;
    budget_hours: string;
}

export interface IUser {
    user_id: string;
    is_current_user: boolean;
    user_name: string;
    email: string;
    user_role: string;
    status: string;
    rate: number;
    budget_hours: string;
    cost_rate: string;
}

export interface IUsersResponse extends IApiResponse {
    users: IUser[]
}

export interface IProjectsResponse extends IApiResponse {
    projects: IProject[]
}

export interface ITimeEntriesResponse extends IApiResponse {
    time_entries: ITimeEntry[];
}

export interface ITasksResponse extends IApiResponse {
    task: ITask[];
}