import { Link } from "react-router-dom";

export default function ReitCard({
  reit,
  onCompare,
  selected = false
}) {

  // ============================
  // MARKET PRICE
  // ============================

  const hasLivePrice =
    reit.livePrice !== undefined &&
    reit.livePrice !== null;

  const displayPrice = hasLivePrice
    ? reit.livePrice
    : reit.price;

  const currency =
    reit.liveCurrency || "INR";


  // ============================
  // MARKET CHANGE
  // ============================

  const hasMarketChange =
    reit.liveChange !== undefined &&
    reit.liveChange !== null;

  const change =
    Number(reit.liveChange || 0);

  const changePercent =
    Number(
      reit.liveChangePercent || 0
    );

  const isPositive =
    change >= 0;


  // ============================
  // MARKET SOURCE
  // ============================

  const marketSource =
    reit.marketSource || null;

  const marketDelayed =
    reit.marketDelayed === true;


  const getMarketSourceLabel = () => {

    if (
      marketSource === "NSE MCP"
    ) {
      return "NSE Market Data • ~1–3 min delayed";
    }

    if (
      marketSource === "Yahoo Finance"
    ) {
      return "Yahoo Finance • Delayed";
    }

    if (marketSource) {
      return marketDelayed
        ? `${marketSource} • Delayed`
        : marketSource;
    }

    return "Market data";
  };


  // ============================
  // HELPERS
  // ============================

  const formatNumber = (value) => {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "—";
    }

    return Number(value).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  };


  const formatVolume = (value) => {

    if (
      value === undefined ||
      value === null
    ) {
      return "—";
    }

    return Number(value).toLocaleString(
      "en-IN"
    );

  };


  // ============================
  // TIMESTAMP
  // ============================

  const marketTimestamp =
    reit.liveTimestamp ||
    reit.liveUpdatedAt ||
    null;


  const formattedTimestamp =
    marketTimestamp
      ? new Date(
          marketTimestamp
        ).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : null;


  return (
    <article
      className={`reit-card ${
        selected ? "selected" : ""
      }`}
    >

      {/* =========================
          CARD HEADER
      ========================= */}

      <div className="card-header">

        <div>

          <span className="ticker">
            {reit.ticker}
          </span>

          <h3>
            {reit.name}
          </h3>

        </div>


        {onCompare && (

          <input
            type="checkbox"
            checked={selected}
            onChange={() =>
              onCompare(reit)
            }
          />

        )}

      </div>


      {/* =========================
          MARKET PRICE
      ========================= */}

      <div className="reit-price">

        {currency === "USD"
          ? "$"
          : "₹"}

        {formatNumber(displayPrice)}

      </div>


      {/* =========================
          MARKET CHANGE + SOURCE
      ========================= */}

      {hasMarketChange && (

        <div
          style={{
            marginTop: "-8px",
            marginBottom: "12px",
            fontSize: "14px"
          }}
        >

          <strong
            style={{
              fontWeight: "600"
            }}
          >

            {isPositive
              ? "▲"
              : "▼"}{" "}

            {isPositive
              ? "+"
              : ""}

            {change.toFixed(2)}

            {" "}(

            {isPositive
              ? "+"
              : ""}

            {changePercent.toFixed(2)}

            %)

          </strong>


          {/* =========================
              DYNAMIC MARKET SOURCE
          ========================= */}

          <div
            style={{
              fontSize: "11px",
              opacity: 0.65,
              marginTop: "4px"
            }}
          >

            {getMarketSourceLabel()}

            {reit.marketSymbol
              ? ` • ${reit.marketSymbol}`
              : ""}

          </div>

        </div>

      )}


      {/* =========================
          MARKET DETAILS
      ========================= */}

      {hasLivePrice && (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "8px",
            marginBottom: "16px",
            padding: "10px",
            borderRadius: "10px",
            background:
              "rgba(0, 0, 0, 0.025)",
            fontSize: "11px"
          }}
        >

          {/* VOLUME */}

          <div>

            <span
              style={{
                display: "block",
                opacity: 0.6
              }}
            >
              Volume
            </span>

            <strong>
              {formatVolume(
                reit.liveVolume
              )}
            </strong>

          </div>


          {/* DAY HIGH */}

          <div>

            <span
              style={{
                display: "block",
                opacity: 0.6
              }}
            >
              Day High
            </span>

            <strong>
              ₹
              {formatNumber(
                reit.liveHigh
              )}
            </strong>

          </div>


          {/* DAY LOW */}

          <div>

            <span
              style={{
                display: "block",
                opacity: 0.6
              }}
            >
              Day Low
            </span>

            <strong>
              ₹
              {formatNumber(
                reit.liveLow
              )}
            </strong>

          </div>


          {/* 52 WEEK HIGH */}

          <div>

            <span
              style={{
                display: "block",
                opacity: 0.6
              }}
            >
              52W High
            </span>

            <strong>
              ₹
              {formatNumber(
                reit.live52WeekHigh
              )}
            </strong>

          </div>


          {/* 52 WEEK LOW */}

          <div>

            <span
              style={{
                display: "block",
                opacity: 0.6
              }}
            >
              52W Low
            </span>

            <strong>
              ₹
              {formatNumber(
                reit.live52WeekLow
              )}
            </strong>

          </div>


          {/* PREVIOUS CLOSE */}

          <div>

            <span
              style={{
                display: "block",
                opacity: 0.6
              }}
            >
              Previous Close
            </span>

            <strong>
              ₹
              {formatNumber(
                reit.livePreviousClose
              )}
            </strong>

          </div>

        </div>

      )}


      {/* =========================
          MARKET TIMESTAMP
      ========================= */}

      {formattedTimestamp && (

        <div
          style={{
            textAlign: "center",
            fontSize: "10px",
            opacity: 0.55,
            marginBottom: "14px"
          }}
        >

          {marketSource === "NSE MCP"
            ? "NSE data"
            : marketSource === "Yahoo Finance"
            ? "Yahoo Finance data"
            : "Market data"}

          :
          {" "}
          {formattedTimestamp}

        </div>

      )}


      {/* =========================
          REIT METRICS
      ========================= */}

      <div className="reit-metrics">

        <div>

          <span>
            1Y Return
          </span>

          <strong className="positive">
            +{reit.return1Y}%
          </strong>

        </div>


        <div>

          <span>
            Dividend
          </span>

          <strong>
            {reit.dividendYield}%
          </strong>

        </div>


        <div>

          <span>
            Occupancy
          </span>

          <strong>
            {reit.occupancy}%
          </strong>

        </div>


        <div>

          <span>
            Risk
          </span>

          <strong>
            {reit.riskScore}/10
          </strong>

        </div>

      </div>


      {/* =========================
          ACTIONS
      ========================= */}

      <div className="card-actions">

        <Link
          to={`/reits/${reit._id || reit.id}`}
          className="button secondary"
        >
          View Details
        </Link>


        {onCompare && (

          <button
            className="button"
            onClick={() =>
              onCompare(reit)
            }
          >
            {selected
              ? "Remove"
              : "Compare"}
          </button>

        )}

      </div>

    </article>
  );
}