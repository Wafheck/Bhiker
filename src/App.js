import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landingpage from "./pages/landingpage";
import Register from './pages/register.js';
import Login from './pages/login.js';
import Browse from './pages/browse.js';
import Layout from './pages/layout.js';
import HomePage from './pages/home.js'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Landingpage />} />
                <Route path="landingpage" element={<Landingpage />} />
                <Route path="browse" element={<Browse />} />
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
                <Route path="home" element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
