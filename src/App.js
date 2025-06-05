import React from "react";
import Home from "./Home/Home.jsx";
import AddBuffalo from "./Forms/AddBuffalo.jsx";
import BeefDetail from "./Home/BeefDetail.jsx";
import Detaillaptop from "./Home/Detaillaptop.jsx";
import BuffaloWeight from "./Forms/BuffaloWeight.jsx";
import EditExpenses from "./Forms/EditExpenses.jsx";
import EditShareholders from "./Forms/EditShareholders.jsx";
import EditBuffalo from "./Forms/EditBuffalo.jsx";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="app">
      <div className="mainhome_app">
        <div className="mainhome_page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/addbeef" element={<AddBuffalo />} />
            <Route path="/buffalo/:buffaloId" element={<BeefDetail />} />
            <Route path="/buffalodetail/:buffaloId" element={<Detaillaptop />} />
            <Route path="/buffalo/:buffaloId/edit-expenses" element={<EditExpenses />} />
            <Route path="/buffalo/:buffaloId/edit-shareholders" element={<EditShareholders />} />
            <Route path="/buffalo/:buffaloId/weight" element={<BuffaloWeight />} />
            <Route path="/buffalo/:buffaloId/edit-buffalos" element={<EditBuffalo />} />
          </Routes>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="mainhome_bottom-nav">
          <Link to="/" className="mainhome_nav-item">
            <i className="bi bi-house"></i>
          </Link>
          <Link to="/addbeef" className="mainhome_nav-item">
            <i className="bi bi-plus-circle"></i>
          </Link>
          {/* <Link to="/buffalo/:buffaloId" className="mainhome_nav-item">
            <i className="bi bi-person"></i>
          </Link>
          <Link to="" className="mainhome_nav-item">
            <i className="bi bi-files"></i>
          </Link> */}
        </nav>
      </div>
    </div>
  );
}

export default App;