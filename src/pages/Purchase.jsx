import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useLocation
} from "react-router-dom";

import {
  getPropertyById,
  createInvestment
} from "../api/api";

export default function Purchase() {
  const { id } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const investmentData =
    location.state || {};

  const [property, setProperty] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [form, setForm] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const loggedInUser = savedUser ? JSON.parse(savedUser) : null;
      return {
        name: loggedInUser?.name || "",
        email: loggedInUser?.email || "",
        phone: investmentData.phone || loggedInUser?.phone || "",
        amount: investmentData.amount || ""
      };
    } catch {
      return {
        name: "",
        email: "",
        phone: investmentData.phone || "",
        amount: investmentData.amount || ""
      };
    }
  });

  // ============================
  // CHECK LOGIN
  // ============================

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/login");
    }
  }, [navigate, user]);

  // ============================
  // LOAD PROPERTY
  // ============================

  useEffect(() => {

    const loadProperty = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await getPropertyById(id);

        const propertyData =
          response.data?.data;

        if (!propertyData) {
          setError(
            "Property not found."
          );

          return;
        }

        setProperty(propertyData);

        setForm((previous) => ({
          ...previous,
          amount:
            investmentData.amount ||
            propertyData.price ||
            ""
        }));

      } catch (err) {

        console.error(
          "Purchase Property Error:",
          err
        );

        setError(
          "Unable to load property details."
        );

      } finally {

        setLoading(false);

      }

    };

    if (id) {
      loadProperty();
    }

  }, [id]);

  // ============================
  // FORM CHANGE
  // ============================

  const handleChange = (event) => {

    const {
      name,
      value
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

  };

  // ============================
  // SUBMIT INVESTMENT REQUEST
  // ============================

  const handleInvestmentSubmit = async (event) => {

    event.preventDefault();

    setError("");

    if (!user) {

      setError(
        "Please login before continuing."
      );

      return;
    }

    if (
      !form.phone ||
      !form.amount
    ) {

      setError(
        "Please fill all required fields."
      );

      return;
    }

    if (Number(form.amount) <= 0) {

      setError(
        "Investment amount must be greater than ₹0."
      );

      return;
    }

    try {

      setProcessing(true);

      // ============================
      // SAVE INVESTMENT IN MONGODB
      // ============================

      const investment = {

        property:
          property._id,

        investorName:
          user.name,

        email:
          user.email,

        phone:
          form.phone,

        amount:
          Number(form.amount),

        message:
          investmentData.message || ""

      };

      await createInvestment(
        investment
      );

      setSubmitted(true);

    } catch (err) {

      console.error(
        "Investment Request Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Investment request could not be submitted."
      );

    } finally {

      setProcessing(false);

    }

  };

  // ============================
  // LOADING
  // ============================

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

  // ============================
  // PROPERTY ERROR
  // ============================

  if (!property) {

    return (

      <div className="empty">

        <h2>
          Property Not Found
        </h2>

        <p>
          {error}
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

  // ============================
  // SUCCESS SCREEN
  // ============================

  if (submitted) {

    return (

      <div className="purchase-success">

        <div className="success-icon">
          ✓
        </div>

        <span className="eyebrow">
          INVESTMENT REQUEST SUBMITTED
        </span>

        <h1>
          Investment Request Completed
        </h1>

        <p>
          Thank you,{" "}
          <strong>
            {form.name}
          </strong>
          .
        </p>

        <p>
          Your investment request for{" "}
          <strong>
            {property.name}
          </strong>{" "}
          has been recorded successfully.
        </p>

        

        {/* DETAILS */}

        <div className="success-details">

          <div>

            <span>
              Property
            </span>

            <strong>
              {property.name}
            </strong>

          </div>

          <div>

            <span>
              Investment Amount
            </span>

            <strong>
              ₹
              {Number(
                form.amount
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div>

            <span>
              Status
            </span>

            <strong>
              Successful
            </strong>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="hero-buttons">

          <Link
            to="/properties"
            className="button"
          >
            Browse Properties
          </Link>

          <button
            className="button secondary"
            onClick={() =>
              navigate(
                "/my-investments"
              )
            }
          >
            My Investments
          </button>

        </div>

      </div>

    );

  }

  // ============================
  // INVESTMENT REQUEST PAGE
  // ============================

  return (

    <div>

      {/* BACK */}

      <Link
        to={`/properties/${property._id}/invest`}
        className="back-link"
      >
        ← Back to Investment
      </Link>

      {/* HEADING */}

      <section className="page-heading">

        <span className="eyebrow">
          INVESTMENT REQUEST
        </span>

        <h1>
          Complete Your Investment
        </h1>

        <p>
          Review your details and submit
          your investment request.
        </p>

      </section>

      <div className="purchase-grid">

        {/* =================================
            PROPERTY
        ================================= */}

        <section className="panel">

          <span className="eyebrow">
            PROPERTY
          </span>

          <h2>
            {property.name}
          </h2>

          <p className="property-location">
            📍 {property.location}
          </p>

          {property.image && (

            <img
              src={property.image}
              alt={property.name}
              className="purchase-image"
            />

          )}

          <div className="purchase-property-price">

            ₹
            {Number(
              property.price || 0
            ).toLocaleString("en-IN")}

          </div>

          <div className="property-metrics">

            <div>

              <span>
                Rental Yield
              </span>

              <strong className="positive">
                {property.rentalYield}%
              </strong>

            </div>

            <div>

              <span>
                Appreciation
              </span>

              <strong className="positive">
                {property.appreciation}%
              </strong>

            </div>

            <div>

              <span>
                Occupancy
              </span>

              <strong className="positive">
                {property.occupancy}%
              </strong>

            </div>

          </div>

        </section>

        {/* =================================
            INVESTMENT REQUEST
        ================================= */}

        <section className="panel">

          <span className="eyebrow">
            INVESTMENT
          </span>

          <h2>
            Investment Details
          </h2>

          <p>
            Review your details before submitting
            your investment request.
          </p>

          {error && (

            <div className="form-error">
              {error}
            </div>

          )}

          <form
            onSubmit={handleInvestmentSubmit}
            className="purchase-form"
          >

            {/* NAME */}

            <label className="form-label">

              Full Name

              <input
                type="text"
                name="name"
                value={form.name}
                readOnly
              />

            </label>

            {/* EMAIL */}

            <label className="form-label">

              Email

              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
              />

            </label>

            {/* PHONE */}

            <label className="form-label">

              Phone Number *

              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />

            </label>

            {/* AMOUNT */}

            <label className="form-label">

              Investment Amount (₹)

              <input
                type="number"
                name="amount"
                min="1"
                value={form.amount}
                onChange={handleChange}
                required
              />

            </label>

            {/* ORDER SUMMARY */}

            <div
              style={{
                marginTop: "10px",
                padding: "18px",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "12px"
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "15px"
                }}
              >
                Order Summary
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "10px"
                }}
              >

                <span>
                  Property
                </span>

                <strong>
                  {property.name}
                </strong>

              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "10px"
                }}
              >

                <span>
                  Investment
                </span>

                <strong>
                  ₹
                  {Number(
                    form.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>

            

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              className="button purchase-submit"
              disabled={processing}
            >

              {processing
                ? "Submitting Request..."
                : `Submit Investment Request - ₹${Number(
                    form.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}`}

            </button>

          </form>

        </section>

      </div>

    </div>

  );
}