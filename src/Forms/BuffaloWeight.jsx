import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../Firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
// import './BuffaloWeight.css';

const BuffaloWeight = () => {
  const navigate = useNavigate();
  const { buffaloId } = useParams();
  const [loading, setLoading] = useState(true);
  const [buffaloName, setBuffaloName] = useState("");
  
  // Weight information
  const [weightData, setWeightData] = useState({
    meatWeight: "",
    boneWeight: "",
    totalWeight: "",
    dateMeasured: new Date().toISOString().split('T')[0] // Default to today
  });

  // Fetch buffalo data
  useEffect(() => {
    const fetchBuffaloData = async () => {
      try {
        const docRef = doc(db, "Buffalos", buffaloId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBuffaloName(data.name || "");
          
          // Initialize with existing weight data if available
          if (data.weightData) {
            setWeightData({
              meatWeight: data.weightData.meatWeight || "",
              boneWeight: data.weightData.boneWeight || "",
              totalWeight: data.weightData.totalWeight || "",
              dateMeasured: data.weightData.dateMeasured || new Date().toISOString().split('T')[0]
            });
          }
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

  // Handle input changes and calculate total
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setWeightData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Calculate total when meat or bone weight changes
      if (name === "meatWeight" || name === "boneWeight") {
        const meat = parseFloat(updated.meatWeight) || 0;
        const bone = parseFloat(updated.boneWeight) || 0;
        updated.totalWeight = (meat + bone).toFixed(2);
      }
      
      return updated;
    });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    toast.info("Updating weight information...", {
      position: "top-center",
      autoClose: false,
    });

    try {
      const docRef = doc(db, "Buffalos", buffaloId);
      
      await updateDoc(docRef, {
        weightData: {
          meatWeight: weightData.meatWeight,
          boneWeight: weightData.boneWeight,
          totalWeight: weightData.totalWeight,
          dateMeasured: weightData.dateMeasured,
          lastUpdated: new Date().toISOString()
        }
      });

      toast.dismiss();
      toast.success("Weight information updated successfully!", {
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
                <h2 className="h4 mb-0">Meat & Bone Weight - {buffaloName}</h2>
                <div style={{ width: '100px' }}></div>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <h3 className="h5 text-primary mb-4">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Weight Information
                  </h3>
                  
                  <div className="row g-3">
                    {/* Date Measured */}
                    <div className="col-md-6">
                      <label className="form-label">Date Measured</label>
                      <input
                        type="date"
                        name="dateMeasured"
                        value={weightData.dateMeasured}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>
                    
                    {/* Meat Weight */}
                    <div className="col-md-6">
                      <label className="form-label">Meat Weight (kg)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          name="meatWeight"
                          value={weightData.meatWeight}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                        <span className="input-group-text">kg</span>
                      </div>
                    </div>
                    
                    {/* Bone Weight */}
                    <div className="col-md-6">
                      <label className="form-label">Bone Weight (kg)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          name="boneWeight"
                          value={weightData.boneWeight}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                        <span className="input-group-text">kg</span>
                      </div>
                    </div>
                    
                    {/* Total Weight (auto-calculated) */}
                    <div className="col-md-6">
                      <label className="form-label">Total Weight (kg)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          name="totalWeight"
                          value={weightData.totalWeight}
                          className="form-control"
                          readOnly
                        />
                        <span className="input-group-text">kg</span>
                      </div>
                      <small className="text-muted">Automatically calculated</small>
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save-fill me-2"></i>
                        {weightData.meatWeight ? "Update" : "Save"} Weight Data
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

export default BuffaloWeight;