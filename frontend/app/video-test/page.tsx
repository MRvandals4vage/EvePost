import React from 'react';

export default function VideoTest() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl mb-8">Video Test Page</h1>
        <p className="mb-4">Testing video playback. Check console for errors.</p>

        {/* Test 1: Basic video element */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Test 1: Basic Video</h2>
          <video
            controls
            className="w-full max-w-2xl"
            src="/herovid.mp4"
            autoPlay
            loop
            muted
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Test 2: Video with different attributes */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Test 2: Video with Background</h2>
          <div className="relative w-full max-w-2xl h-64 bg-gray-800 mx-auto">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src="/herovid.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>

        <div className="mt-8 text-sm">
          <p>If you see video controls but no video playing:</p>
          <p>1. Try clicking the play button</p>
          <p>2. Check browser console for errors</p>
          <p>3. Try refreshing the page</p>
          <p>4. Check if autoplay is blocked by browser</p>
        </div>
      </div>
    </div>
  );
}
