import { useEffect, useMemo, useState } from "react";

import PropertyCard from "../components/PropertyCard";
import PropertyPlatformCard from "../components/PropertyPlatformCard";

import { getProperties } from "../api/api";

import propertyPlatforms from "../data/propertyPlatforms";
import investmentPlatforms from "../data/investmentPlatforms";


export default function Properties() {

  const [properties, setProperties] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("All");

  const [sort, setSort] =
    useState("default");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ============================
  // GET PROPERTIES FROM API
  // ============================

  useEffect(() => {

    const fetchProperties = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await getProperties();

        setProperties(
          response.data.data
        );

      } catch (error) {

        console.error(
          "Property API Error:",
          error
        );

        setError(
          "Unable to load properties from server."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchProperties();

  }, []);


  // ============================
  // SEARCH + FILTER + SORT
  // ============================

  const filteredProperties =
    useMemo(() => {

      let result =
        properties.filter(
          (property) => {

            const searchText =
              search.toLowerCase();

            const propertyName =
              property.name
                ? property.name.toLowerCase()
                : "";

            const propertyLocation =
              property.location
                ? property.location.toLowerCase()
                : "";

            const propertyCity =
              property.city
                ? property.city.toLowerCase()
                : "";


            const matchesSearch =
              propertyName.includes(searchText) ||
              propertyLocation.includes(searchText) ||
              propertyCity.includes(searchText);


            const matchesType =
              type === "All" ||
              property.type === type;


            return (
              matchesSearch &&
              matchesType
            );

          }
        );


      // PRICE LOW TO HIGH

      if (sort === "price-low") {

        result.sort(
          (a, b) =>
            a.price - b.price
        );

      }


      // PRICE HIGH TO LOW

      if (sort === "price-high") {

        result.sort(
          (a, b) =>
            b.price - a.price
        );

      }


      // HIGHEST RENTAL YIELD

      if (sort === "yield") {

        result.sort(
          (a, b) =>
            b.rentalYield -
            a.rentalYield
        );

      }


      // HIGHEST APPRECIATION

      if (sort === "appreciation") {

        result.sort(
          (a, b) =>
            b.appreciation -
            a.appreciation
        );

      }


      return result;

    }, [
      properties,
      search,
      type,
      sort
    ]);


  // ============================
  // LOADING
  // ============================

  if (loading) {

    return (
      <div className="empty">

        <h2>
          Loading Properties...
        </h2>

        <p>
          Fetching property data
          from MongoDB.
        </p>

      </div>
    );

  }


  // ============================
  // ERROR
  // ============================

  if (error) {

    return (
      <div className="empty">

        <h2>
          Something went wrong
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


  return (
    <div>

      {/* ============================
          PAGE HEADING
      ============================ */}

      <section className="page-heading">

        <span className="eyebrow">
          PROPERTY MARKETPLACE
        </span>

        <h1>
          Invest in Properties
        </h1>

        <p>
          Explore properties using
          real data stored in MongoDB.
        </p>

      </section>


      {/* ============================
          FILTERS
      ============================ */}

      <section className="property-filters">

        <input
          type="text"
          placeholder="Search property or location..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />


        <select
          value={type}
          onChange={(event) =>
            setType(
              event.target.value
            )
          }
        >

          <option value="All">
            All Property Types
          </option>

          <option value="Residential">
            Residential
          </option>

          <option value="Commercial">
            Commercial
          </option>

          <option value="Retail">
            Retail
          </option>

          <option value="Industrial">
            Industrial
          </option>

        </select>


        <select
          value={sort}
          onChange={(event) =>
            setSort(
              event.target.value
            )
          }
        >

          <option value="default">
            Sort By
          </option>

          <option value="price-low">
            Price: Low to High
          </option>

          <option value="price-high">
            Price: High to Low
          </option>

          <option value="yield">
            Highest Rental Yield
          </option>

          <option value="appreciation">
            Highest Appreciation
          </option>

        </select>

      </section>


      {/* ============================
          RESULT COUNT
      ============================ */}

      <div className="results-info">

        {filteredProperties.length}
        {" "}
        properties available

      </div>


      {/* ============================
          PROPERTY CARDS
      ============================ */}

      <section className="property-grid">

        {filteredProperties.map(
          (property) => (

            <PropertyCard
              key={property._id}
              property={{
                ...property,
                id: property._id
              }}
            />

          )
        )}

      </section>


      {/* ============================
          NO RESULT
      ============================ */}

      {filteredProperties.length === 0 && (

        <div className="empty">

          <h3>
            No properties found
          </h3>

          <p>
            Try another search or
            property type.
          </p>

        </div>

      )}


      {/* ==================================================
          PROPERTY PLATFORMS
      ================================================== */}

      <section className="property-platforms-section">

        <div className="platforms-heading">

          <span className="eyebrow">
            EXPLORE MORE
          </span>

          <h2>
            Explore Property Platforms
          </h2>

          <p>
            Discover more properties, projects
            and real-estate opportunities from
            leading property platforms.
          </p>

        </div>


        <div className="property-platform-grid">

          {propertyPlatforms.map(
            (platform) => (

              <PropertyPlatformCard
                key={platform.id}
                platform={platform}
              />

            )
          )}

        </div>

      </section>


      {/* ==================================================
          INVESTMENT PLATFORMS
      ================================================== */}

      <section className="property-platforms-section investment-platforms-section">

        <div className="platforms-heading">

          <span className="eyebrow">
            REAL ESTATE INVESTMENT
          </span>

          <h2>
            Explore Investment Platforms
          </h2>

          <p>
            Discover real-estate investment
            platforms and explore different ways
            to participate in property investments.
          </p>

        </div>


        <div className="property-platform-grid">

          {investmentPlatforms.map(
            (platform) => (

              <PropertyPlatformCard
                key={platform.id}
                platform={platform}
              />

            )
          )}

        </div>

      </section>


    </div>
  );
}