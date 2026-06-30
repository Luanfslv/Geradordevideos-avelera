import { useState } from "react";
import type { Member, Screen, Tab } from "./types";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Gerar from "./tabs/Gerar";
import MeusVideos from "./tabs/MeusVideos";
import Configuracoes from "./tabs/Configuracoes";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<Member | null>(null);
  const [tab, setTab] = useState<Tab>("gerar");

  function handleLogin(member: Member) {
    setUser(member);
    setTab("gerar");
    setScreen("app");
  }

  function handleLogout() {
    setUser(null);
    setScreen("login");
  }

  if (screen === "login" || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)", overflowX: "clip" }}>
      <Navbar user={user} tab={tab} onTab={setTab} onLogout={handleLogout} />
      {tab === "gerar" && <Gerar onGoToVideos={() => setTab("videos")} />}
      {tab === "videos" && <MeusVideos onNew={() => setTab("gerar")} />}
      {tab === "config" && <Configuracoes user={user} />}
    </div>
  );
}
