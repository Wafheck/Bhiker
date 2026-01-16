import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landingpage from "./pages/landingpage";
import Register from './pages/register.js';
import Login from './pages/login.js';
import Browse from './pages/browse.js';
import Layout from './pages/layout.js';
import HomePage from './pages/home.js';
import HomePageVendor from './pages/homevendor.js';
import Addlisting from "./pages/addlisting.js";
import VendorSettings from "./pages/vendorsettings.js";
import EditListing from "./pages/editlisting"
import ProductView from "./pages/ProductView"

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
                <Route path="homevendor" element={<HomePageVendor />} />
                <Route path="addlisting" element={<Addlisting />} />
                <Route path="vendorsettings" element={<VendorSettings />} />
                <Route path="editlisting" element={<EditListing />} />
                <Route path="product" element={<ProductView />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
