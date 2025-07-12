import httpService, { ApiResponse } from "./httpService";
import {
  User,
  LoginResponse,
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  AudioFile,
  AudioFileListResponse,
  AudioFileUrlResponse,
} from "./types";

// API service class
class ApiService {
  // Authentication endpoints
  public async login(
    email: string,
    password: string,
    is_remembered: boolean = false
  ): Promise<ApiResponse<LoginResponse>> {
    return httpService.post("/users/login/", {
      email,
      password,
      is_remembered,
    });
  }

  public async logout(): Promise<ApiResponse<void>> {
    const response = await httpService.post("/auth/logout");
    httpService.clearAuthToken();
    return response;
  }

  public async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return httpService.post("/auth/register", userData);
  }

  public async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return httpService.post("/auth/refresh");
  }

  // User endpoints
  public async getCurrentUser(): Promise<ApiResponse<User>> {
    return httpService.get("/users/me");
  }

  public async updateUser(
    userId: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return httpService.put(`/users/${userId}`, userData);
  }

  public async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return httpService.delete(`/users/${userId}`);
  }

  // Meeting endpoints
  public async getMeetings(): Promise<ApiResponse<Meeting[]>> {
    return httpService.get("/meetings");
  }

  public async getMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    return httpService.get(`/meetings/${meetingId}`);
  }

  public async createMeeting(
    meetingData: CreateMeetingRequest
  ): Promise<ApiResponse<Meeting>> {
    return httpService.post("/meetings", meetingData);
  }

  public async updateMeeting(
    meetingId: string,
    meetingData: UpdateMeetingRequest
  ): Promise<ApiResponse<Meeting>> {
    return httpService.put(`/meetings/${meetingId}`, meetingData);
  }

  public async deleteMeeting(meetingId: string): Promise<ApiResponse<void>> {
    return httpService.delete(`/meetings/${meetingId}`);
  }

  // Meeting transcript endpoints
  public async uploadTranscript(
    meetingId: string,
    file: File
  ): Promise<ApiResponse<{ transcript: string }>> {
    return httpService.uploadFile(
      `/meetings/${meetingId}/transcript`,
      file,
      "file"
    );
  }

  // Audio file upload endpoint
  public async uploadAudioFile(
    file: File
  ): Promise<ApiResponse<{ id: string; filename: string; url: string }>> {
    return httpService.uploadFile("/files/audio-files/", file, "audio_file");
  }

  // List audio files endpoint
  public async getAudioFiles(): Promise<ApiResponse<AudioFileListResponse>> {
    return httpService.get("/files/audio-files/");
  }

  // Get single audio file endpoint
  public async getAudioFile(
    audioFileId: string
  ): Promise<ApiResponse<AudioFile>> {
    return httpService.get(`/files/audio-files/${audioFileId}/`);
  }

  // Get audio file download URL endpoint
  public async getAudioFileUrl(
    audioFileId: string
  ): Promise<ApiResponse<AudioFileUrlResponse>> {
    return httpService.get(`/files/audio-files/${audioFileId}/`);
  }

  // Create transcription from audio file
  public async createTranscription(
    audioFileId: string
  ): Promise<ApiResponse<{ id: string; status: string; message: string }>> {
    return httpService.post(`/files/audio-files/${audioFileId}/transcribe/`);
  }

  // Get transcription status
  public async getTranscriptionStatus(
    audioFileId: string
  ): Promise<
    ApiResponse<{ status: string; progress?: number; transcript?: string }>
  > {
    return httpService.get(`/files/audio-files/${audioFileId}/transcription/`);
  }

  // Create summary from audio file
  public async createAudioSummary(
    audioFileId: string
  ): Promise<ApiResponse<{ id: string; status: string; message: string }>> {
    return httpService.post(`/files/audio-files/${audioFileId}/summarize/`);
  }

  // Get summary status
  public async getAudioSummaryStatus(
    audioFileId: string
  ): Promise<
    ApiResponse<{ status: string; progress?: number; summary?: string }>
  > {
    return httpService.get(`/files/audio-files/${audioFileId}/summary/`);
  }

  // Delete audio file endpoint
  public async deleteAudioFile(
    audioFileId: string
  ): Promise<ApiResponse<void>> {
    return httpService.delete(`/audio-files/${audioFileId}/`);
  }

  public async generateSummary(
    meetingId: string
  ): Promise<ApiResponse<{ summary: string }>> {
    return httpService.post(`/meetings/${meetingId}/summary`);
  }

  // Search endpoints
  public async searchMeetings(query: string): Promise<ApiResponse<Meeting[]>> {
    return httpService.get(`/meetings/search?q=${encodeURIComponent(query)}`);
  }

  // Health check
  public async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return httpService.get("/health");
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export the class for creating new instances if needed
export { ApiService };
