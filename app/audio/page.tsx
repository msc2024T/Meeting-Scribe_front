"use client";

import { useState } from "react";
import AudioUpload from "@/components/AudioUpload";
import AudioList from "@/components/AudioList";

export default function AudioPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (result: {
    id: string;
    filename: string;
    url: string;
  }) => {
    // Trigger audio list refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="mb-8">
          <AudioUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Audio List Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <AudioList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
