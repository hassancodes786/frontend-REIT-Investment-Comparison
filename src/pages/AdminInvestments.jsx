import { useEffect, useState } from "react";

import {
  getInvestments,
  updateInvestmentStatus
} from "../api/api";


export default function AdminInvestments() {

  const [investments, setInvestments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  // Selected investment for View Details
  const [selectedInvestment, setSelectedInvestment] =
    useState(null);


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

      console.error(
        "Admin Investments Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load investment requests."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadInvestments();

  }, []);


  // =====================================
  // UPDATE STATUS
  // =====================================

  const handleStatusChange = async (
    investmentId,
    newStatus
  ) => {

    try {

      setUpdatingId(investmentId);

      await updateInvestmentStatus(
        investmentId,
        newStatus
      );

      await loadInvestments();

      // Update popup data also if open
      if (
        selectedInvestment &&
        selectedInvestment._id === investmentId
      ) {

        setSelectedInvestment((previous) => ({
          ...previous,
          status: newStatus
        }));

      }

    } catch (err) {

      console.error(
        "Status Update Error:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Unable to update investment status."
      );

    } finally {

      setUpdatingId(null);

    }

  };


  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {

    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );

  };


  // =====================================
  // DASHBOARD STATS
  // =====================================

  const totalRequests =
    investments.length;


  const totalInvestmentAmount =
    investments.reduce(
      (total, investment) =>
        total +
        Number(investment.amount || 0),
      0
    );


  const pendingReview =
    investments.filter(
      (investment) =>
        investment.status ===
          "Interest Submitted" ||
        investment.status ===
          "Under Review"
    ).length;


  const approved =
    investments.filter(
      (investment) =>
        investment.status === "Approved"
    ).length;


  const completed =
    investments.filter(
      (investment) =>
        investment.status === "Completed"
    ).length;


  const rejected =
    investments.filter(
      (investment) =>
        investment.status === "Rejected"
    ).length;


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="empty">

        <h2>
          Loading Investment Requests...
        </h2>

        <p>
          Fetching investment data
          from MongoDB.
        </p>

      </div>

    );

  }


  // =====================================
  // ERROR
  // =====================================

  if (error) {

    return (

      <div className="empty">

        <h2>
          Investment Error
        </h2>

        <p>
          {error}
        </p>

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
  // PAGE
  // =====================================

  return (

    <div>

      {/* PAGE HEADING */}

      <section className="page-heading">

        <span className="eyebrow">
          ADMIN PANEL
        </span>

        <h1>
          Investment Dashboard
        </h1>

        <p>
          Review and manage all property
          investment requests.
        </p>

      </section>


      {/* =================================
          DASHBOARD STATS
      ================================= */}

      <div className="investment-summary">


        {/* TOTAL REQUESTS */}

        <div className="stat-card">

          <span className="stat-title">
            Total Requests
          </span>

          <strong className="stat-value">
            {totalRequests}
          </strong>

          <span
            style={{
              fontSize: "13px",
              color: "#64748b"
            }}
          >
            All investment requests
          </span>

        </div>


        {/* TOTAL AMOUNT */}

        <div className="stat-card">

          <span className="stat-title">
            Total Investment
          </span>

          <strong className="stat-value">

            ₹
            {totalInvestmentAmount.toLocaleString(
              "en-IN"
            )}

          </strong>

          <span
            style={{
              fontSize: "13px",
              color: "#64748b"
            }}
          >
            Total requested amount
          </span>

        </div>


        {/* PENDING */}

        <div className="stat-card">

          <span className="stat-title">
            Pending Review
          </span>

          <strong className="stat-value">
            {pendingReview}
          </strong>

          <span
            style={{
              fontSize: "13px",
              color: "#64748b"
            }}
          >
            Awaiting action
          </span>

        </div>


        {/* APPROVED */}

        <div className="stat-card">

          <span className="stat-title">
            Approved
          </span>

          <strong className="stat-value">
            {approved}
          </strong>

          <span
            style={{
              fontSize: "13px",
              color: "#64748b"
            }}
          >
            Approved investments
          </span>

        </div>

      </div>


      {/* =================================
          SECONDARY STATS
      ================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "30px"
        }}
      >

        <div className="stat-card">

          <span className="stat-title">
            Completed
          </span>

          <strong className="stat-value">
            {completed}
          </strong>

        </div>


        <div className="stat-card">

          <span className="stat-title">
            Rejected
          </span>

          <strong className="stat-value">
            {rejected}
          </strong>

        </div>

      </div>


      {/* =================================
          REQUEST LIST
      ================================= */}

      <section className="investment-list">

        <div
          style={{
            marginBottom: "18px"
          }}
        >

          <h2
            style={{
              marginBottom: "5px"
            }}
          >
            Investment Requests
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b"
            }}
          >
            Manage investor requests and update
            their current status.
          </p>

        </div>


        {investments.map(
          (investment) => {

            const property =
              investment.property || {};

            return (

              <div
                className="investment-card"
                key={investment._id}
              >

                {/* PROPERTY */}

                <div>

                  <span className="ticker">
                    INVESTMENT REQUEST
                  </span>

                  <h2>
                    {property.name ||
                      "Property"}
                  </h2>

                  <p className="property-location">
                    📍{" "}
                    {property.location ||
                      "Location unavailable"}
                  </p>

                </div>


                {/* INVESTOR + AMOUNT */}

                <div className="investment-info">

                  <div>

                    <span>
                      Investor
                    </span>

                    <strong>
                      {investment.investorName ||
                        "N/A"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Investment
                    </span>

                    <strong>

                      ₹
                      {Number(
                        investment.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {investment.email ||
                        "N/A"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Request Date
                    </span>

                    <strong>
                      {formatDate(
                        investment.createdAt
                      )}
                    </strong>

                  </div>

                </div>


                {/* STATUS + VIEW DETAILS */}

                <div>

                  <span className="stat-title">
                    Status
                  </span>

                  <br />

                  <select
                    value={
                      investment.status ||
                      "Interest Submitted"
                    }
                    disabled={
                      updatingId ===
                      investment._id
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        investment._id,
                        e.target.value
                      )
                    }
                    style={{
                      marginTop: "8px",
                      padding: "10px",
                      borderRadius: "8px",
                      border:
                        "1px solid #d8ddd9",
                      fontWeight: "600",
                      minWidth: "180px",
                      cursor:
                        updatingId ===
                        investment._id
                          ? "not-allowed"
                          : "pointer"
                    }}
                  >

                    <option value="Interest Submitted">
                      Interest Submitted
                    </option>

                    <option value="Under Review">
                      Under Review
                    </option>

                    <option value="Approved">
                      Approved
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>


                  <button
                    type="button"
                    onClick={() =>
                      setSelectedInvestment(
                        investment
                      )
                    }
                    style={{
                      display: "block",
                      marginTop: "10px",
                      padding: "9px 16px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#e8f0ec",
                      color: "#123d2b",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    View Details
                  </button>


                  {updatingId ===
                    investment._id && (

                    <p
                      style={{
                        marginTop: "6px",
                        fontSize: "12px"
                      }}
                    >
                      Updating...
                    </p>

                  )}

                </div>

              </div>

            );

          }
        )}


        {/* NO REQUESTS */}

        {investments.length === 0 && (

          <div className="empty">

            <h2>
              No Investment Requests
            </h2>

            <p>
              There are currently no
              investment requests.
            </p>

          </div>

        )}

      </section>


      {/* =================================
          VIEW DETAILS MODAL
      ================================= */}

      {selectedInvestment && (

        <div
          onClick={() =>
            setSelectedInvestment(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
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
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxSizing: "border-box",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.20)"
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px"
              }}
            >

              <div>

                <span className="eyebrow">
                  INVESTMENT DETAILS
                </span>

                <h2
                  style={{
                    margin:
                      "6px 0 0"
                  }}
                >
                  {selectedInvestment.property?.name ||
                    "Property"}
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedInvestment(null)
                }
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>

            </div>


            {/* INVESTOR DETAILS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "14px"
              }}
            >

              <div className="stat-card">

                <span className="stat-title">
                  Investor Name
                </span>

                <strong>
                  {selectedInvestment.investorName ||
                    "N/A"}
                </strong>

              </div>


              <div className="stat-card">

                <span className="stat-title">
                  Investment Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    selectedInvestment.amount ||
                    0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>


              <div className="stat-card">

                <span className="stat-title">
                  Email
                </span>

                <strong
                  style={{
                    wordBreak: "break-word"
                  }}
                >
                  {selectedInvestment.email ||
                    "N/A"}
                </strong>

              </div>


              <div className="stat-card">

                <span className="stat-title">
                  Phone
                </span>

                <strong>
                  {selectedInvestment.phone ||
                    "N/A"}
                </strong>

              </div>


              <div className="stat-card">

                <span className="stat-title">
                  Property
                </span>

                <strong>
                  {selectedInvestment.property?.name ||
                    "N/A"}
                </strong>

              </div>


              <div className="stat-card">

                <span className="stat-title">
                  Location
                </span>

                <strong>
                  {selectedInvestment.property?.location ||
                    "N/A"}
                </strong>

              </div>


              <div className="stat-card">

                <span className="stat-title">
                  Request Date
                </span>

                <strong>
                  {formatDate(
                    selectedInvestment.createdAt
                  )}
                </strong>

              </div>


              <div className="stat-card">

                <span className="stat-title">
                  Current Status
                </span>

                <strong>
                  {selectedInvestment.status ||
                    "Interest Submitted"}
                </strong>

              </div>

            </div>


            {/* MESSAGE */}

            <div
              style={{
                marginTop: "16px",
                padding: "18px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                background: "#f8fafc"
              }}
            >

              <span className="stat-title">
                Investor Message
              </span>

              <p
                style={{
                  margin:
                    "8px 0 0",
                  lineHeight: "1.6",
                  color: "#334155"
                }}
              >
                {selectedInvestment.message ||
                  "No message provided."}
              </p>

            </div>


            {/* USER ID */}

            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0"
              }}
            >

              <span className="stat-title">
                User ID
              </span>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  fontSize: "13px",
                  wordBreak: "break-all",
                  color: "#475569"
                }}
              >
                {selectedInvestment.user?._id ||
                  selectedInvestment.user ||
                  "Legacy investment - User ID unavailable"}
              </p>

            </div>


            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="button"
              onClick={() =>
                setSelectedInvestment(null)
              }
              style={{
                marginTop: "22px",
                width: "100%"
              }}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

}