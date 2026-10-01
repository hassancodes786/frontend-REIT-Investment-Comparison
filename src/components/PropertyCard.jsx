import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  return (
    <article className="property-card">

      <div className="property-image-wrapper">

        <img
          src={property.image}
          alt={property.name}
          className="property-image"
        />

        <span className="property-status">
          {property.status}
        </span>

      </div>


      <div className="property-card-body">

        <span className="property-type">
          {property.type}
        </span>

        <h3>
          {property.name}
        </h3>

        <p className="property-location">
          📍 {property.location}
        </p>


        <div className="property-price">
          ₹{property.price.toLocaleString("en-IN")}
        </div>


        <div className="property-metrics">

          <div>
            <span>Area</span>
            <strong>{property.area} sq.ft</strong>
          </div>

          <div>
            <span>Rental Yield</span>
            <strong className="positive">
              {property.rentalYield}%
            </strong>
          </div>

          <div>
            <span>Appreciation</span>
            <strong className="positive">
              {property.appreciation}%
            </strong>
          </div>

          <div>
            <span>Occupancy</span>
            <strong>
              {property.occupancy}%
            </strong>
          </div>

        </div>


        <Link
          to={`/properties/${property._id || property.id}`}
          className="button property-button"
        >
          View Property
        </Link>

      </div>

    </article>
  );
}