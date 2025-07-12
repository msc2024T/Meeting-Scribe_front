"use client";

import { useState, useEffect } from "react";
import { AudioFile } from "@/utils/types";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  audioFile: AudioFile | null;
  type: "transcription" | "summary";
  data: string | null;
  status: string;
  onStartAction: (audioFileId: string) => void;
  audioUrl: string | null;
}

export default function Drawer({
  isOpen,
  onClose,
  audioFile,
  type,
  data,
  status,
  onStartAction,
  audioUrl,
}: DrawerProps) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Close drawer on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!audioFile) return null;

  const title = type === "transcription" ? "Transcription" : "Summary";
  const actionButtonText =
    type === "transcription" ? "Start Transcription" : "Start Summary";
  const noDataMessage =
    type === "transcription"
      ? "No transcription available for this audio file."
      : "No summary available for this audio file.";

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={`fixed inset-0 backdrop-blur-sm bg-black/10 transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-white/95 backdrop-blur-md shadow-2xl border-l border-gray-200 transform transition-all duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className={`h-full flex flex-col transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm"
            style={{ animationDelay: isOpen ? "100ms" : "0ms" }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className={`h-8 w-8 ${
                    type === "transcription"
                      ? "text-purple-600"
                      : "text-orange-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {type === "transcription" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  )}
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {audioFile.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 hover:scale-110 transition-all duration-200 ease-in-out"
            >
              <svg
                className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div
            className={`flex-1 overflow-y-auto p-6 space-y-6 transition-all duration-300 ease-in-out ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ animationDelay: isOpen ? "150ms" : "0ms" }}
          >
            {/* Audio Player */}
            <div
              className={`bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 transition-all duration-300 ease-in-out hover:shadow-md hover:scale-[1.02] ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ animationDelay: isOpen ? "200ms" : "0ms" }}
            >
              <div className="flex items-center space-x-3 mb-3">
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
                    Audio Player
                  </p>
                  <p className="text-xs text-gray-500">{audioFile.name}</p>
                </div>
              </div>

              {audioUrl ? (
                <audio
                  controls
                  className="w-full"
                  src={audioUrl}
                  onPlay={() => setIsAudioPlaying(true)}
                  onPause={() => setIsAudioPlaying(false)}
                  onEnded={() => setIsAudioPlaying(false)}
                >
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <svg
                    className="h-12 w-12 mr-2"
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
                  <span>Audio not available</span>
                </div>
              )}
            </div>

            {/* Status and Action */}
            <div
              className={`space-y-4 transition-all duration-300 ease-in-out ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ animationDelay: isOpen ? "250ms" : "0ms" }}
            >
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {status === "processing" && (
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600"
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
                  )}
                  {status === "completed" && (
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {status === "failed" && (
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  Status:{" "}
                  <span
                    className={`capitalize ${
                      status === "processing"
                        ? "text-blue-600"
                        : status === "completed"
                        ? "text-green-600"
                        : status === "failed"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {status || "Not started"}
                  </span>
                </span>
              </div>

              {/* Action Button */}
              {!data && status !== "processing" && status !== "completed" && (
                <button
                  onClick={() => onStartAction(audioFile.id)}
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                    type === "transcription"
                      ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                      : "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  {actionButtonText}
                </button>
              )}
            </div>

            {/* Content Display */}
            <div
              className={`bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 transition-all duration-300 ease-in-out hover:shadow-md ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ animationDelay: isOpen ? "300ms" : "0ms" }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {title} Result
                </h3>
                {data && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                )}
              </div>

              {data ? (
                <div className="prose max-w-none">
                  <div className="bg-white rounded-md p-4 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {data}
                    </pre>
                  </div>
                </div>
              ) : status === "processing" ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600 mr-3"
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
                    <span className="text-gray-600">
                      Processing {type}... This may take a few minutes.
                    </span>
                  </div>
                </div>
              ) : status === "failed" ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center text-red-600">
                    <svg
                      className="h-8 w-8 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {type === "transcription" ? "Transcription" : "Summary"}{" "}
                      failed. Please try again.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="h-12 w-12 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {type === "transcription" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    )}
                  </svg>
                  <p>{noDataMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
