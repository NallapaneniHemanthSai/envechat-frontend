import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ServerWakeup from "./components/ServerWakeup";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";

function App() {
  const [serverReady, setServerReady] = useState(false);

  if (!serverReady) {
    return (
      <ServerWakeup
        onReady={() => setServerReady(true)}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;