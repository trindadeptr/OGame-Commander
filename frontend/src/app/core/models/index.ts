export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
  token: string;
}

export interface Universe {
  id: number;
  name: string;
  url: string;
  discordWebhook: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bot {
  id: number;
  uuid: string;
  name: string;
  universe: Universe;
  lastSeenAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  type: 'CHECK_ACTIVITY' | 'SPY_PLAYER';
  status: 'CREATED' | 'IN_PROGRESS' | 'FINISHED' | 'ERROR';
  playerName?: string;
  universe: Universe;
  bot?: Bot;
  recurrenceMinutes?: number;
  taskParams?: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskResult {
  id: number;
  task: Task;
  fullResult?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface CreateTaskRequest {
  type: 'CHECK_ACTIVITY' | 'SPY_PLAYER';
  playerName?: string;
  universeId: number;
  recurrenceMinutes?: number;
  taskParams?: string;
}

export interface CreateUniverseRequest {
  name: string;
  url: string;
  discordWebhook: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface UpdateUserRequest {
  role?: 'ADMIN' | 'USER';
  disabled?: boolean;
}

export interface TaskFilters {
  playerName?: string;
  botId?: number;
  universeId?: number;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
