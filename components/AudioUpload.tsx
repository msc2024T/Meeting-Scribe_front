"use client";

import { useState } from "react";
import { apiService } from "@/utils";

interface AudioUploadProps {
  onUploadSuccess?: (result: {
    id: string;
    filename: string;
    url: string;
  }) => void;
  onUploadError?: (error: string) => void;
}

export default function AudioUpload({
  onUploadSuccess,
  onUploadError,
}: AudioUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/mpeg",
    ];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.("Please select a valid audio file (MP3, WAV, OGG, M4A)");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      onUploadError?.("File size must be less than 50MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiService.uploadAudioFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        onUploadSuccess?.(response.data);
        setSelectedFile(null);
        setUploadProgress(0);
      } else {
        onUploadError?.("Upload failed. Please try again.");
      }
    } catch (error: any) {
      onUploadError?.(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-500 ease-in-out transform bg-white backdrop-blur-sm ${
          dragActive
            ? "border-violet-500 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 scale-105 shadow-2xl shadow-violet-200/50 border-3"
            : "border-slate-300 hover:border-violet-400 hover:bg-gradient-to-br hover:from-slate-50 hover:to-indigo-50 hover:shadow-xl hover:shadow-indigo-100/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Animated background pattern */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
            dragActive ? "opacity-20" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl"></div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-violet-200/50 rounded-full animate-pulse"></div>
          <div className="absolute bottom-6 left-6 w-6 h-6 bg-purple-200/50 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-indigo-200/50 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="text-center relative z-10">
          <div className={`mx-auto mb-6 ${dragActive ? "animate-bounce" : ""}`}>
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-violet-300/50 ring-4 ring-white ring-opacity-50">
              <svg
                className="w-10 h-10 text-white"
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
          </div>
          <div className="space-y-4">
            <label htmlFor="audio-upload" className="cursor-pointer group">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {dragActive
                    ? "Drop your audio file here"
                    : "Upload Audio File"}
                </h3>
                <p className="text-slate-600 text-base">
                  Drag and drop your audio file here, or click to browse
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-300/50 hover:shadow-xl hover:shadow-violet-400/50 transform hover:scale-105 group-hover:scale-105">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Choose File
                </div>
              </div>
            </label>
            <input
              id="audio-upload"
              name="audio-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center bg-white/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200/50">
              <svg
                className="w-4 h-4 mr-2 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              MP3, WAV, OGG, M4A
            </div>
            <div className="flex items-center bg-white/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200/50">
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a4 4 0 004 4z"
                />
              </svg>
              Max 50MB
            </div>
          </div>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden transform animate-in slide-in-from-top-4 duration-500">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200/50 ring-4 ring-white/50">
                    <svg
                      className="w-8 h-8 text-white"
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
                </div>
                <div className="ml-6">
                  <h4 className="text-xl font-bold text-slate-900">
                    {selectedFile.name}
                  </h4>
                  <p className="text-slate-600 mt-1 flex items-center">
                    <span className="inline-flex items-center bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                      {formatFileSize(selectedFile.size)}
                    </span>
                    <span className="text-emerald-600 font-medium">
                      Ready to upload
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="flex-shrink-0 p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                disabled={isUploading}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-8">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-violet-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Uploading...
                  </span>
                  <span className="text-violet-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="mt-8">
              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-violet-300/50 hover:shadow-2xl hover:shadow-violet-400/50 transform hover:scale-105"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                    Uploading your audio file...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload Audio File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
