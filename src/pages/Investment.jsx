import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getPropertyById } from "../api/api";

export default function Investment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review screen
  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [formData, setFormData] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const loggedInUser = savedUser ? JSON.parse(savedUser) : null;
      return {
        investorName: loggedInUser?.name || "",
        email: loggedInUser?.email || "",
        phone: loggedInUser?.phone || "",
        amount: "",
        message: ""
      };
    } catch {
      return {
        investorName: "",
        email: "",
        phone: "",
        amount: "",
        message: ""
      };
    }
  });

  // =====================================
  // CHECK LOGIN
  // =====================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/login");
    }
  }, [navigate, user]);

  // =====================================
  // LOAD PROPERTY
  // =====================================

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPropertyById(id);

        setProperty(response.data?.data || null);
      } catch (err) {
        console.error(
          "Investment Property Error:",
          err
        );

        setError("Unable to load property.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // =====================================
  // HANDLE FORM CHANGE
  // =====================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =====================================
  // REVIEW INVESTMENT
  // =====================================

  const handleReviewInvestment = (event) => {
    event.preventDefault();

    setError("");

    if (!user) {
      setError(
        "Please login before continuing."
      );
      return;
    }

    if (!formData.phone) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (!formData.amount) {
      setError(
        "Please enter an investment amount."
      );
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError(
        "Investment amount must be greater than ₹0."
      );
      return;
    }

    // Show review screen
    setShowConfirmation(true);
  };

  // =====================================
  // EDIT DETAILS
  // =====================================

  const handleEditDetails = () => {
    setShowConfirmation(false);
    setError("");
  };

  // =====================================
  // CONTINUE TO PAYMENT
  // =====================================

  const handleContinueToPayment = () => {
    navigate(
      `/properties/${property._id}/purchase`,
      {
        state: {
          investorName:
            formData.investorName,

          email:
            formData.email,

          phone:
            formData.phone,

          amount:
            Number(formData.amount),

          message:
            formData.message
        }
      }
    );
  };

  // =====================================
  // ESTIMATED RETURNS
  // =====================================

  const investmentAmount =
    Number(formData.amount) || 0;

  const rentalYield =
    Number(property?.rentalYield) || 0;

  const appreciation =
    Number(property?.appreciation) || 0;

  const monthlyRental =
    (investmentAmount * rentalYield) /
    100 /
    12;

  const yearlyRental =
    (investmentAmount * rentalYield) /
    100;

  const estimatedAppreciation =
    (investmentAmount * appreciation) /
    100;

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="empty">
        <h2>
          Loading Investment Page...
        </h2>

        <p>
          Fetching property details.
        </p>
      </div>
    );
  }

  // =====================================
  // PROPERTY NOT FOUND
  // =====================================

  if (!property) {
    return (
      <div className="empty">

        <h2>
          Property Not Found
        </h2>

        <p>
          {error ||
            "The requested property could not be found."}
        </p>

        <Link
          to="/properties"
          className="button"
        >
          ← Back to Properties
        </Link>

      </div>
    );
  }

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="investment-page">

      {/* =================================
          BACK
      ================================= */}

      <Link
        to={`/properties/${property._id}`}
        className="back-link"
      >
        ← Back to Property
      </Link>

      {/* =================================
          HEADING
      ================================= */}

      <section className="page-heading">

        <span className="eyebrow">
          INVESTMENT REQUEST
        </span>

        <h1>
          Invest in {property.name}
        </h1>

        <p>
          Enter your investment details and
          review your estimated returns.
        </p>

      </section>

      {/* =================================
          MAIN GRID
      ================================= */}

      <div className="investment-layout">

        {/* =================================
            PROPERTY CARD
        ================================= */}

        <div className="investment-property-card">

          {property.image && (
            <img
              src={property.image}
              alt={property.name}
            />
          )}

          <div className="investment-property-content">

            <span className="eyebrow">
              {property.type ||
                "PROPERTY"}
            </span>

            <h2>
              {property.name}
            </h2>

            <p>
              📍 {property.location}
            </p>

            <h3>
              ₹
              {Number(
                property.price || 0
              ).toLocaleString("en-IN")}
            </h3>

            <div className="investment-stats">

              <div>
                <span>
                  Rental Yield
                </span>

                <strong>
                  {property.rentalYield || 0}%
                </strong>
              </div>

              <div>
                <span>
                  Appreciation
                </span>

                <strong>
                  {property.appreciation || 0}%
                </strong>
              </div>

              <div>
                <span>
                  Occupancy
                </span>

                <strong>
                  {property.occupancy || 0}%
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="investment-form-card">

          {/* =================================
              FORM
          ================================= */}

          {!showConfirmation && (

            <>
              <span className="eyebrow">
                YOUR DETAILS
              </span>

              <h2>
                Investment Details
              </h2>

              <p>
                Your account information has
                been filled automatically.
              </p>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handleReviewInvestment
                }
              >

                {/* NAME */}

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="investorName"
                    value={
                      formData.investorName
                    }
                    readOnly
                  />

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    readOnly
                  />

                </div>

                {/* PHONE */}

                <div className="form-group">

                  <label>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={
                      formData.phone
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* AMOUNT */}

                <div className="form-group">

                  <label>
                    Investment Amount (₹) *
                  </label>

                  <input
                    type="number"
                    name="amount"
                    min="1"
                    placeholder="Enter investment amount"
                    value={
                      formData.amount
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* ESTIMATED RETURNS */}

                {investmentAmount > 0 && (

                  <div
                    style={{
                      marginTop: "18px",
                      marginBottom: "18px",
                      padding: "20px",
                      border:
                        "1px solid #dfe5e1",
                      borderRadius: "12px",
                      background:
                        "#f8faf9"
                    }}
                  >

                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "16px"
                      }}
                    >
                      Estimated Returns
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "12px"
                      }}
                    >

                      <span>
                        Monthly Rental Income
                      </span>

                      <strong>
                        ₹
                        {Math.round(
                          monthlyRental
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "12px"
                      }}
                    >

                      <span>
                        Yearly Rental Income
                      </span>

                      <strong>
                        ₹
                        {Math.round(
                          yearlyRental
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between"
                      }}
                    >

                      <span>
                        Estimated Appreciation
                      </span>

                      <strong>
                        ₹
                        {Math.round(
                          estimatedAppreciation
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  </div>

                )}

                {/* MESSAGE */}

                <div className="form-group">

                  <label>
                    Message
                  </label>

                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Any questions or requirements?"
                    value={
                      formData.message
                    }
                    onChange={handleChange}
                  />

                </div>

                {/* WARNING */}

                

                {/* REVIEW BUTTON */}

                <button
                  type="submit"
                  className="button investment-submit"
                >
                  Review Investment
                </button>

              </form>

              <p className="investment-note">
                Return figures are estimates based
                on the property's listed rental yield
                and appreciation rate. Actual returns
                may vary.
              </p>

            </>

          )}

          {/* =================================
              REVIEW SCREEN
          ================================= */}

          {showConfirmation && (

            <div>

              <span className="eyebrow">
                REVIEW
              </span>

              <h2>
                Review Investment
              </h2>

              <p>
                Please check your details before
                continuing to payment.
              </p>

              {/* DETAILS BOX */}

              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: "12px"
                }}
              >

                {/* PROPERTY */}

                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <span>
                    Property
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {property.name}
                  </strong>

                </div>

                {/* NAME */}

                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <span>
                    Investor
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {formData.investorName}
                  </strong>

                </div>

                {/* EMAIL */}

                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <span>
                    Email
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {formData.email}
                  </strong>

                </div>

                {/* PHONE */}

                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <span>
                    Phone
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    {formData.phone}
                  </strong>

                </div>

                {/* AMOUNT */}

                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <span>
                    Investment Amount
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "24px"
                    }}
                  >
                    ₹
                    {investmentAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                {/* MONTHLY RENT */}

                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <span>
                    Estimated Monthly Rental
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    ₹
                    {Math.round(
                      monthlyRental
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                {/* YEARLY RENT */}

                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <span>
                    Estimated Yearly Rental
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    ₹
                    {Math.round(
                      yearlyRental
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                {/* APPRECIATION */}

                <div>

                  <span>
                    Estimated Appreciation
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px"
                    }}
                  >
                    ₹
                    {Math.round(
                      estimatedAppreciation
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

              {/* =================================
                  ACTION BUTTONS
              ================================= */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "20px",
                  flexWrap: "wrap"
                }}
              >

                {/* EDIT */}

                <button
                  type="button"
                  className="button secondary"
                  onClick={
                    handleEditDetails
                  }
                >
                  ← Edit Details
                </button>

                {/* PAYMENT */}

                <button
                  type="button"
                  className="button investment-submit"
                  onClick={
                    handleContinueToPayment
                  }
                >
                  Continue to Payment →
                </button>

              </div>

              <p className="investment-note">
                You can edit your details before
                continuing to the payment page.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}