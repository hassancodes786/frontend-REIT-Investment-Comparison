import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getInvestments, deleteInvestment } from "../api/api";

export default function MyInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search / Filter / Sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Investment details popup
  const [selectedInvestment, setSelectedInvestment] =
    useState(null);

  // Delete investment request
  const [deletingId, setDeletingId] = useState(null);

  // =====================================
  // LOAD INVESTMENTS
  // =====================================

  const loadInvestments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInvestments();

      const data = response.data?.data || [];

      setInvestments(data);
    } catch (err) {
      console.error("My Investments API Error:", err);

      setError("Unable to load investment data.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // DELETE INVESTMENT
  // =====================================

  const handleDeleteInvestment = async (investmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this investment request?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(investmentId);
      setError("");
      await deleteInvestment(investmentId);

      if (selectedInvestment?._id === investmentId) {
        setSelectedInvestment(null);
      }

      setInvestments((currentInvestments) =>
        currentInvestments.filter(
          (investment) => investment._id !== investmentId
        )
      );
    } catch (err) {
      console.error("Delete Investment Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to delete investment request."
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="empty">
        <h2>Loading Investments...</h2>
        <p>Fetching your investment data from MongoDB.</p>
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="empty">
        <h2>Investment Error</h2>

        <p>{error}</p>

        <button
          className="button"
          onClick={loadInvestments}
        >
          Try Again
        </button>
      </div>
    );
  }

  // =====================================
  // TOTAL INVESTMENT
  // =====================================

  const totalInvestment = investments.reduce(
    (sum, investment) =>
      sum + Number(investment.amount || 0),
    0
  );

  // =====================================
  // ACTIVE REQUESTS
  // =====================================

  const activeRequests = investments.filter(
    (investment) =>
      investment.status !== "Completed" &&
      investment.status !== "Rejected"
  ).length;

  // =====================================
  // APPROVED
  // =====================================

  const approvedInvestments = investments.filter(
    (investment) =>
      investment.status === "Approved"
  ).length;

  // =====================================
  // COMPLETED
  // =====================================

  const completedInvestments = investments.filter(
    (investment) =>
      investment.status === "Completed"
  ).length;

  // =====================================
  // PORTFOLIO YIELD
  // =====================================

  const portfolioYield =
    investments.length > 0
      ? investments.reduce(
          (sum, investment) =>
            sum +
            Number(
              investment.property?.rentalYield || 0
            ),
          0
        ) / investments.length
      : 0;

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // =====================================
  // FORMAT MONEY
  // =====================================

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  // =====================================
  // STATUS STEPS
  // =====================================

  const statusSteps = [
    "Interest Submitted",
    "Under Review",
    "Approved",
    "Completed"
  ];

  // =====================================
  // GET STATUS INDEX
  // =====================================

  const getStatusIndex = (status) => {
    if (status === "Rejected") {
      return -1;
    }

    const index = statusSteps.indexOf(status);

    return index === -1 ? 0 : index;
  };

  // =====================================
  // STATUS CLASS
  // =====================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "status-approved";

      case "Completed":
        return "status-completed";

      case "Rejected":
        return "status-rejected";

      case "Under Review":
        return "status-review";

      default:
        return "status-submitted";
    }
  };

  // =====================================
  // SEARCH
  // =====================================

  let filteredInvestments = [...investments];

  if (search.trim()) {
    const searchText =
      search.toLowerCase().trim();

    filteredInvestments =
      filteredInvestments.filter(
        (investment) => {
          const property =
            investment.property || {};

          return (
            String(property.name || "")
              .toLowerCase()
              .includes(searchText) ||

            String(property.location || "")
              .toLowerCase()
              .includes(searchText) ||

            String(investment.status || "")
              .toLowerCase()
              .includes(searchText) ||

            String(investment.amount || "")
              .includes(searchText)
          );
        }
      );
  }

  // =====================================
  // STATUS FILTER
  // =====================================

  if (statusFilter !== "All") {
    filteredInvestments =
      filteredInvestments.filter(
        (investment) =>
          investment.status === statusFilter
      );
  }

  // =====================================
  // SORT
  // =====================================

  filteredInvestments.sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    }

    if (sortBy === "oldest") {
      return (
        new Date(a.createdAt || 0) -
        new Date(b.createdAt || 0)
      );
    }

    if (sortBy === "highest") {
      return (
        Number(b.amount || 0) -
        Number(a.amount || 0)
      );
    }

    if (sortBy === "lowest") {
      return (
        Number(a.amount || 0) -
        Number(b.amount || 0)
      );
    }

    return 0;
  });

  // =====================================
  // PAGE
  // =====================================

  return (
    <div>

      {/* =================================
          PAGE HEADING
      ================================= */}

      <section className="page-heading">
        <span className="eyebrow">
          PORTFOLIO
        </span>

        <h1>My Investments</h1>

        <p>
          Track your property investment
          requests and portfolio performance.
        </p>
      </section>


      {/* =================================
          SUMMARY CARDS
      ================================= */}

      <div className="investment-summary">

        {/* TOTAL INVESTED */}

        <div className="stat-card">
          <span className="stat-title">
            Total Invested
          </span>

          <strong className="stat-value">
            ₹{formatMoney(totalInvestment)}
          </strong>

          <small>
            Across {investments.length} investment
            {investments.length !== 1 ? "s" : ""}
          </small>
        </div>


        {/* ACTIVE REQUESTS */}

        <div className="stat-card">
          <span className="stat-title">
            Active Requests
          </span>

          <strong className="stat-value">
            {activeRequests}
          </strong>

          <small>
            Currently being processed
          </small>
        </div>


        {/* APPROVED */}

        <div className="stat-card">
          <span className="stat-title">
            Approved
          </span>

          <strong className="stat-value">
            {approvedInvestments}
          </strong>

          <small>
            Investment requests approved
          </small>
        </div>


        {/* COMPLETED */}

        <div className="stat-card">
          <span className="stat-title">
            Completed
          </span>

          <strong className="stat-value">
            {completedInvestments}
          </strong>

          <small>
            Successfully completed
          </small>
        </div>

      </div>


      {/* =================================
          PORTFOLIO YIELD
      ================================= */}

      {investments.length > 0 && (
        <div
          className="stat-card"
          style={{
            marginBottom: "25px"
          }}
        >
          <span className="stat-title">
            Average Portfolio Rental Yield
          </span>

          <strong className="stat-value">
            {portfolioYield.toFixed(1)}%
          </strong>
        </div>
      )}


      {/* =================================
          SEARCH / FILTER / SORT
      ================================= */}

      {investments.length > 0 && (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "25px"
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1.5fr) minmax(170px, 1fr) minmax(170px, 1fr)",
              gap: "15px"
            }}
          >

            {/* SEARCH */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "7px",
                  color: "#374151"
                }}
              >
                Search Investments
              </label>

              <input
                type="text"
                placeholder="Search property or location..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>


            {/* STATUS */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "7px",
                  color: "#374151"
                }}
              >
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  fontSize: "14px",
                  background: "#ffffff",
                  cursor: "pointer"
                }}
              >
                <option value="All">
                  All Investments
                </option>

                <option value="Interest Submitted">
                  Interest Submitted
                </option>

                <option value="Under Review">
                  Under Review
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>


            {/* SORT */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "7px",
                  color: "#374151"
                }}
              >
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  fontSize: "14px",
                  background: "#ffffff",
                  cursor: "pointer"
                }}
              >
                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

                <option value="highest">
                  Highest Investment
                </option>

                <option value="lowest">
                  Lowest Investment
                </option>
              </select>
            </div>

          </div>


          <div
            style={{
              marginTop: "14px",
              fontSize: "13px",
              color: "#6b7280"
            }}
          >
            Showing{" "}
            <strong>
              {filteredInvestments.length}
            </strong>{" "}
            of{" "}
            <strong>
              {investments.length}
            </strong>{" "}
            investments
          </div>

        </section>
      )}


      {/* =================================
          INVESTMENT LIST
      ================================= */}

      <section className="investment-list">

        {filteredInvestments.map(
          (investment) => {

            const property =
              investment.property || {};

            const status =
              investment.status ||
              "Interest Submitted";

            const statusIndex =
              getStatusIndex(status);

            return (
              <div
                className="investment-card"
                key={investment._id}
              >

                {/* PROPERTY INFORMATION */}

                <div>
                  <span className="ticker">
                    PROPERTY INVESTMENT
                  </span>

                  <h2>
                    {property.name ||
                      "Property Investment"}
                  </h2>

                  <p className="property-location">
                    📍{" "}
                    {property.location ||
                      "Location unavailable"}
                  </p>

                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#6b7280"
                    }}
                  >
                    Request submitted on{" "}
                    {formatDate(
                      investment.createdAt
                    )}
                  </p>
                </div>


                {/* INVESTMENT INFORMATION */}

                <div className="investment-info">

                  {/* AMOUNT */}

                  <div>
                    <span>
                      Investment
                    </span>

                    <strong>
                      ₹
                      {formatMoney(
                        investment.amount
                      )}
                    </strong>
                  </div>


                  {/* RENTAL YIELD */}

                  <div>
                    <span>
                      Rental Yield
                    </span>

                    <strong>
                      {Number(
                        property.rentalYield || 0
                      ).toFixed(1)}
                      %
                    </strong>
                  </div>


                  {/* STATUS */}

                  <div>
                    <span>
                      Current Status
                    </span>

                    <strong
                      className={`status-badge ${getStatusClass(
                        status
                      )}`}
                    >
                      {status}
                    </strong>
                  </div>

                </div>


                {/* STATUS TRACKER */}

                {status !== "Rejected" && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: "25px"
                    }}
                  >

                    <p
                      style={{
                        fontWeight: "600",
                        marginBottom: "15px"
                      }}
                    >
                      Investment Progress
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "10px"
                      }}
                    >

                      {statusSteps.map(
                        (step, index) => {

                          const completed =
                            index <= statusIndex;

                          return (
                            <div
                              key={step}
                              style={{
                                flex: 1,
                                textAlign: "center"
                              }}
                            >

                              <div
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  margin:
                                    "0 auto 8px",
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  background:
                                    completed
                                      ? "#111827"
                                      : "#e5e7eb",
                                  color:
                                    completed
                                      ? "#ffffff"
                                      : "#6b7280",
                                  fontSize: "13px",
                                  fontWeight: "700"
                                }}
                              >
                                {index + 1}
                              </div>

                              <span
                                style={{
                                  fontSize: "12px",
                                  color:
                                    completed
                                      ? "#111827"
                                      : "#6b7280",
                                  fontWeight:
                                    completed
                                      ? "600"
                                      : "400"
                                }}
                              >
                                {step ===
                                "Interest Submitted"
                                  ? "Submitted"
                                  : step}
                              </span>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>
                )}


                {/* REJECTED MESSAGE */}

                {status === "Rejected" && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      background: "#fef2f2",
                      color: "#b91c1c",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    This investment request
                    has been rejected.
                  </div>
                )}


                {/* ACTION BUTTONS */}

                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}
                >

                  {/* VIEW DETAILS */}

                  <button
                    type="button"
                    className="button"
                    onClick={() =>
                      setSelectedInvestment(
                        investment
                      )
                    }
                  >
                    View Investment Details →
                  </button>


                  {/* VIEW PROPERTY */}

                  {property._id && (
                    <Link
                      to={`/properties/${property._id}`}
                      className="button secondary"
                    >
                      View Property
                    </Link>
                  )}

                  {/* DELETE INVESTMENT */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteInvestment(investment._id)
                    }
                    disabled={deletingId === investment._id}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid #dc2626",
                      background:
                        deletingId === investment._id
                          ? "#fee2e2"
                          : "#ffffff",
                      color: "#dc2626",
                      fontWeight: "600",
                      cursor:
                        deletingId === investment._id
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        deletingId === investment._id ? 0.7 : 1
                    }}
                  >
                    {deletingId === investment._id
                      ? "Deleting..."
                      : "Delete Investment"}
                  </button>

                </div>

              </div>
            );
          }
        )}


        {/* =================================
            NO SEARCH RESULTS
        ================================= */}

        {investments.length > 0 &&
          filteredInvestments.length === 0 && (
            <div
              className="empty"
              style={{
                marginTop: "20px"
              }}
            >
              <h2>
                No Investments Found
              </h2>

              <p>
                No investment matches your
                current search or filter.
              </p>

              <button
                className="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setSortBy("newest");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}


        {/* =================================
            NO INVESTMENTS
        ================================= */}

        {investments.length === 0 && (
          <div className="empty">

            <h2>
              No Investments Yet
            </h2>

            <p>
              You have not submitted any
              property investment requests yet.
            </p>

            <Link
              to="/properties"
              className="button"
            >
              Explore Properties
            </Link>

          </div>
        )}

      </section>


      {/* =================================
          INVESTMENT DETAILS MODAL
      ================================= */}

      {selectedInvestment && (
        <div
          onClick={() =>
            setSelectedInvestment(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999
          }}
        >

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxSizing: "border-box",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.25)"
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: "20px",
                marginBottom: "25px"
              }}
            >

              <div>

                <span className="eyebrow">
                  INVESTMENT DETAILS
                </span>

                <h2
                  style={{
                    margin:
                      "8px 0 5px"
                  }}
                >
                  {selectedInvestment
                    .property?.name ||
                    "Property Investment"}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#6b7280"
                  }}
                >
                  📍{" "}
                  {selectedInvestment
                    .property?.location ||
                    "Location unavailable"}
                </p>

              </div>


              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setSelectedInvestment(null)
                }
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border:
                    "1px solid #e5e7eb",
                  background: "#f8fafc",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>

            </div>


            {/* MAIN DETAILS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "15px"
              }}
            >

              {/* AMOUNT */}

              <div
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px"
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "5px"
                  }}
                >
                  Investment Amount
                </span>

                <strong
                  style={{
                    fontSize: "20px"
                  }}
                >
                  ₹
                  {formatMoney(
                    selectedInvestment.amount
                  )}
                </strong>
              </div>


              {/* RENTAL YIELD */}

              <div
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px"
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "5px"
                  }}
                >
                  Rental Yield
                </span>

                <strong
                  style={{
                    fontSize: "20px"
                  }}
                >
                  {Number(
                    selectedInvestment
                      .property?.rentalYield || 0
                  ).toFixed(1)}
                  %
                </strong>
              </div>


              {/* STATUS */}

              <div
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px"
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "5px"
                  }}
                >
                  Current Status
                </span>

                <strong
                  className={`status-badge ${getStatusClass(
                    selectedInvestment.status ||
                      "Interest Submitted"
                  )}`}
                >
                  {selectedInvestment.status ||
                    "Interest Submitted"}
                </strong>
              </div>


              {/* DATE */}

              <div
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px"
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "5px"
                  }}
                >
                  Request Date
                </span>

                <strong>
                  {formatDate(
                    selectedInvestment.createdAt
                  )}
                </strong>
              </div>

            </div>


            {/* PROPERTY INFORMATION */}

            <div
              style={{
                marginTop: "25px"
              }}
            >

              <h3
                style={{
                  marginBottom: "15px"
                }}
              >
                Property Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gap: "10px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                    paddingBottom: "10px",
                    borderBottom:
                      "1px solid #e5e7eb"
                  }}
                >
                  <span>
                    Property
                  </span>

                  <strong>
                    {selectedInvestment
                      .property?.name ||
                      "N/A"}
                  </strong>
                </div>


                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                    paddingBottom: "10px",
                    borderBottom:
                      "1px solid #e5e7eb"
                  }}
                >
                  <span>
                    Location
                  </span>

                  <strong>
                    {selectedInvestment
                      .property?.location ||
                      "N/A"}
                  </strong>
                </div>


                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                    paddingBottom: "10px",
                    borderBottom:
                      "1px solid #e5e7eb"
                  }}
                >
                  <span>
                    Rental Yield
                  </span>

                  <strong>
                    {Number(
                      selectedInvestment
                        .property?.rentalYield || 0
                    ).toFixed(1)}
                    %
                  </strong>
                </div>

              </div>

            </div>


            {/* ADDITIONAL INFORMATION */}

            {(selectedInvestment.paymentMethod ||
              selectedInvestment.investmentType ||
              selectedInvestment.notes) && (
              <div
                style={{
                  marginTop: "25px"
                }}
              >

                <h3
                  style={{
                    marginBottom: "15px"
                  }}
                >
                  Additional Information
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "10px"
                  }}
                >

                  {selectedInvestment.paymentMethod && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        paddingBottom: "10px",
                        borderBottom:
                          "1px solid #e5e7eb"
                      }}
                    >
                      <span>
                        Payment Method
                      </span>

                      <strong>
                        {
                          selectedInvestment.paymentMethod
                        }
                      </strong>
                    </div>
                  )}


                  {selectedInvestment.investmentType && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        paddingBottom: "10px",
                        borderBottom:
                          "1px solid #e5e7eb"
                      }}
                    >
                      <span>
                        Investment Type
                      </span>

                      <strong>
                        {
                          selectedInvestment.investmentType
                        }
                      </strong>
                    </div>
                  )}


                  {selectedInvestment.notes && (
                    <div>
                      <span
                        style={{
                          display: "block",
                          marginBottom: "6px"
                        }}
                      >
                        Notes
                      </span>

                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          lineHeight: 1.6
                        }}
                      >
                        {selectedInvestment.notes}
                      </p>
                    </div>
                  )}

                </div>

              </div>
            )}


            {/* MODAL ACTIONS */}

            <div
              style={{
                marginTop: "28px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}
            >

              {selectedInvestment.property?._id && (
                <Link
                  to={`/properties/${selectedInvestment.property._id}`}
                  className="button"
                  onClick={() =>
                    setSelectedInvestment(null)
                  }
                >
                  View Property →
                </Link>
              )}

              <button
                type="button"
                onClick={() =>
                  handleDeleteInvestment(selectedInvestment._id)
                }
                disabled={deletingId === selectedInvestment._id}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #dc2626",
                  background:
                    deletingId === selectedInvestment._id
                      ? "#fee2e2"
                      : "#ffffff",
                  color: "#dc2626",
                  fontWeight: "600",
                  cursor:
                    deletingId === selectedInvestment._id
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    deletingId === selectedInvestment._id ? 0.7 : 1
                }}
              >
                {deletingId === selectedInvestment._id
                  ? "Deleting..."
                  : "Delete Investment"}
              </button>

              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  setSelectedInvestment(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}