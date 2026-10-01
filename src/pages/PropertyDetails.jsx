import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPropertyById } from "../api/api";


export default function PropertyDetails() {

  const { id } = useParams();

  const [property, setProperty] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ============================
  // FETCH PROPERTY
  // ============================

  useEffect(() => {

    const fetchProperty = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await getPropertyById(id);

        setProperty(
          response.data.data
        );

      } catch (error) {

        console.error(
          "Property Details Error:",
          error
        );

        setError(
          "Unable to load property details."
        );

      } finally {

        setLoading(false);

      }

    };


    if (id) {
      fetchProperty();
    }

  }, [id]);


  // ============================
  // LOADING
  // ============================

  if (loading) {

    return (
      <div className="empty">

        <h2>
          Loading Property...
        </h2>

        <p>
          Fetching property details
          from MongoDB.
        </p>

      </div>
    );

  }


  // ============================
  // ERROR
  // ============================

  if (error || !property) {

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


  // ============================
  // PROPERTY DETAILS
  // ============================

  return (

    <div className="property-details">

      {/* BACK */}

      <Link
        to="/properties"
        className="back-link"
      >
        ← Back to Properties
      </Link>


      {/* HERO */}

      <section className="property-detail-hero">

        <div className="property-detail-image">

          <img
            src={
              property.image ||
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
            }
            alt={property.name}
          />

        </div>


        <div className="property-detail-info">

          <span className="eyebrow">

            {property.type}

          </span>


          <h1>
            {property.name}
          </h1>


          <p className="property-location">

            📍 {property.location}

          </p>


          <h2 className="property-price">

            ₹{property.price.toLocaleString("en-IN")}

          </h2>


          <span className="property-status">

            {property.status}

          </span>


          <p className="property-description">

            {property.description}

          </p>


          {/* INVEST BUTTON */}

          <Link
            to={`/properties/${property._id}/invest`}
            className="button"
          >
            Invest Now
          </Link>

        </div>

      </section>


      {/* KEY METRICS */}

      <section className="property-metrics">

        <div className="metric-card">

          <span>
            Area
          </span>

          <strong>
            {property.area} sq.ft
          </strong>

        </div>


        <div className="metric-card">

          <span>
            Rental Yield
          </span>

          <strong>
            {property.rentalYield}%
          </strong>

        </div>


        <div className="metric-card">

          <span>
            Appreciation
          </span>

          <strong>
            {property.appreciation}%
          </strong>

        </div>


        <div className="metric-card">

          <span>
            Occupancy
          </span>

          <strong>
            {property.occupancy}%
          </strong>

        </div>

      </section>


      {/* PROPERTY INFORMATION */}

      <section className="property-information">

        <div>

          <h2>
            Property Information
          </h2>


          <div className="info-grid">

            <div>
              <span>
                City
              </span>

              <strong>
                {property.city}
              </strong>
            </div>


            <div>
              <span>
                Property Type
              </span>

              <strong>
                {property.type}
              </strong>
            </div>


            <div>
              <span>
                Developer
              </span>

              <strong>
                {property.developer}
              </strong>
            </div>


            <div>
              <span>
                Bedrooms
              </span>

              <strong>
                {property.bedrooms || 0}
              </strong>
            </div>


            <div>
              <span>
                Bathrooms
              </span>

              <strong>
                {property.bathrooms || 0}
              </strong>
            </div>


            <div>
              <span>
                Occupancy
              </span>

              <strong>
                {property.occupancy}%
              </strong>
            </div>

          </div>

        </div>


        {/* AMENITIES */}

        <div>

          <h2>
            Amenities
          </h2>


          <div className="amenities-list">

            {property.amenities &&
              property.amenities.map(
                (amenity, index) => (

                  <span
                    key={index}
                    className="amenity"
                  >
                    ✓ {amenity}
                  </span>

                )
              )}

          </div>

        </div>

      </section>


      {/* INVESTMENT CTA */}

      <section className="investment-cta">

        <div>

          <span className="eyebrow">
            INVESTMENT OPPORTUNITY
          </span>

          <h2>
            Interested in this property?
          </h2>

          <p>
            Submit an investment request
            and our team will review it.
          </p>

        </div>


        <Link
          to={`/properties/${property._id}/invest`}
          className="button"
        >
          Invest Now →
        </Link>

      </section>

    </div>

  );
}