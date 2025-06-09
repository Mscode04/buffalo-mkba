import React, { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { 
  FaHorse, 
  FaMobileAlt, 
  FaRupeeSign, 
  FaPlus, 
  FaChartLine, 
  FaUser, 
  FaCog,
  FaCalendarAlt,
  FaWeight,
  FaMoneyBillWave,
  FaBalanceScale,
  FaExchangeAlt
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [buffalos, setBuffalos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch buffalos data from Firestore and calculate summaries
  useEffect(() => {
    const fetchBuffalos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Buffalos"));
        const buffalosData = [];
        let totalSummary = {
          purchasePrice: 0,
          labourExpenses: 0,
          otherExpenses: 0,
          totalExpenses: 0,
          receivedFromShareholders: 0,
          balanceToReceive: 0,
          balanceToGive: 0,
          totalWeight: 0,
          meatWeight: 0,
          boneWeight: 0,
          buffaloCount: 0
        };

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Calculate expenses
          const otherExpensesTotal = data.otherExpenses?.reduce(
            (sum, expense) => sum + Number(expense.amount || 0), 0) || 0;
          
          const totalExpense = Number(data.price || 0) + 
                             Number(data.labourExpense || 0) + 
                             otherExpensesTotal;
          
          // Calculate shareholder totals
          const shareholdersTotal = data.shareholders?.reduce(
            (sum, holder) => sum + Number(holder.amountReceived || 0), 0) || 0;
          
          // Calculate balances
          const shareValuePerHolder = totalExpense / (data.shareholders?.length || 1);
          let balanceToReceive = 0;
          let balanceToGive = 0;
          
          data.shareholders?.forEach(holder => {
            const holderBalance = shareValuePerHolder - Number(holder.amountReceived || 0);
            if (holderBalance > 0) {
              balanceToReceive += holderBalance;
            } else {
              balanceToGive += Math.abs(holderBalance);
            }
          });

          // Weight data
          const weightData = data.weightData || {};
          
          // Update summary
          totalSummary.purchasePrice += Number(data.price || 0);
          totalSummary.labourExpenses += Number(data.labourExpense || 0);
          totalSummary.otherExpenses += otherExpensesTotal;
          totalSummary.totalExpenses += totalExpense;
          totalSummary.receivedFromShareholders += shareholdersTotal;
          totalSummary.balanceToReceive += balanceToReceive;
          totalSummary.balanceToGive += balanceToGive;
          totalSummary.totalWeight += parseFloat(weightData.totalWeight || 0);
          totalSummary.meatWeight += parseFloat(weightData.meatWeight || 0);
          totalSummary.boneWeight += parseFloat(weightData.boneWeight || 0);
          totalSummary.buffaloCount += 1;

          buffalosData.push({
            id: doc.id,
            ...data,
            totalExpense,
            otherExpensesTotal,
            shareholdersTotal,
            balanceToReceive,
            balanceToGive,
            weightData
          });
        });
        
        setBuffalos(buffalosData);
        setSummary(totalSummary);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching buffalos:", error);
        setLoading(false);
      }
    };

    fetchBuffalos();
  }, []);

  // Prepare data for charts
  const getExpenseDistributionData = () => {
    if (!summary) return [];
    return [
      { name: 'Purchase', value: summary.purchasePrice },
      { name: 'Labour', value: summary.labourExpenses },
      { name: 'Other', value: summary.otherExpenses }
    ];
  };

  const getFinancialStatusData = () => {
    if (!summary) return [];
    return [
      { name: 'Expenses', value: summary.totalExpenses },
      { name: 'Received', value: summary.receivedFromShareholders },
      { name: 'To Receive', value: summary.balanceToReceive },
      { name: 'To Give', value: summary.balanceToGive }
    ];
  };

  const getWeightDistributionData = () => {
    if (!summary) return [];
    return [
      { name: 'Meat', value: summary.meatWeight },
      { name: 'Bone', value: summary.boneWeight }
    ];
  };

  const getBuffaloExpenseData = () => {
    return buffalos.map(buffalo => ({
      name: buffalo.name || "Buffalo",
      expense: buffalo.totalExpense
    }));
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleBuffaloClick = (id) => navigate(`/buffalo/${id}`);

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
          <Link to="/add-buffalo" className="btn btn-primary w-100 mb-3">
            <FaPlus className="me-2" />
            Add New Buffalo
          </Link>
          <div className="list-group">
            <Link to="/" className="list-group-item list-group-item-action active">
              <FaChartLine className="me-2" />
              Dashboard
            </Link>
            <Link to="/shareholders" className="list-group-item list-group-item-action">
              <FaUser className="me-2" />
              Shareholders
            </Link>
            <Link to="/settings" className="list-group-item list-group-item-action">
              <FaCog className="me-2" />
              Settings
            </Link>
          </div>
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
        {summary && (
          <div className="row mb-4">
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="card summary-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Buffalos</h6>
                      <h3 className="card-title">{summary.buffaloCount}</h3>
                    </div>
                    <div className="icon-circle bg-primary-light">
                      <FaHorse className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <div className="card summary-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Total Expenses</h6>
                      <h3 className="card-title">
                        <FaRupeeSign className="text-success" size={18} />
                        {summary.totalExpenses.toLocaleString()}
                      </h3>
                    </div>
                    <div className="icon-circle bg-danger-light">
                      <FaMoneyBillWave className="text-danger" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <div className="card summary-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Balance to Receive</h6>
                      <h3 className="card-title text-success">
                        <FaRupeeSign size={18} />
                        {summary.balanceToReceive.toLocaleString()}
                      </h3>
                    </div>
                    <div className="icon-circle bg-success-light">
                      <FaExchangeAlt className="text-success" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <div className="card summary-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">Balance to Give</h6>
                      <h3 className="card-title text-danger">
                        <FaRupeeSign size={18} />
                        {summary.balanceToGive.toLocaleString()}
                      </h3>
                    </div>
                    <div className="icon-circle bg-warning-light">
                      <FaBalanceScale className="text-warning" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {summary && (
          <div className="row mb-4">
            <div className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Expense Distribution</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getExpenseDistributionData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getExpenseDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Financial Status</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getFinancialStatusData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} 
                        />
                        <Bar dataKey="value" fill="#8884d8">
                          {getFinancialStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Weight Distribution</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getWeightDistributionData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getWeightDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Financial Summary */}
        {summary && (
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Detailed Financial Summary</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Expense Type</th>
                        <th className="text-end">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Purchase Price</td>
                        <td className="text-end fw-bold">
                          ₹{summary.purchasePrice.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Labour Expenses</td>
                        <td className="text-end fw-bold">
                          ₹{summary.labourExpenses.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Other Expenses</td>
                        <td className="text-end fw-bold">
                          ₹{summary.otherExpenses.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="table-primary">
                        <th>Total Expenses</th>
                        <th className="text-end">
                          ₹{summary.totalExpenses.toLocaleString()}
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Financial Status</th>
                        <th className="text-end">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Received from Shareholders</td>
                        <td className="text-end fw-bold">
                          ₹{summary.receivedFromShareholders.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td>Balance to Receive</td>
                        <td className="text-end fw-bold text-success">
                          ₹{summary.balanceToReceive.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td>Balance to Give</td>
                        <td className="text-end fw-bold text-danger">
                          ₹{summary.balanceToGive.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="table-primary">
                        <th>Net Position</th>
                        <th className="text-end fw-bold">
                          ₹{(summary.receivedFromShareholders - summary.totalExpenses).toLocaleString()}
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buffalo List */}
        <div className="card mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Buffalo Records</h5>
            <Link to="/add-buffalo" className="btn btn-sm btn-primary">
              <FaPlus className="me-1" />
              Add Buffalo
            </Link>
          </div>
          <div className="card-body">
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
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-end">Expenses</th>
                      <th className="text-end">Received</th>
                      <th className="text-end">Balance</th>
                      <th className="text-end">Weight</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buffalos.map((buffalo) => (
                      <tr key={buffalo.id} onClick={() => handleBuffaloClick(buffalo.id)} style={{ cursor: 'pointer' }}>
                        <td>
                          <strong>{buffalo.name || "Unnamed Buffalo"}</strong>
                          <div className="small text-muted">
                            {buffalo.tagNumber || "No Tag"}
                          </div>
                        </td>
                        <td className="text-end">
                          <FaRupeeSign className="text-danger" size={12} />
                          {buffalo.totalExpense.toLocaleString()}
                        </td>
                        <td className="text-end">
                          <FaRupeeSign className="text-success" size={12} />
                          {buffalo.shareholdersTotal.toLocaleString()}
                        </td>
                        <td className="text-end">
                          {buffalo.balanceToReceive > 0 ? (
                            <span className="badge bg-success-light text-success">
                              +₹{buffalo.balanceToReceive.toLocaleString()}
                            </span>
                          ) : buffalo.balanceToGive > 0 ? (
                            <span className="badge bg-danger-light text-danger">
                              -₹{buffalo.balanceToGive.toLocaleString()}
                            </span>
                          ) : (
                            <span className="badge bg-secondary">Settled</span>
                          )}
                        </td>
                        <td className="text-end">
                          {buffalo.weightData?.totalWeight ? (
                            <span className="badge bg-info-light text-info">
                              <FaWeight className="me-1" />
                              {parseFloat(buffalo.weightData.totalWeight).toFixed(2)} kg
                            </span>
                          ) : (
                            <span className="badge bg-warning-light text-warning">
                              No weight
                            </span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary mb-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuffaloClick(buffalo.id);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;