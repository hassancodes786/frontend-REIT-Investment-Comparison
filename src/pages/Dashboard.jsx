import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getReits, getProperties } from "../api/api";

import ReitCard from "../components/ReitCard";
import StatCard from "../components/StatCard";


export default function Dashboard() {

  const [reitData, setReitData] =
    useState([]);

  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================
  // LOAD DATA FROM MONGODB
  // =====================================

  useEffect(() => {

    const loadDashboardData = async () => {

      try {

        setLoading(true);
        setError("");

        const [
          reitResponse,
          propertyResponse
        ] = await Promise.all([
          getReits(),
          getProperties()
        ]);


        setReitData(
          reitResponse.data.data || []
        );


        setProperties(
          propertyResponse.data.data || []
        );


      } catch (err) {

        console.error(
          "Dashboard API Error:",
          err
        );

        setError(
          "Unable to load dashboard data."
        );

      } finally {

        setLoading(false);

      }

    };


    loadDashboardData();

  }, []);


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="empty">

        <h2>
          Loading Dashboard...
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
          Dashboard Error
        </h2>

        <p>
          {error}
        </p>

        <button
          className="button"
          onClick={() =>
            window.location.reload()
          }
        >
          Try Again
        </button>

      </div>

    );

  }


  // =====================================
  // CALCULATIONS
  // =====================================

  const averageDividend =
    reitData.length > 0
      ? reitData.reduce(
          (total, reit) =>
            total +
            Number(
              reit.dividendYield || 0
            ),
          0
        ) / reitData.length
      : 0;


  const averageReturn =
    reitData.length > 0
      ? reitData.reduce(
          (total, reit) =>
            total +
            Number(
              reit.return1Y || 0
            ),
          0
        ) / reitData.length
      : 0;


  const bestReturn =
    reitData.length > 0
      ? Math.max(
          ...reitData.map(
            (reit) =>
              Number(
                reit.return1Y || 0
              )
          )
        )
      : 0;


  // =====================================
  // BEST REIT
  // =====================================

  const bestReit =
    reitData.length > 0
      ? [...reitData].sort(
          (a, b) =>
            Number(b.return1Y || 0) -
            Number(a.return1Y || 0)
        )[0]
      : null;


  // =====================================
  // FEATURED REITS
  // =====================================

  const featuredReits =
    [...reitData]
      .sort(
        (a, b) =>
          Number(b.return1Y || 0) -
          Number(a.return1Y || 0)
      )
      .slice(0, 4);


  // =====================================
  // PAGE
  // =====================================

  return (

    <div>


      {/* =================================
          HERO
      ================================= */}

      <section className="hero">

        <div className="hero-content">

          <span className="eyebrow">
            REAL ESTATE • REIT ANALYTICS
          </span>


          <h1>
            Compare REITs.
            <br />
            Understand Returns.
          </h1>


          <p>
            Compare real estate investment
            trusts based on returns, dividends,
            occupancy, debt and risk.
          </p>


          <div className="hero-buttons">

            <Link
              to="/compare"
              className="button hero-button"
            >
              Start Comparing
            </Link>


            <Link
              to="/calculator"
              className="button hero-button-outline"
            >
              Investment Calculator
            </Link>

          </div>

        </div>


        {/* BEST RETURN */}

        <div className="hero-score">

          <span>
            Highest 1Y Return
          </span>

          <strong>
            {bestReturn}%
          </strong>

          <p>
            {bestReit
              ? bestReit.name
              : "Among tracked REITs"}
          </p>

        </div>

      </section>


      {/* =================================
          STATS
      ================================= */}

      <section className="stats-grid">

        <StatCard
          title="REITs Tracked"
          value={reitData.length}
          subtitle="Currently available"
        />


        <StatCard
          title="Properties Available"
          value={properties.length}
          subtitle="Investment properties"
        />


        <StatCard
          title="Average Dividend"
          value={`${averageDividend.toFixed(1)}%`}
          subtitle="Across tracked REITs"
        />


        <StatCard
          title="Average 1Y Return"
          value={`${averageReturn.toFixed(1)}%`}
          subtitle="Historical performance"
        />

      </section>


      {/* =================================
          FEATURED REITS
      ================================= */}

      <section className="content-section">

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              FEATURED
            </span>

            <h2>
              REIT Snapshot
            </h2>

          </div>


          <Link to="/reits">
            View all →
          </Link>

        </div>


        <div className="card-grid">

          {featuredReits.map(
            (reit) => (

              <ReitCard
                key={reit._id}
                reit={{
                  ...reit,
                  id: reit._id
                }}
              />

            )
          )}

        </div>

      </section>


      {/* =================================
          PROPERTY SECTION
      ================================= */}

      {properties.length > 0 && (

        <section className="content-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                OPPORTUNITIES
              </span>

              <h2>
                Investment Properties
              </h2>

            </div>


            <Link to="/properties">
              View all →
            </Link>

          </div>


          <div className="property-summary">

            <p>
              {properties.length} investment
              properties are currently
              available on the platform.
            </p>


            <Link
              to="/properties"
              className="button"
            >
              Explore Properties
            </Link>

          </div>

        </section>

      )}

    </div>

  );

}