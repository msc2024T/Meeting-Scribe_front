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

// Audio transcription types
export interface AudioTranscriptionRequest {
  audioFileId: string;
}

export interface AudioTranscriptionResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  progress?: number;
  transcript?: string;
  createdAt: string;
  updatedAt: string;
}

// Audio summarization types
export interface AudioSummarizationRequest {
  audioFileId: string;
}

export interface AudioSummarizationResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  progress?: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

// Summary types
export interface ActionItem {
  id: number;
  description: string;
  assigned_to: string;
  due_date: string;
  status: string;
}

export interface KeyPoint {
  id: number;
  content: string;
}

export interface SummaryData {
  subject: string;
  action_items: ActionItem[];
  key_points: KeyPoint[];
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
