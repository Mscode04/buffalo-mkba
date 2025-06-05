import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../Firebase/config";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { FaRupeeSign, FaTrash, FaEdit, FaArrowLeft, FaWeight, FaBalanceScale } from "react-icons/fa";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Detaillaptop = () => {
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
          const totalReceived = data.shareholders?.reduce(
            (sum, holder) => sum + Number(holder.amountReceived || 0), 0) || 0;
          
          const equalShare = totalExpense / (data.shareholders?.length || 1);
          
          // Calculate weight distributions if available
          let weightDistribution = null;
          if (data.weightData) {
            const totalWeight = parseFloat(data.weightData.totalWeight || 0);
            const shareholdersPart = totalWeight / 3;
            const distributionPart = (totalWeight * 2) / 3;
            
            weightDistribution = {
              totalWeight,
              meatWeight: parseFloat(data.weightData.meatWeight || 0),
              boneWeight: parseFloat(data.weightData.boneWeight || 0),
              shareholdersPart,
              distributionPart,
              perShareholder: shareholdersPart / (data.shareholders?.length || 1)
            };
          }
          
          setBuffalo({
            ...data,
            id: docSnap.id,
            otherExpensesTotal,
            totalExpense,
            totalReceived,
            equalShare,
            weightDistribution,
            shareholders: data.shareholders?.map(holder => ({
              ...holder,
              amountReceived: Number(holder.amountReceived || 0),
              balance: equalShare - Number(holder.amountReceived || 0)
            })) || []
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Data for charts
  const financialData = [
    { name: 'Purchase Price', value: Number(buffalo?.price || 0) },
    { name: 'Labour Expenses', value: Number(buffalo?.labourExpense || 0) },
    { name: 'Other Expenses', value: buffalo?.otherExpensesTotal || 0 }
  ];

  const weightData = buffalo?.weightDistribution ? [
    { name: 'Meat', value: buffalo.weightDistribution.meatWeight },
    { name: 'Bone', value: buffalo.weightDistribution.boneWeight }
  ] : [];

  const distributionData = buffalo?.weightDistribution ? [
    { name: 'Shareholders (1/3)', value: buffalo.weightDistribution.shareholdersPart },
    { name: 'For Distribution (2/3)', value: buffalo.weightDistribution.distributionPart }
  ] : [];

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
    <div className="container py-4">
      <ToastContainer position="top-center" />
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline-primary"
        >
          <FaArrowLeft className="me-2" /> Back
        </button>
        <h2 className="mb-0 text-primary">
          {buffalo.name || "Buffalo Details"} 
          <span className="badge bg-secondary ms-2">{buffalo.id}</span>
        </h2>
        <div className="d-flex">
          <button 
            onClick={() => navigate(`/edit-buffalo/${buffaloId}`)}
            className="btn btn-outline-secondary me-2"
          >
            <FaEdit className="me-1" /> Edit
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline-danger"
          >
            <FaTrash className="me-1" /> Delete
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card h-100 border-primary">
            <div className="card-header bg-primary text-white">
              <h3 className="h6 mb-0">Financial Summary</h3>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Total Expenses:</span>
                <strong className="text-primary">
                  <FaRupeeSign /> {buffalo.totalExpense.toLocaleString()}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Received:</span>
                <strong className={buffalo.totalReceived >= buffalo.totalExpense ? "text-success" : "text-warning"}>
                  <FaRupeeSign /> {buffalo.totalReceived.toLocaleString()}
                </strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Balance:</span>
                <strong className={buffalo.totalExpense - buffalo.totalReceived <= 0 ? "text-success" : "text-danger"}>
                  <FaRupeeSign /> {(buffalo.totalExpense - buffalo.totalReceived).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {buffalo.weightDistribution && (
          <div className="col-md-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <h3 className="h6 mb-0">Weight Summary</h3>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Weight:</span>
                  <strong className="text-success">
                    {buffalo.weightDistribution.totalWeight.toFixed(2)} kg
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Meat Weight:</span>
                  <strong>{buffalo.weightDistribution.meatWeight.toFixed(2)} kg</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Bone Weight:</span>
                  <strong>{buffalo.weightDistribution.boneWeight.toFixed(2)} kg</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="col-md-4">
          <div className="card h-100 border-info">
            <div className="card-header bg-info text-white">
              <h3 className="h6 mb-0">Share Information</h3>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Equal Share:</span>
                <strong className="text-info">
                  <FaRupeeSign /> {buffalo.equalShare.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </strong>
              </div>
              {buffalo.weightDistribution && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Weight per Share:</span>
                  <strong>
                    {buffalo.weightDistribution.perShareholder.toFixed(2)} kg
                  </strong>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span>Total Shareholders:</span>
                <strong>{buffalo.shareholders.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Details Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h3 className="h5 mb-0">Financial Breakdown</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h4 className="h6 mb-3">Expense Components</h4>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Purchase Price</td>
                      <td className="text-end">
                        <FaRupeeSign className="me-1" />
                        {Number(buffalo.price || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Labour Expenses</td>
                      <td className="text-end">
                        <FaRupeeSign className="me-1" />
                        {Number(buffalo.labourExpense || 0).toLocaleString()}
                      </td>
                    </tr>
                    {buffalo.otherExpenses?.map((expense, index) => (
                      <tr key={index}>
                        <td>{expense.reason || "Other Expense"}</td>
                        <td className="text-end">
                          <FaRupeeSign className="me-1" />
                          {Number(expense.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-primary fw-bold">
                      <td>Total Expenses</td>
                      <td className="text-end">
                        <FaRupeeSign className="me-1" />
                        {buffalo.totalExpense.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-md-6">
              <h4 className="h6 mb-3">Expense Distribution</h4>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shareholders Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="h5 mb-0">Shareholders</h3>
            <span className="badge bg-light text-dark">
              {buffalo.shareholders.length} shareholders
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-end">Share Amount</th>
                  <th className="text-end">Amount Paid</th>
                  <th className="text-end">Balance</th>
                  <th className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {buffalo.shareholders.map((holder, index) => (
                  <tr key={index}>
                    <td>{holder.name || `Shareholder ${index + 1}`}</td>
                    <td className="text-end">
                      <FaRupeeSign className="me-1" />
                      {buffalo.equalShare.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </td>
                    <td className="text-end">
                      <FaRupeeSign className="me-1" />
                      {holder.amountReceived.toLocaleString()}
                    </td>
                    <td className={`text-end ${holder.balance <= 0 ? "text-success" : "text-danger"}`}>
                      <FaRupeeSign className="me-1" />
                      {Math.abs(holder.balance).toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </td>
                    <td className="text-end">
                      {holder.balance <= 0 ? (
                        <span className="badge bg-success">Paid</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-primary fw-bold">
                  <td>Totals</td>
                  <td className="text-end">
                    <FaRupeeSign className="me-1" />
                    {buffalo.totalExpense.toLocaleString()}
                  </td>
                  <td className="text-end">
                    <FaRupeeSign className="me-1" />
                    {buffalo.totalReceived.toLocaleString()}
                  </td>
                  <td className={`text-end ${buffalo.totalExpense - buffalo.totalReceived <= 0 ? "text-success" : "text-danger"}`}>
                    <FaRupeeSign className="me-1" />
                    {Math.abs(buffalo.totalExpense - buffalo.totalReceived).toLocaleString()}
                  </td>
                  <td className="text-end">
                    {buffalo.totalExpense - buffalo.totalReceived <= 0 ? (
                      <span className="badge bg-success">Fully Paid</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Balance Due</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Weight Section - Only shown if weight data exists */}
      {buffalo.weightDistribution && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-success text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">
                <FaWeight className="me-2" />
                Weight Distribution
              </h3>
              <span className="badge bg-light text-dark">
                Measured: {new Date(buffalo.weightData?.dateMeasured).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h4 className="h6 mb-3">Weight Composition</h4>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={weightData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {weightData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-6">
                <h4 className="h6 mb-3">Weight Allocation</h4>
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Weight:</span>
                    <strong>{buffalo.weightDistribution.totalWeight.toFixed(2)} kg</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>For Shareholders (1/3):</span>
                    <strong>{buffalo.weightDistribution.shareholdersPart.toFixed(2)} kg</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>For Distribution (2/3):</span>
                    <strong>{buffalo.weightDistribution.distributionPart.toFixed(2)} kg</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Per Shareholder:</span>
                    <strong className="text-success">
                      {buffalo.weightDistribution.perShareholder.toFixed(2)} kg
                    </strong>
                  </div>
                </div>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Shareholders',
                          weight: buffalo.weightDistribution.shareholdersPart,
                          fill: COLORS[0]
                        },
                        {
                          name: 'Distribution',
                          weight: buffalo.weightDistribution.distributionPart,
                          fill: COLORS[1]
                        }
                      ]}
                      layout="vertical"
                    >
                      <XAxis type="number" unit=" kg" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']} />
                      <Bar dataKey="weight" fill="#8884d8">
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-3 mb-4">
        <button 
          onClick={() => navigate(`/edit-buffalo/${buffaloId}`)}
          className="btn btn-primary"
        >
          <FaEdit className="me-2" />
          Edit Buffalo
        </button>
        {!buffalo.weightData && (
          <button 
            onClick={() => navigate(`/buffalo/${buffaloId}/weight`)}
            className="btn btn-success"
          >
            <FaWeight className="me-2" />
            Add Weight Data
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete this buffalo record?</p>
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action cannot be undone. All data including financial records and weight information will be lost.
                </div>
                <p className="fw-bold">
                  Buffalo: {buffalo.name || "Untitled"} (ID: {buffalo.id})
                </p>
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

export default Detaillaptop;