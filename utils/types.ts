// Common types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  status?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access: string;
    refresh: string;
    user: User;
  };
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Meeting types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  participants: User[];
  transcript?: string;
  summary?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  participantIds: string[];
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  participantIds?: string[];
  status?: "scheduled" | "ongoing" | "completed" | "cancelled";
}

// Transcript types
export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: number;
  confidence?: number;
}

export interface Transcript {
  id: string;
  meetingId: string;
  segments: TranscriptSegment[];
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// Summary types
export interface Summary {
  id: string;
  meetingId: string;
  content: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assignedTo?: string;
  dueDate?: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

// Search types
export interface SearchQuery {
  query: string;
  filters?: {
    startDate?: string;
    endDate?: string;
    participants?: string[];
    status?: Meeting["status"];
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// File upload types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type:
    | "meeting_started"
    | "meeting_ended"
    | "transcript_ready"
    | "summary_ready";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Audio file types
export interface AudioFile {
  id: string;
  name: string;
  size: number;
  extention: string;
  durtion_seconds: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  uploaded_at: string;
}

export interface AudioFileListResponse {
  data: AudioFile[];
}

export interface AudioFileUrlResponse {
  audio_file_url: string;
}

// Settings types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    meetingReminders: boolean;
    transcriptReady: boolean;
    summaryReady: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: "12h" | "24h";
  };
}

// Health check types
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: "healthy" | "unhealthy";
    storage: "healthy" | "unhealthy";
    transcription: "healthy" | "unhealthy";
  };
}
