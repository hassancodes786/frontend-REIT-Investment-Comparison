export default function PropertyPlatformCard({ platform }) {
  const handleVisit = () => {
    window.open(platform.url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="property-platform-card">
      <div className="platform-image-wrapper">
        <img
          src={platform.image}
          alt={platform.name}
          className="platform-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <span className="platform-badge">
          {platform.category}
        </span>
      </div>

      <div className="platform-content">
        <h3>{platform.name}</h3>

        <p>{platform.description}</p>

        <button
          type="button"
          className="platform-button"
          onClick={handleVisit}
        >
          <span>Visit Website</span>
          <span>→</span>
        </button>
      </div>
    </article>
  );
}