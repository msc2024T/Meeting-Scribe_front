"use client";

import { useState, useEffect } from "react";
import Drawer from "./Drawer";
import { SummaryData, AudioFile } from "@/utils/types";
import { apiService } from "@/utils";

interface DrawerManagerProps {
  audioFile: AudioFile | null;
  type: "transcription" | "summary";
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawerManager({
  audioFile,
  type,
  isOpen,
  onClose,
}: DrawerManagerProps) {
  const [drawerData, setDrawerData] = useState<string | SummaryData | null>(
    null
  );
  const [drawerAudioUrl, setDrawerAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("not_started");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && audioFile) {
      loadDrawerData();
    } else {
      // Reset state when drawer closes
      setDrawerData(null);
      setDrawerAudioUrl(null);
      setStatus("not_started");
    }
  }, [isOpen, audioFile, type]);

  const loadDrawerData = async () => {
    if (!audioFile) return;

    setLoading(true);

    try {
      // Load audio URL
      const audioResponse = await apiService.getAudioFileUrl(audioFile.id);
      if (audioResponse.success && audioResponse.data) {
        setDrawerAudioUrl(audioResponse.data.audio_file_url);
      }

      // Load transcription or summary data
      if (type === "transcription") {
        try {
          // Try to get existing transcription directly
          const transcriptionResponse = await apiService.getTranscription(
            audioFile.id
          );
          if (transcriptionResponse.success && transcriptionResponse.data) {
            console.log("Transcription response:", transcriptionResponse.data);
            // Check if response contains actual transcription data or "not found" message
            if (
              typeof transcriptionResponse.data === "string" &&
              transcriptionResponse.data === "Transcription not found"
            ) {
              // No transcription exists yet
              setDrawerData(null);
              setStatus("not_started");
            } else if (
              transcriptionResponse.data &&
              typeof transcriptionResponse.data === "object"
            ) {
              // Check if it's the nested structure { data: { id, text, ... } }
              const transcriptData =
                "data" in transcriptionResponse.data
                  ? transcriptionResponse.data.data
                  : transcriptionResponse.data;

              if (
                transcriptData &&
                typeof transcriptData === "object" &&
                "text" in transcriptData
              ) {
                console.log("Transcription data:", transcriptData);
                // Transcription exists, use the 'text' field
                setDrawerData((transcriptData as { text: string }).text);
                setStatus("completed");
              } else {
                // Unexpected response format
                setDrawerData(null);
                setStatus("not_started");
              }
            } else {
              // Unexpected response format
              setDrawerData(null);
              setStatus("not_started");
            }
          } else {
            // No transcription exists yet
            setDrawerData(null);
            setStatus("not_started");
          }
        } catch (error) {
          // If transcription doesn't exist, it's not started
          setDrawerData(null);
          setStatus("not_started");
        }
      } else {
        // For summary, use the new summarizer endpoint
        try {
          const summaryResponse = await apiService.getSummary(audioFile.id);
          if (summaryResponse.success && summaryResponse.data) {
            // Check if response contains actual summary data or error message
            if ("error" in summaryResponse.data) {
              // No summary exists yet
              setDrawerData(null);
              setStatus("not_started");
            } else {
              // Summary exists, use the structured data
              setDrawerData(summaryResponse.data);
              setStatus("completed");
            }
          } else {
            // No summary exists yet
            setDrawerData(null);
            setStatus("not_started");
          }
        } catch (error) {
          // If summary doesn't exist, it's not started
          setDrawerData(null);
          setStatus("not_started");
        }
      }
    } catch (error) {
      console.error(`Error loading ${type} data:`, error);
      setDrawerData(null);
      setStatus("not_started");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAction = async (audioFileId: string) => {
    try {
      setStatus("processing");

      if (type === "transcription") {
        const response = await apiService.createTranscription(audioFileId);
        if (response.success && response.data) {
          console.log("Create transcription response:", response.data);
          // Check if the response contains immediate transcription data
          if (response.data.data && response.data.data.text) {
            // Transcription completed immediately
            setDrawerData(response.data.data.text);
            setStatus("completed");
          } else {
            // Fall back to polling if no immediate text
            pollTranscriptionStatus(audioFileId);
          }
        } else {
          setStatus("failed");
        }
      } else {
        const response = await apiService.createSummary(audioFileId);
        if (response.success && response.data) {
          console.log("Create summary response:", response.data);
          // Summary completed immediately
          setDrawerData(response.data);
          setStatus("completed");
        } else {
          setStatus("failed");
        }
      }
    } catch (error) {
      console.error(`Error starting ${type}:`, error);
      setStatus("failed");
    }
  };

  const pollTranscriptionStatus = async (audioFileId: string) => {
    try {
      // First try to get the transcription directly
      const transcriptionResponse = await apiService.getTranscription(
        audioFileId
      );
      if (transcriptionResponse.success && transcriptionResponse.data) {
        // Check if response contains actual transcription data or "not found" message
        if (
          typeof transcriptionResponse.data === "string" &&
          transcriptionResponse.data === "Transcription not found"
        ) {
          // Still not ready, continue polling
        } else if (
          transcriptionResponse.data &&
          typeof transcriptionResponse.data === "object"
        ) {
          // Check if it's the nested structure { data: { id, text, ... } }
          const transcriptData =
            "data" in transcriptionResponse.data
              ? transcriptionResponse.data.data
              : transcriptionResponse.data;

          if (
            transcriptData &&
            typeof transcriptData === "object" &&
            "text" in transcriptData
          ) {
            // Transcription is ready
            setDrawerData((transcriptData as { text: string }).text);
            setStatus("completed");
            return;
          }
        }
      }

      // If not available, check status
      const statusResponse = await apiService.getTranscriptionStatus(
        audioFileId
      );
      if (statusResponse.success && statusResponse.data) {
        const currentStatus = statusResponse.data.status;
        setStatus(currentStatus);

        if (currentStatus === "processing" || currentStatus === "pending") {
          // Continue polling every 5 seconds
          setTimeout(() => pollTranscriptionStatus(audioFileId), 5000);
        } else if (
          currentStatus === "completed" &&
          statusResponse.data.transcript
        ) {
          setDrawerData(statusResponse.data.transcript);
        } else if (currentStatus === "failed") {
          setStatus("failed");
        }
      }
    } catch (error) {
      console.error("Error polling transcription status:", error);
      // Try again in 5 seconds if still processing
      if (status === "processing") {
        setTimeout(() => pollTranscriptionStatus(audioFileId), 5000);
      } else {
        setStatus("failed");
      }
    }
  };

  const pollSummaryStatus = async (audioFileId: string) => {
    try {
      const response = await apiService.getAudioSummaryStatus(audioFileId);
      if (response.success && response.data) {
        const currentStatus = response.data.status;
        setStatus(currentStatus);

        if (currentStatus === "processing" || currentStatus === "pending") {
          // Continue polling every 5 seconds
          setTimeout(() => pollSummaryStatus(audioFileId), 5000);
        } else if (currentStatus === "completed" && response.data.summary) {
          setDrawerData(response.data.summary);
        } else if (currentStatus === "failed") {
          setStatus("failed");
        }
      }
    } catch (error) {
      console.error("Error polling summary status:", error);
      // Try again in 5 seconds if still processing
      if (status === "processing") {
        setTimeout(() => pollSummaryStatus(audioFileId), 5000);
      } else {
        setStatus("failed");
      }
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      audioFile={audioFile}
      type={type}
      data={drawerData}
      status={loading ? "loading" : status}
      onStartAction={handleStartAction}
      audioUrl={drawerAudioUrl}
    />
  );
}
