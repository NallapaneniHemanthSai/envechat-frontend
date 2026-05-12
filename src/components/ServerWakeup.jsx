import { useEffect, useState } from "react";

export default function ServerWakeup({ onReady }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    const checkServer = async () => {
      try {
        const res = await fetch(
          "https://envechat.onrender.com/api/auth/ping"
        );

        if (res.ok) {
          clearInterval(timer);
          onReady();
        }
      } catch (err) {
        console.log("Backend sleeping...");
      }
    };

    checkServer();

    const interval = setInterval(checkServer, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [onReady]);

  return (
    <div className="h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center px-6">
        <h1 className="text-5xl font-bold mb-4">
          EnveChat
        </h1>

        <p className="text-gray-300 text-lg">
          Initializing servers...
        </p>

        <div className="mt-6 w-72 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-white animate-pulse w-1/2"></div>
        </div>

        <p className="mt-5 text-gray-500 text-sm">
          Free hosting cold start detected
        </p>

        <p className="text-gray-600 text-xs mt-2">
          waited {seconds}s
        </p>
      </div>
    </div>
  );
}