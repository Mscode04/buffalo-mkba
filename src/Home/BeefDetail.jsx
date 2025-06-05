import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../Firebase/config";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { FaRupeeSign, FaTrash, FaEdit, FaArrowLeft, FaWeight, FaChartPie } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BuffaloDetail.css"; // Custom CSS file for additional styling

const BuffaloDetail = () => {
  const { buffaloId } = useParams();
  const navigate = useNavigate();
  const [buffalo, setBuffalo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch buffalo details
  useEffect(() => {
    const fetchBuffalo = async () => {
      try {
        const docRef = doc(db, "Buffalos", buffaloId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Calculate financial totals
          const otherExpensesTotal = data.otherExpenses?.reduce(
            (sum, expense) => sum + Number(expense.amount || 0), 0) || 0;
          
          const totalExpense = Number(data.price || 0) + 
                             Number(data.labourExpense || 0) + 
                             otherExpensesTotal;
          
          // Calculate shareholder totals
          const shareholdersTotal = data.shareholders?.reduce(
            (sum, holder) => sum + Number(holder.amountReceived || 0), 0) || 0;
          
          // Calculate weight distributions if weight data exists
          let weightDistribution = null;
          if (data.weightData) {
            const totalWeight = parseFloat(data.weightData.totalWeight) || 0;
            const forShareholders = totalWeight / 3;
            const forDistribution = (totalWeight * 2) / 3;
            
            weightDistribution = {
              totalWeight,
              forShareholders,
              forDistribution,
              perShareholder: forShareholders / (data.shareholders?.length || 1)
            };
          }
          
          setBuffalo({
            ...data,
            id: docSnap.id,
            otherExpensesTotal,
            totalExpense,
            shareholdersTotal,
            remainingAmount: totalExpense - shareholdersTotal,
            weightDistribution
          });
        } else {
          toast.error("Buffalo not found");
          navigate("/");
        }
      } catch (error) {
        toast.error(`Error: ${error.message}`);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBuffalo();
  }, [buffaloId, navigate]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "Buffalos", buffaloId));
      toast.success("Buffalo deleted successfully");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast.error(`Error deleting buffalo: ${error.message}`);
    }
    setShowDeleteModal(false);
  };

  // Prepare data for pie charts
  const getExpenseChartData = () => {
    if (!buffalo) return [];
    return [
      { name: 'Purchase Price', value: Number(buffalo.price || 0) },
      { name: 'Labour Expenses', value: Number(buffalo.labourExpense || 0) },
      { name: 'Other Expenses', value: buffalo.otherExpensesTotal }
    ];
  };

  const getWeightChartData = () => {
    if (!buffalo?.weightDistribution) return [];
    return [
      { name: 'Meat Weight', value: parseFloat(buffalo.weightData.meatWeight) },
      { name: 'Bone Weight', value: parseFloat(buffalo.weightData.boneWeight) }
    ];
  };

  const getDistributionChartData = () => {
    if (!buffalo?.weightDistribution) return [];
    return [
      { name: 'For Shareholders (1/3)', value: buffalo.weightDistribution.forShareholders },
      { name: 'For Distribution (2/3)', value: buffalo.weightDistribution.forDistribution }
    ];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!buffalo) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Buffalo not found</div>
      </div>
    );
  }

  return (
    <div className="buffalo-detail-container">
      <ToastContainer position="top-center" />
      
      {/* Header Section */}
      <div className="detail-header">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline-primary back-button"
        >
          <FaArrowLeft className="me-2" /> <span className="d-none d-sm-inline"></span>
        </button>
        <h2 className="detail-title">
          {buffalo.name || "Buffalo Details"} <span className="id-text">പോത്ത്</span>
        </h2>
        <div className="action-buttons">
          <button 
            onClick={() => navigate(`/edit-buffalo/${buffaloId}`)}
            className="btn btn-outline-secondary edit-button"
          >
            <FaEdit className="me-1" /> <span className="d-none d-md-inline">Edit</span>
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline-danger delete-button"
          >
            <FaTrash className="me-1" /> <span className="d-none d-md-inline">Delete</span>
          </button>
          {buffalo.weightData ? (
            <Link 
              to={`/buffalo/${buffaloId}/edit-weight`}
              className="btn btn-outline-info weight-button"
            >
              <FaWeight className="me-1" /> <span className="d-none d-md-inline">Edit Weight</span>
            </Link>
          ) : (
            <Link 
              to={`/buffalo/${buffaloId}/weight`}
              className="btn btn-outline-info weight-button"
            >
              <FaWeight className="me-1" /> <span className="d-none d-md-inline">Add Weight</span>
            </Link>
          )}
        </div>
      </div>

      {/* Financial Summary Card */}
      <div className="card summary-card mb-4">
        <div className="card-header bg-primary text-white d-flex flex-column flex-md-row justify-content-between">
          <h3 className="h5 mb-2 mb-md-0">Financial Summary</h3>
          <span className="badge bg-light text-dark align-self-center align-self-md-end mt-md-0 mt-2">
            Total: ₹{buffalo.totalExpense.toLocaleString()}
          </span>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 order-2 order-md-1">
              <div className="table-responsive">
                <table className="table expense-table">
                  <thead>
                    <tr>
                      <th>Expense Type</th>
                      <th className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Purchase Price</td>
                      <td className="text-end fw-bold">
                        ₹{Number(buffalo.price || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Labour Expenses</td>
                      <td className="text-end fw-bold">
                        ₹{Number(buffalo.labourExpense || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Other Expenses</td>
                      <td className="text-end fw-bold">
                        ₹{buffalo.otherExpensesTotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="table-primary">
                      <th>Total Expenses</th>
                      <th className="text-end">
                        ₹{buffalo.totalExpense.toLocaleString()}
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-md-6 order-1 order-md-2 mb-4 mb-md-0">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getExpenseChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getExpenseChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shareholders Section */}
      <div className="card shareholders-card mb-4">
        <div className="card-header bg-primary text-white d-flex flex-column flex-md-row justify-content-between">
          <h3 className="h5 mb-2 mb-md-0">Shareholders Distribution</h3>
          <div className="d-flex flex-column flex-md-row">
            <span className="badge bg-light text-dark me-md-2 mb-2 mb-md-0">
              Distributed: ₹{buffalo.shareholdersTotal.toLocaleString()}
            </span>
            <span className="badge bg-light text-dark">
              Remaining: ₹{buffalo.remainingAmount.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover shareholders-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-end">Amount Received</th>
                  <th className="text-end">Share Value</th>
                  <th className="text-end">Balance</th>
                </tr>
              </thead>
              <tbody>
                {buffalo.shareholders?.map((holder, index) => {
                  const shareValue = buffalo.totalExpense / buffalo.shareholders.length;
                  const balance = shareValue - Number(holder.amountReceived || 0);
                  
                  return (
                    <tr key={index}>
                      <td>{holder.name || "N/A"}</td>
                      <td className="text-end fw-bold">
                        ₹{Number(holder.amountReceived || 0).toLocaleString()}
                      </td>
                      <td className="text-end">
                        ₹{shareValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className={`text-end fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                        <span className="d-none d-md-inline">{balance > 0 ? 'Owes: ' : 'Paid: '}</span>
                        ₹{Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Link 
              to={`/buffalo/${buffaloId}/edit-shareholders`}
              className="btn btn-primary edit-shareholders-btn"
            >
              <FaEdit className="me-1" /> Edit Shareholders
            </Link>
          </div>
        </div>
      </div>

      {/* Weight Information Section */}
      {buffalo.weightData && (
        <div className="card weight-card mb-4">
          <div className="card-header bg-primary text-white d-flex flex-column flex-md-row justify-content-between">
            <h3 className="h5 mb-2 mb-md-0">
              <FaWeight className="me-2" />
              Weight Information
            </h3>
            <span className="badge bg-light text-dark align-self-center align-self-md-end mt-md-0 mt-2">
              Measured: {new Date(buffalo.weightData.dateMeasured).toLocaleDateString()}
            </span>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-5 order-2 order-lg-1">
                <div className="table-responsive">
                  <table className="table weight-data-table">
                    <thead>
                      <tr>
                        <th>Weight Type</th>
                        <th className="text-end">Kg</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Meat Weight</td>
                        <td className="text-end fw-bold">
                          {parseFloat(buffalo.weightData.meatWeight).toFixed(2)} kg
                        </td>
                      </tr>
                      <tr>
                        <td>Bone Weight</td>
                        <td className="text-end fw-bold">
                          {parseFloat(buffalo.weightData.boneWeight).toFixed(2)} kg
                        </td>
                      </tr>
                      <tr className="table-primary">
                        <th>Total Weight</th>
                        <th className="text-end">
                          {parseFloat(buffalo.weightData.totalWeight).toFixed(2)} kg
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-lg-7 order-1 order-lg-2 mb-4 mb-lg-0">
                <div className="row">
                  <div className="col-md-6 mb-4 mb-md-0">
                    <h5 className="text-center mb-3 chart-title">Weight Composition</h5>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={getWeightChartData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getWeightChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} kg`, 'Weight']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-center mb-3 chart-title">Weight Distribution</h5>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={getDistributionChartData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getDistributionChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index + 2 % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shareholder Weight Distribution */}
            {buffalo.weightDistribution && (
              <div className="mt-4">
                <h5 className="text-center mb-3 distribution-title">
                  <FaChartPie className="me-2" />
                  Shareholder Weight Allocation
                </h5>
                <div className="table-responsive">
                  <table className="table table-sm allocation-table">
                    <thead>
                      <tr>
                        <th>Shareholder</th>
                        <th className="text-end">Allocated Weight</th>
                        <th className="text-end">Value (1/3 of Total)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buffalo.shareholders?.map((holder, index) => (
                        <tr key={index}>
                          <td>{holder.name || "N/A"}</td>
                          <td className="text-end fw-bold">
                            {buffalo.weightDistribution.perShareholder.toFixed(2)} kg
                          </td>
                          <td className="text-end">
                            {(buffalo.weightDistribution.forShareholders / buffalo.shareholders.length).toFixed(2)} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-secondary">
                        <th>Total for Shareholders</th>
                        <th className="text-end">
                          {buffalo.weightDistribution.forShareholders.toFixed(2)} kg
                        </th>
                        <th className="text-end">
                          {buffalo.weightDistribution.forShareholders.toFixed(2)} kg
                        </th>
                      </tr>
                      <tr className="table-secondary">
                        <th>Total for Distribution</th>
                        <th colSpan="2" className="text-end">
                          {buffalo.weightDistribution.forDistribution.toFixed(2)} kg
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Expenses Section */}
      <div className="card expenses-card mb-5">
        <div className="card-header bg-primary text-white d-flex flex-column flex-md-row justify-content-between">
          <h3 className="h5 mb-2 mb-md-0">Other Expenses</h3>
          <span className="badge bg-light text-dark align-self-center align-self-md-end mt-md-0 mt-2">
            Total: ₹{buffalo.otherExpensesTotal.toLocaleString()}
          </span>
        </div>
        <div className="card-body">
          {buffalo.otherExpenses?.length === 0 ? (
            <div className="text-muted no-expenses">No other expenses recorded</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reason</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {buffalo.otherExpenses?.map((expense, index) => (
                    <tr key={index}>
                      <td>{expense.date ? new Date(expense.date).toLocaleDateString() : "N/A"}</td>
                      <td>{expense.reason || "N/A"}</td>
                      <td className="text-end fw-bold">
                        ₹{Number(expense.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="d-flex justify-content-end mt-3">
            <Link 
              to={`/buffalo/${buffaloId}/edit-expenses`}
              className="btn btn-primary edit-expenses-btn"
            >
              <FaEdit className="me-1" /> Edit Expenses
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body bg-light">
                <p className="bg-light">Are you sure you want to delete this buffalo record? This action cannot be undone.</p>
                <p className="fw-bold">Buffalo: {buffalo.name || "Untitled"} (ID: {buffalo.id})</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuffaloDetail;