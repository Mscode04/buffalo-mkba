import React, { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { FaHorse, FaMobileAlt, FaRupeeSign, FaPlus, FaChartLine, FaUser, FaCog,FaCalendarAlt,FaWeight } from "react-icons/fa";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [buffalos, setBuffalos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Fetch buffalos data from Firestore
  useEffect(() => {
    const fetchBuffalos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Buffalos"));
        const buffalosData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const otherExpensesTotal = data.otherExpenses?.reduce(
            (sum, expense) => sum + Number(expense.amount || 0), 0) || 0;
          
          const totalExpense = Number(data.price || 0) + 
                             Number(data.labourExpense || 0) + 
                             otherExpensesTotal;
          
          buffalosData.push({
            id: doc.id,
            ...data,
            totalExpense
          });
        });
        
        setBuffalos(buffalosData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching buffalos:", error);
        setLoading(false);
      }
    };

    fetchBuffalos();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setIsInstalled(true));
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  const handleBuffaloClick = (id) => {
    navigate(`/buffalo/${id}`);
  };

  // Calculate summary statistics
  const totalBuffalos = buffalos.length;
  const totalInvestment = buffalos.reduce((sum, buffalo) => sum + buffalo.totalExpense, 0);
  const avgInvestment = totalBuffalos > 0 ? totalInvestment / totalBuffalos : 0;

  return (
    <div className="HomeApp">
      {/* Topbar */}
      <header className="HomeTopbar navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <button className="btn btn-link text-white" onClick={toggleDrawer}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <span className="navbar-brand mx-auto fs-4 fw-bold">Buffalo Tracker</span>
        </div>
      </header>

      {/* Drawer */}
      <div className={`HomeDrawer offcanvas offcanvas-start ${drawerOpen ? "show" : ""}`} tabIndex="-1">
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">Menu</h5>
          <button type="button" className="btn-close text-reset" onClick={toggleDrawer}></button>
        </div>
        <div className="offcanvas-body">
          {/* Simplified Install Button */}
          {!isInstalled && installPrompt && (
            <div className="mt-4">
              <button 
                className="btn btn-primary w-100" 
                onClick={handleInstallClick}
              >
                <FaMobileAlt className="me-2" />
                Install App
              </button>
            </div>
          )}
        </div>
        <div className="offcanvas-footer p-3 border-top text-center text-muted small">
          Powered by Neuraq Technologies
        </div>
      </div>
      
      {/* Overlay when drawer is open */}
      {drawerOpen && <div className="offcanvas-backdrop fade show" onClick={toggleDrawer}></div>}

      {/* Main Content */}
      <main className="container-fluid mt-3">
        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card border-primary h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Buffalos</h6>
                <h3 className="text-primary">{totalBuffalos}</h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card border-success h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Investment</h6>
                <h3 className="text-success">
                  <FaRupeeSign className="me-1" />
                  {totalInvestment.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card border-info h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Avg. Investment</h6>
                <h3 className="text-info">
                  <FaRupeeSign className="me-1" />
                  {avgInvestment.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </h3>
              </div>
            </div>
          </div>
        </div>

         {/* Buffalo Grid Container */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* <h5 className="mb-0">
              <FaHorse className="me-2 text-primary" />
              My Buffalos
            </h5> */}
            {/* <Link to="/add-buffalo" className="btn btn-sm btn-primary">
              <FaPlus className="me-1" />
              Add
            </Link> */}
          </div>

          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : buffalos.length === 0 ? (
            <div className="text-center p-4 text-muted">
              No buffalo records found. Add your first buffalo to get started.
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
              {buffalos.map((buffalo) => (
                <div key={buffalo.id} className="col">
                  <div 
                    className="card h-100 shadow-sm buffalo-card"
                    onClick={() => handleBuffaloClick(buffalo.id)}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <h6 className="card-title mb-1 text-truncate">
                          {buffalo.name || "Unnamed Buffalo"}
                        </h6>
                        <span className="badge bg-primary">
                          #{buffalo.tagNumber || "N/A"}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center mt-2">
                        <FaRupeeSign className="text-success me-1" />
                        <span className="fw-bold">{buffalo.totalExpense.toLocaleString()}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between mt-3">
                        <div className="small text-muted">
                          <FaWeight className="me-1" />
                          {buffalo.weight || "N/A"} kg
                        </div>
                        <div className="small text-muted">
                          <FaCalendarAlt className="me-1" />
                          {new Date(buffalo.registrationDate?.seconds * 1000 || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;