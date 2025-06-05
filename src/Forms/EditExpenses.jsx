import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../Firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
// import './EditExpenses.css';

const EditExpenses = () => {
  const navigate = useNavigate();
  const { buffaloId } = useParams();
  const [loading, setLoading] = useState(true);
  
  // Other expenses array
  const [otherExpenses, setOtherExpenses] = useState([]);
  
  // Fetch buffalo data
  useEffect(() => {
    const fetchBuffaloData = async () => {
      try {
        const docRef = doc(db, "Buffalos", buffaloId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOtherExpenses(data.otherExpenses || [{ reason: "", amount: "" }]);
        } else {
          toast.error("Buffalo not found!", { position: "top-center" });
          navigate("/");
        }
      } catch (error) {
        toast.error(`Error: ${error.message}`, { position: "top-center" });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuffaloData();
  }, [buffaloId, navigate]);

  // Handle expense changes
  const handleExpenseChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...otherExpenses];
    updated[index][name] = value;
    setOtherExpenses(updated);
  };

  // Add new expense field
  const addExpenseField = () => {
    setOtherExpenses([...otherExpenses, { reason: "", amount: "" }]);
  };

  // Remove an expense field
  const removeExpenseField = (index) => {
    if (otherExpenses.length > 1) {
      const updated = otherExpenses.filter((_, i) => i !== index);
      setOtherExpenses(updated);
    }
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    toast.info("Updating expenses...", {
      position: "top-center",
      autoClose: false,
    });

    try {
      const docRef = doc(db, "Buffalos", buffaloId);
      
      await updateDoc(docRef, {
        otherExpenses: otherExpenses.filter(exp => 
          exp.reason.trim() !== "" && exp.amount !== ""
        )
      });

      toast.dismiss();
      toast.success("Expenses updated successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate(`/buffalo/${buffaloId}`);
      }, 3000);
    } catch (error) {
      toast.dismiss();
      toast.error(`Error: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading buffalo data...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <button 
                  onClick={() => navigate(-1)}
                  className="btn btn-light btn-sm"
                >
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
                <h2 className="h4 mb-0">Edit Expenses</h2>
                <div style={{ width: '100px' }}></div> {/* Spacer for alignment */}
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Other Expenses Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 text-primary">
                      <i className="bi bi-receipt me-2"></i>
                      Other Expenses
                    </h3>
                    <button
                      type="button"
                      onClick={addExpenseField}
                      className="btn btn-primary btn-sm"
                    >
                      <i className="bi bi-plus-circle me-1"></i> Add Expense
                    </button>
                  </div>
                  
                  {otherExpenses.map((expense, index) => (
                    <div key={index} className="row g-3 mb-3 align-items-end border-bottom pb-3">
                      <div className="col-md-5">
                        <label className="form-label">Reason</label>
                        <input
                          type="text"
                          name="reason"
                          value={expense.reason}
                          onChange={(e) => handleExpenseChange(index, e)}
                          className="form-control"
                          placeholder="Transport, Food, etc."
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label">Amount (PKR)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rs.</span>
                          <input
                            type="number"
                            name="amount"
                            value={expense.amount}
                            onChange={(e) => handleExpenseChange(index, e)}
                            className="form-control"
                            placeholder="Amount in PKR"
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          onClick={() => removeExpenseField(index)}
                          className="btn btn-danger btn-sm w-100"
                          disabled={otherExpenses.length <= 1}
                        >
                          <i className="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success btn-lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save-fill me-2"></i>
                        Update Expenses
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default EditExpenses;