import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase/config";
import { doc, setDoc, collection, getDocs, query } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import './AddBuffalo.css';

const AddBuffalo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingBuffaloIds, setExistingBuffaloIds] = useState([]);
  
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
  
  // Shareholders array
  const [shareholders, setShareholders] = useState([
    { name: "", amountReceived: "" }
  ]);

  // Fetch existing buffalo IDs to prevent duplicates
  useEffect(() => {
    const fetchBuffaloIds = async () => {
      const q = query(collection(db, "Buffalos"));
      const querySnapshot = await getDocs(q);
      const ids = querySnapshot.docs.map((doc) => doc.id);
      setExistingBuffaloIds(ids);
    };
    fetchBuffaloIds();
  }, []);

  // Handle main buffalo info changes
  const handleBuffaloChange = (e) => {
    const { name, value } = e.target;
    setBuffaloData(prev => ({ ...prev, [name]: value }));
  };

  // Handle other expenses changes
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

  // Handle shareholder changes
  const handleShareholderChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...shareholders];
    updated[index][name] = value;
    setShareholders(updated);
  };

  // Add new shareholder field
  const addShareholderField = () => {
    setShareholders([...shareholders, { name: "", amountReceived: "" }]);
  };

  // Remove a shareholder field
  const removeShareholderField = (index) => {
    if (shareholders.length > 1) {
      const updated = shareholders.filter((_, i) => i !== index);
      setShareholders(updated);
    }
  };

  // Generate unique 10-digit buffalo ID
  const generateBuffaloId = () => {
    const min = 1000000000;
    const max = 9999999999;
    let newId;
    do {
      newId = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (existingBuffaloIds.includes(newId.toString()));
    return newId.toString();
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    toast.info("Saving buffalo information...", {
      position: "top-center",
      autoClose: false,
    });

    try {
      const buffaloId = generateBuffaloId();
      const registrationDate = new Date().toISOString();

      await setDoc(doc(db, "Buffalos", buffaloId), {
        ...buffaloData,
        otherExpenses,
        shareholders,
        registrationDate,
        buffaloId
      });

      toast.dismiss();
      toast.success("Buffalo added successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate(`/`);
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
                <h2 className="h4 mb-0">Add New Buffalo for Eid al-Adha</h2>
                <div style={{ width: '100px' }}></div> {/* Spacer for alignment */}
              </div>
            </div>

            <div className="card-body">
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

                {/* Other Expenses Section */}
                <div className="mb-5">
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
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        {otherExpenses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExpenseField(index)}
                            className="btn btn-danger btn-sm w-100"
                          >
                            <i className="bi bi-trash"></i> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shareholders Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 text-primary">
                      <i className="bi bi-people-fill me-2"></i>
                      Shareholders
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
                      <div className="col-md-5">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={holder.name}
                          onChange={(e) => handleShareholderChange(index, e)}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label">Amount Received (PKR)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rs.</span>
                          <input
                            type="number"
                            name="amountReceived"
                            value={holder.amountReceived}
                            onChange={(e) => handleShareholderChange(index, e)}
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        {shareholders.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShareholderField(index)}
                            className="btn btn-danger btn-sm w-100"
                          >
                            <i className="bi bi-trash"></i> Remove
                          </button>
                        )}
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
                        Save Buffalo Information
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

export default AddBuffalo;