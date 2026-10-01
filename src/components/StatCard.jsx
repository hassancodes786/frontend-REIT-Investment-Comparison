export default function StatCard({
  title,
  value,
  subtitle
}) {
  return (
    <div className="stat-card">

      <span className="stat-title">
        {title}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      {subtitle && (
        <span className="stat-subtitle">
          {subtitle}
        </span>
      )}

    </div>
  );
}