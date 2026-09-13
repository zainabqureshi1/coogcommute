import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Carpool from "./pages/Carpool";
import Calculator from "./pages/Calculator";
import Alerts from "./pages/Alerts";
import About from "./pages/About";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      {/* Full-width, full-height app shell — no more phone frame */}
      <div className="min-h-screen w-full bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carpool" element={<Carpool />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
