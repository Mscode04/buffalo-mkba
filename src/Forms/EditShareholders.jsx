import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../Firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
// import './EditShareholders.css';

const EditShareholders = () => {
  const navigate = useNavigate();
  const { buffaloId } = useParams();
  const [loading, setLoading] = useState(true);
  const [buffaloName, setBuffaloName] = useState("");
  
  // Shareholders array with additional amount field
  const [shareholders, setShareholders] = useState([
    { name: "", amountReceived: "", additionalAmount: "" }
  ]);

  // Fetch buffalo data
  useEffect(() => {
    const fetchBuffaloData = async () => {
      try {
        const docRef = doc(db, "Buffalos", buffaloId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBuffaloName(data.name || "");
          
          // Initialize shareholders with additionalAmount field
          const initialShareholders = data.shareholders?.map(shareholder => ({
            ...shareholder,
            additionalAmount: ""
          })) || [{ name: "", amountReceived: "", additionalAmount: "" }];
          
          setShareholders(initialShareholders);
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

  // Handle shareholder changes
  const handleShareholderChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...shareholders];
    updated[index][name] = value;
    setShareholders(updated);
  };

  // Add new shareholder field
  const addShareholderField = () => {
    setShareholders([...shareholders, { name: "", amountReceived: "", additionalAmount: "" }]);
  };

  // Remove a shareholder field
  const removeShareholderField = (index) => {
    if (shareholders.length > 1) {
      const updated = shareholders.filter((_, i) => i !== index);
      setShareholders(updated);
    }
  };

  // Calculate total amount (original + additional)
  const calculateTotalAmount = (amountReceived, additionalAmount) => {
    const received = parseFloat(amountReceived) || 0;
    const additional = parseFloat(additionalAmount) || 0;
    return (received + additional).toFixed(2);
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    toast.info("Updating shareholders...", {
      position: "top-center",
      autoClose: false,
    });

    try {
      const docRef = doc(db, "Buffalos", buffaloId);
      
      // Prepare updated shareholders data
      const updatedShareholders = shareholders.map(shareholder => ({
        name: shareholder.name,
        amountReceived: calculateTotalAmount(
          shareholder.amountReceived,
          shareholder.additionalAmount
        ),
        // Keep track of the additional amount added in this transaction
        additionalAmountAdded: shareholder.additionalAmount || "0"
      }));

      await updateDoc(docRef, {
        shareholders: updatedShareholders
      });

      toast.dismiss();
      toast.success("Shareholders updated successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate(`/buffalo/${buffaloId}`);
      }, 1000);
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
        <div className="col-lg-10">
          <div className="card border-0 shadow">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <button 
                  onClick={() => navigate(-1)}
                  className="btn btn-light btn-sm"
                >
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
                <h2 className="h4 mb-0">Edit Shareholders - {buffaloName}</h2>
                <div style={{ width: '100px' }}></div>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Shareholders Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 text-primary">
                      <i className="bi bi-people-fill me-2"></i>
                      Shareholders Information
                    </h3>
                    <button
                      type="button"
                      onClick={addShareholderField}
                      className="btn btn-primary btn-sm"
                    >
                      <i className="bi bi-plus-circle me-1"></i> Add Shareholder
                    </button>
                  </div>
                  
                  {shareholders.map((holder, index) => (
                    <div key={index} className="row g-3 mb-3 align-items-end border-bottom pb-3">
                      <div className="col-md-4">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={holder.name}
                          onChange={(e) => handleShareholderChange(index, e)}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Amount Received (PKR)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rs.</span>
                          <input
                            type="number"
                            name="amountReceived"
                            value={holder.amountReceived}
                            onChange={(e) => handleShareholderChange(index, e)}
                            className="form-control"
                            required
                            disabled // Original amount is not editable
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Additional Amount (PKR)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rs.</span>
                          <input
                            type="number"
                            name="additionalAmount"
                            value={holder.additionalAmount}
                            onChange={(e) => handleShareholderChange(index, e)}
                            className="form-control"
                            placeholder="Add amount"
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="d-flex flex-column">
                          <span className="text-muted small">Total:</span>
                          <span className="fw-bold">
                            Rs. {calculateTotalAmount(holder.amountReceived, holder.additionalAmount)}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-12 mt-2">
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">
                            Original: Rs. {holder.amountReceived || "0"}
                          </small>
                          {shareholders.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeShareholderField(index)}
                              className="btn btn-danger btn-sm"
                            >
                              <i className="bi bi-trash"></i> Remove
                            </button>
                          )}
                        </div>
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
                        Update Shareholders
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

export default EditShareholders;