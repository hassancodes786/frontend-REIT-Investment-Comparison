const InvitCard = ({
  invit,
  marketData,
  onViewDetails,
  onCompare,
  selected = false
}) => {
  // ============================
  // MARKET DATA
  // ============================

  const price =
    marketData?.price ??
    null;

  const change =
    marketData?.change ??
    null;

  const changePercent =
    marketData?.changePercent ??
    null;

  const hasMarketPrice =
    price !== null &&
    price !== undefined;

  const hasChange =
    change !== null &&
    change !== undefined;

  const isPositive =
    Number(change) > 0;

  const isNegative =
    Number(change) < 0;

  const changeColor =
    isPositive
      ? "#16a34a"
      : isNegative
      ? "#dc2626"
      : "#6b7280";

  const source =
    marketData?.source ||
    "Unavailable";

  const isYahoo =
    source === "Yahoo Finance";

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow:
          "0 4px 15px rgba(0, 0, 0, 0.08)",
        border:
          "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}
    >

      {/* ============================
          HEADER
      ============================ */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px"
        }}
      >
        <div>

          <h3
            style={{
              margin: "0 0 5px",
              fontSize: "20px",
              color: "#111827"
            }}
          >
            {invit.name}
          </h3>

          <div
            style={{
              fontSize: "13px",
              color: "#6b7280"
            }}
          >
            NSE: {invit.ticker}
          </div>

        </div>

        <span
          style={{
            background: "#eef2ff",
            color: "#4338ca",
            padding: "6px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            whiteSpace: "nowrap"
          }}
        >
          InvIT
        </span>

      </div>


      {/* ============================
          MARKET DATA
      ============================ */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #f8fafc, #f1f5f9)",
          padding: "14px",
          borderRadius: "12px",
          border:
            "1px solid #e2e8f0"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: "10px"
          }}
        >

          <div>

            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "5px",
                fontWeight: "500"
              }}
            >
              Current Market Price
            </div>

            {hasMarketPrice ? (
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#111827"
                }}
              >
                ₹
                {Number(price).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }
                )}
              </div>
            ) : (
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#9ca3af"
                }}
              >
                Market data unavailable
              </div>
            )}

          </div>


          {/* CHANGE */}

          {hasChange && (
            <div
              style={{
                textAlign: "right"
              }}
            >

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: changeColor
                }}
              >
                {isPositive
                  ? "▲"
                  : isNegative
                  ? "▼"
                  : "—"}{" "}
                {Number(change) >= 0
                  ? "+"
                  : ""}
                {Number(change).toFixed(2)}
              </div>

              {changePercent !==
                null &&
                changePercent !==
                  undefined && (
                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        changeColor,
                      marginTop: "2px"
                    }}
                  >
                    {Number(
                      changePercent
                    ) >= 0
                      ? "+"
                      : ""}
                    {Number(
                      changePercent
                    ).toFixed(2)}
                    %
                  </div>
                )}

            </div>
          )}

        </div>


        {/* SOURCE */}

        <div
          style={{
            marginTop: "10px",
            paddingTop: "9px",
            borderTop:
              "1px solid #e2e8f0",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <span
            style={{
              fontSize: "11px",
              color:
                source ===
                "NSE MCP"
                  ? "#15803d"
                  : isYahoo
                  ? "#a16207"
                  : "#6b7280"
            }}
          >
            {source ===
            "NSE MCP"
              ? "🟢 NSE Market Data"
              : isYahoo
              ? "🟡 Yahoo Finance"
              : "🟠 Market data unavailable"}
          </span>

          {marketData &&
            source !==
              "Unavailable" && (
              <span
                style={{
                  fontSize: "10px",
                  color: "#64748b"
                }}
              >
                {marketData.delayed
                  ? "Delayed"
                  : "Market data"}
              </span>
            )}

        </div>

      </div>


      {/* ============================
          SECTOR
      ============================ */}

      <div
        style={{
          background: "#f9fafb",
          padding: "10px 12px",
          borderRadius: "10px"
        }}
      >

        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "3px"
          }}
        >
          Infrastructure Sector
        </div>

        <div
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#111827"
          }}
        >
          {invit.sector}
        </div>

      </div>


      {/* ============================
          METRICS
      ============================ */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, 1fr)",
          gap: "10px"
        }}
      >

        <Metric
          label="Distribution Yield"
          value={`${invit.distributionYield || 0}%`}
        />

        <Metric
          label="NAV"
          value={
            invit.nav
              ? `₹${invit.nav.toLocaleString(
                  "en-IN"
                )}`
              : "₹0"
          }
        />

        <Metric
          label="AUM"
          value={
            invit.aum
              ? `₹${invit.aum.toLocaleString(
                  "en-IN"
                )}`
              : "₹0"
          }
        />

        <Metric
          label="Debt"
          value={
            invit.debt
              ? `₹${invit.debt.toLocaleString(
                  "en-IN"
                )}`
              : "₹0"
          }
        />

      </div>


      {/* ============================
          RISK
      ============================ */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          padding: "10px 0",
          borderTop:
            "1px solid #e5e7eb",
          borderBottom:
            "1px solid #e5e7eb"
        }}
      >

        <span
          style={{
            fontSize: "14px",
            color: "#6b7280"
          }}
        >
          Risk Score
        </span>

        <strong
          style={{
            fontSize: "16px",
            color: "#111827"
          }}
        >
          {invit.riskScore || 0}/100
        </strong>

      </div>


      {/* ============================
          DESCRIPTION
      ============================ */}

      {invit.description && (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            lineHeight: "1.5",
            color: "#6b7280"
          }}
        >
          {invit.description}
        </p>
      )}


      {/* ============================
          BUTTON
      ============================ */}

      <button
        onClick={() =>
          onCompare
            ? onCompare(invit)
            : onViewDetails(invit._id)
        }
        style={{
          width: "100%",
          padding: "11px 15px",
          border: "none",
          borderRadius: "10px",
          background: onCompare
            ? (selected ? "#dc2626" : "#111827")
            : "#111827",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer"
        }}
      >
        {onCompare
          ? selected
            ? "Remove from Compare"
            : "Add to Compare"
          : "View Details"}
      </button>

    </div>
  );
};


// ============================
// METRIC COMPONENT
// ============================

const Metric = ({
  label,
  value
}) => {
  return (
    <div
      style={{
        background: "#f9fafb",
        padding: "10px",
        borderRadius: "10px"
      }}
    >

      <div
        style={{
          fontSize: "11px",
          color: "#6b7280",
          marginBottom: "4px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#111827"
        }}
      >
        {value}
      </div>

    </div>
  );
};

export default InvitCard;