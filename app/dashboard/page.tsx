"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiService } from "@/utils";
import AudioUpload from "@/components/AudioUpload";
import AudioList from "@/components/AudioList";
import Drawer from "@/components/Drawer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as reduxLogout } from "@/store/slices/authSlice";
import { AudioFile } from "@/utils/types";

export default function DashboardPage() {
  const [refreshAudioList, setRefreshAudioList] = useState(0);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAudioFile, setDrawerAudioFile] = useState<AudioFile | null>(
    null
  );
  const [drawerType, setDrawerType] = useState<"transcription" | "summary">(
    "transcription"
  );
  const [drawerData, setDrawerData] = useState<string | null>(null);
  const [drawerAudioUrl, setDrawerAudioUrl] = useState<string | null>(null);
  const [transcriptionData, setTranscriptionData] = useState<{
    [key: string]: string;
  }>({});
  const [summaryData, setSummaryData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const checkAuth = async () => {
      // Check Redux state first
      if (!isAuthenticated) {
        // Fallback to localStorage/sessionStorage for backward compatibility
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");

        if (!token) {
          router.push("/login");
          return;
        }
      }
    };

    checkAuth();
  }, [router, isAuthenticated]);

  const openDrawer = async (
    audioFile: AudioFile,
    type: "transcription" | "summary"
  ) => {
    setDrawerAudioFile(audioFile);
    setDrawerType(type);
    setIsDrawerOpen(true);

    // Load audio URL for the drawer
    try {
      const response = await apiService.getAudioFileUrl(audioFile.id);
      if (response.success && response.data) {
        setDrawerAudioUrl(response.data.audio_file_url);
      }
    } catch (error) {
      console.error("Error loading audio URL:", error);
    }

    // Set drawer data if available
    if (type === "transcription") {
      setDrawerData(transcriptionData[audioFile.id] || null);
    } else {
      setDrawerData(summaryData[audioFile.id] || null);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerAudioFile(null);
    setDrawerData(null);
    setDrawerAudioUrl(null);
  };

  const handleTranscribeAudio = async (audioFileId: string) => {
    try {
      const response = await apiService.createTranscription(audioFileId);
      if (response.success) {
        // Start polling for transcription status
        pollTranscriptionStatus(audioFileId);
      }
    } catch (error) {
      console.error("Error starting transcription:", error);
    }
  };

  const handleSummarizeAudio = async (audioFileId: string) => {
    try {
      const response = await apiService.createAudioSummary(audioFileId);
      if (response.success) {
        // Start polling for summary status
        pollSummaryStatus(audioFileId);
      }
    } catch (error) {
      console.error("Error starting summary:", error);
    }
  };

  const pollTranscriptionStatus = async (audioFileId: string) => {
    try {
      const response = await apiService.getTranscriptionStatus(audioFileId);
      if (response.success && response.data) {
        const status = response.data.status;

        if (status === "processing" || status === "pending") {
          // Continue polling every 5 seconds
          setTimeout(() => pollTranscriptionStatus(audioFileId), 5000);
        } else if (status === "completed" && response.data.transcript) {
          // Store the transcript data
          setTranscriptionData((prev) => ({
            ...prev,
            [audioFileId]: response.data.transcript!,
          }));

          // Update drawer data if this is the current audio file
          if (
            drawerAudioFile?.id === audioFileId &&
            drawerType === "transcription"
          ) {
            setDrawerData(response.data.transcript);
          }
        }
      }
    } catch (error) {
      console.error("Error polling transcription status:", error);
    }
  };

  const pollSummaryStatus = async (audioFileId: string) => {
    try {
      const response = await apiService.getAudioSummaryStatus(audioFileId);
      if (response.success && response.data) {
        const status = response.data.status;

        if (status === "processing" || status === "pending") {
          // Continue polling every 5 seconds
          setTimeout(() => pollSummaryStatus(audioFileId), 5000);
        } else if (status === "completed" && response.data.summary) {
          // Store the summary data
          setSummaryData((prev) => ({
            ...prev,
            [audioFileId]: response.data.summary!,
          }));

          // Update drawer data if this is the current audio file
          if (drawerAudioFile?.id === audioFileId && drawerType === "summary") {
            setDrawerData(response.data.summary);
          }
        }
      }
    } catch (error) {
      console.error("Error polling summary status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear Redux state
      dispatch(reduxLogout());

      // Clear localStorage/sessionStorage for backward compatibility
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("refreshToken");

      router.push("/login");
    }
  };

  const handleUploadSuccess = (result: {
    id: string;
    filename: string;
    url: string;
  }) => {
    // Trigger audio list refresh
    setRefreshAudioList((prev) => prev + 1);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full translate-x-1/2 -translate-y-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Meeting Scribe Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Meeting Scribe
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.first_name.charAt(0)}
                        {user.last_name.charAt(0)}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-slate-700">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Upload Section */}
        <div className="mb-12">
          <AudioUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Audio List Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/50">
          <div className="p-8">
            <AudioList
              refreshTrigger={refreshAudioList}
              onOpenDrawer={openDrawer}
            />
          </div>
        </div>
      </main>

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        audioFile={drawerAudioFile}
        type={drawerType}
        data={drawerData}
        status={
          drawerAudioFile
            ? drawerType === "transcription"
              ? "completed" // You may want to track status properly
              : "completed"
            : ""
        }
        onStartAction={
          drawerType === "transcription"
            ? handleTranscribeAudio
            : handleSummarizeAudio
        }
        audioUrl={drawerAudioUrl}
      />
    </div>
  );
}
