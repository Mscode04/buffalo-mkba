import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../Firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
// import './EditBuffalo.css';

const EditBuffalo = () => {
  const navigate = useNavigate();
  const { buffaloId } = useParams();
  const [loading, setLoading] = useState(false);
  
  // Main buffalo information
  const [buffaloData, setBuffaloData] = useState({
    name: "",
    price: "",
    year: "",
    labourExpense: "",
  });
  
  // Other expenses array
  const [otherExpenses, setOtherExpenses] = useState([
    { reason: "", amount: "" }
  ]);

  // Fetch buffalo data to edit
  useEffect(() => {
    const fetchBuffaloData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "Buffalos", buffaloId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBuffaloData({
            name: data.name || "",
            price: data.price || "",
            year: data.year || "",
            labourExpense: data.labourExpense || "",
          });
          
          if (data.otherExpenses && data.otherExpenses.length > 0) {
            setOtherExpenses(data.otherExpenses);
          }
        } else {
          toast.error("Buffalo not found", {
            position: "top-center",
            autoClose: 3000,
          });
          navigate("/");
        }
      } catch (error) {
        toast.error(`Error: ${error.message}`, {
          position: "top-center",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuffaloData();
  }, [buffaloId, navigate]);

  // Handle main buffalo info changes
  const handleBuffaloChange = (e) => {
    const { name, value } = e.target;
    setBuffaloData(prev => ({ ...prev, [name]: value }));
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    toast.info("Updating buffalo information...", {
      position: "top-center",
      autoClose: false,
    });

    try {
      const docRef = doc(db, "Buffalos", buffaloId);
      
      await updateDoc(docRef, {
        ...buffaloData,
        otherExpenses,
      });

      toast.dismiss();
      toast.success("Buffalo updated successfully!", {
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
                <h2 className="h4 mb-0">Edit Buffalo Information</h2>
                <div style={{ width: '100px' }}></div> {/* Spacer for alignment */}
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading buffalo data...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Buffalo Basic Information */}
                  <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="h5 text-primary">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        Buffalo Information
                      </h3>
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Buffalo Name</label>
                        <input
                          type="text"
                          name="name"
                          value={buffaloData.name}
                          onChange={handleBuffaloChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Price (PKR)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rs.</span>
                          <input
                            type="number"
                            name="price"
                            value={buffaloData.price}
                            onChange={handleBuffaloChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Year</label>
                        <input
                          type="number"
                          name="year"
                          value={buffaloData.year}
                          onChange={handleBuffaloChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Labour Expenses (PKR)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rs.</span>
                          <input
                            type="number"
                            name="labourExpense"
                            value={buffaloData.labourExpense}
                            onChange={handleBuffaloChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                    </div>
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
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save-fill me-2"></i>
                          Update Buffalo Information
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default EditBuffalo;