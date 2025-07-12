"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/utils";
import { AudioFile } from "@/utils/types";

interface AudioListProps {
  onAudioSelect?: (audioFile: AudioFile) => void;
  showActions?: boolean;
  maxItems?: number;
  refreshTrigger?: number;
  onOpenDrawer?: (
    audioFile: AudioFile,
    type: "transcription" | "summary"
  ) => void;
}

export default function AudioList({
  onAudioSelect,
  showActions = true,
  maxItems,
  refreshTrigger,
  onOpenDrawer,
}: AudioListProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcribingAudio, setTranscribingAudio] = useState<string | null>(
    null
  );
  const [transcriptionStatus, setTranscriptionStatus] = useState<{
    [key: string]: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [summarizingAudio, setSummarizingAudio] = useState<string | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    loadAudioFiles();
  }, [refreshTrigger]);

  const loadAudioFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAudioFiles();

      if (response.success && response.data) {
        console.log("Audio files loaded:", response.data);
        let files = response.data.data; // Access the nested data array
        if (maxItems) {
          files = files.slice(0, maxItems);
        }
        setAudioFiles(files);
      } else {
        setError("Failed to load audio files");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load audio files");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAudio = async (audioFileId: string, fileName: string) => {
    try {
      const response = await apiService.getAudioFileUrl(audioFileId);

      if (response.success && response.data?.audio_file_url) {
        // Create a temporary anchor element to trigger download
        const link = document.createElement("a");
        link.href = response.data.audio_file_url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError("Failed to get audio file URL");
      }
    } catch (err: any) {
      setError(err.message || "Failed to get audio file URL");
    }
  };

  const handlePlayAudio = async (audioFileId: string) => {
    try {
      const response = await apiService.getAudioFileUrl(audioFileId);

      if (response.success && response.data?.audio_file_url) {
        // Set the playing audio and URL for inline player
        setPlayingAudio(audioFileId);
        setAudioUrl(response.data.audio_file_url);
      } else {
        setError("Failed to get audio file URL");
      }
    } catch (err: any) {
      setError(err.message || "Failed to get audio file URL");
    }
  };

  const handleStopAudio = () => {
    setPlayingAudio(null);
    setAudioUrl(null);
  };

  const handleTranscribeAudio = async (audioFileId: string) => {
    try {
      setTranscribingAudio(audioFileId);
      setTranscriptionStatus((prev) => ({
        ...prev,
        [audioFileId]: "processing",
      }));

      const response = await apiService.createTranscription(audioFileId);

      if (response.success) {
        // Start polling for transcription status
        pollTranscriptionStatus(audioFileId);
      } else {
        setError("Failed to start transcription");
        setTranscriptionStatus((prev) => ({
          ...prev,
          [audioFileId]: "failed",
        }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to start transcription");
      setTranscriptionStatus((prev) => ({ ...prev, [audioFileId]: "failed" }));
    } finally {
      setTranscribingAudio(null);
    }
  };

  const pollTranscriptionStatus = async (audioFileId: string) => {
    try {
      const response = await apiService.getTranscriptionStatus(audioFileId);

      if (response.success && response.data) {
        const status = response.data.status;
        setTranscriptionStatus((prev) => ({ ...prev, [audioFileId]: status }));

        if (status === "processing" || status === "pending") {
          // Continue polling every 5 seconds
          setTimeout(() => pollTranscriptionStatus(audioFileId), 5000);
        } else if (status === "completed") {
          // Show success message or redirect to transcript view
          setSuccessMessage(
            `Transcription completed for ${
              audioFiles.find((f) => f.id === audioFileId)?.name || "audio file"
            }`
          );
          setTimeout(() => setSuccessMessage(null), 5000); // Clear message after 5 seconds

          if (response.data.transcript) {
            console.log("Transcript:", response.data.transcript);
          }
        } else if (status === "failed") {
          setError(
            `Transcription failed for ${
              audioFiles.find((f) => f.id === audioFileId)?.name || "audio file"
            }`
          );
          setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
        }
      }
    } catch (err: any) {
      console.error("Error polling transcription status:", err);
      setTranscriptionStatus((prev) => ({ ...prev, [audioFileId]: "failed" }));
    }
  };

  const handleSummarizeAudio = async (audioFileId: string) => {
    try {
      setSummarizingAudio(audioFileId);
      setSummaryStatus((prev) => ({ ...prev, [audioFileId]: "processing" }));

      const response = await apiService.createAudioSummary(audioFileId);

      if (response.success) {
        // Start polling for summary status
        pollSummaryStatus(audioFileId);
      } else {
        setError("Failed to start summarization");
        setSummaryStatus((prev) => ({ ...prev, [audioFileId]: "failed" }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to start summarization");
      setSummaryStatus((prev) => ({ ...prev, [audioFileId]: "failed" }));
    } finally {
      setSummarizingAudio(null);
    }
  };

  const pollSummaryStatus = async (audioFileId: string) => {
    try {
      const response = await apiService.getAudioSummaryStatus(audioFileId);

      if (response.success && response.data) {
        const status = response.data.status;
        setSummaryStatus((prev) => ({ ...prev, [audioFileId]: status }));

        if (status === "processing" || status === "pending") {
          // Continue polling every 5 seconds
          setTimeout(() => pollSummaryStatus(audioFileId), 5000);
        } else if (status === "completed") {
          // Show success message
          setSuccessMessage(
            `Summary completed for ${
              audioFiles.find((f) => f.id === audioFileId)?.name || "audio file"
            }`
          );
          setTimeout(() => setSuccessMessage(null), 5000); // Clear message after 5 seconds

          if (response.data.summary) {
            console.log("Summary:", response.data.summary);
          }
        } else if (status === "failed") {
          setError(
            `Summarization failed for ${
              audioFiles.find((f) => f.id === audioFileId)?.name || "audio file"
            }`
          );
          setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
        }
      }
    } catch (err: any) {
      console.error("Error polling summary status:", err);
      setSummaryStatus((prev) => ({ ...prev, [audioFileId]: "failed" }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading audio files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-red-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={loadAudioFiles}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (audioFiles.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No audio files
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload your first audio file to get started with transcription.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Audio Files</h3>
        {!maxItems && (
          <button
            onClick={loadAudioFiles}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {audioFiles.map((audioFile) => (
            <li key={audioFile.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {audioFile.name}
                    </p>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span>{formatFileSize(audioFile.size)}</span>
                      <span>{formatDuration(audioFile.durtion_seconds)}</span>
                      <span>{formatDate(audioFile.uploaded_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {showActions && (
                    <div className="flex items-center space-x-1">
                      {onAudioSelect && (
                        <button
                          onClick={() => onAudioSelect(audioFile)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Select
                        </button>
                      )}
                      <button
                        onClick={() =>
                          playingAudio === audioFile.id
                            ? handleStopAudio()
                            : handlePlayAudio(audioFile.id)
                        }
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        {playingAudio === audioFile.id ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Stop
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Play
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadAudio(audioFile.id, audioFile.name)
                        }
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Download
                      </button>
                      <button
                        onClick={() =>
                          onOpenDrawer?.(audioFile, "transcription")
                        }
                        disabled={
                          transcribingAudio === audioFile.id ||
                          transcriptionStatus[audioFile.id] === "processing"
                        }
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {transcribingAudio === audioFile.id ||
                        transcriptionStatus[audioFile.id] === "processing" ? (
                          <>
                            <svg
                              className="animate-spin w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            {transcriptionStatus[audioFile.id] === "processing"
                              ? "Processing..."
                              : "Starting..."}
                          </>
                        ) : transcriptionStatus[audioFile.id] ===
                          "completed" ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Completed
                          </>
                        ) : transcriptionStatus[audioFile.id] === "failed" ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Failed
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Transcribe
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onOpenDrawer?.(audioFile, "summary")}
                        disabled={
                          summarizingAudio === audioFile.id ||
                          summaryStatus[audioFile.id] === "processing"
                        }
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {summarizingAudio === audioFile.id ||
                        summaryStatus[audioFile.id] === "processing" ? (
                          <>
                            <svg
                              className="animate-spin w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            {summaryStatus[audioFile.id] === "processing"
                              ? "Processing..."
                              : "Starting..."}
                          </>
                        ) : summaryStatus[audioFile.id] === "completed" ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Completed
                          </>
                        ) : summaryStatus[audioFile.id] === "failed" ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Failed
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4zm2 2h8v2H6V6zm0 4h8v2H6v-2zm0 4h5v2H6v-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Summarize
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Inline Audio Player */}
              {playingAudio === audioFile.id && audioUrl && (
                <div className="mt-4 px-6 pb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Now Playing: {audioFile.name}
                        </p>
                        <audio
                          controls
                          className="w-full mt-2"
                          src={audioUrl}
                          onEnded={handleStopAudio}
                          autoPlay
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
