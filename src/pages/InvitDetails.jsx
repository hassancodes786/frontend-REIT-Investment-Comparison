import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getInvitById,
  getLiveInvitPrice
} from "../api/api";

const InvitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invit, setInvit] = useState(null);

  const [marketData, setMarketData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [marketLoading, setMarketLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================
  // LOAD INVIT DETAILS
  // ============================

  const loadInvit = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getInvitById(id);

      setInvit(
        response.data?.data || null
      );

    } catch (err) {
      console.error(
        "Error loading InvIT details:",
        err
      );

      setError(
        "Unable to load InvIT details. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================
  // LOAD MARKET DATA
  // ============================

  const loadMarketData = async (
    ticker
  ) => {
    try {
      setMarketLoading(true);

      if (!ticker) {
        setMarketData(null);
        return;
      }

      // MongoDB currently contains IRBIT,
      // NSE uses IRBINVIT.
      const symbol =
        ticker.toUpperCase() === "IRBIT"
          ? "IRBINVIT"
          : ticker.toUpperCase();

      const response =
        await getLiveInvitPrice(
          symbol
        );

      const data =
        response.data?.data || null;

      setMarketData(data);

    } catch (err) {
      console.error(
        "Error loading InvIT market data:",
        err
      );

      setMarketData(null);

    } finally {
      setMarketLoading(false);
    }
  };


  // ============================
  // INITIAL LOAD
  // ============================

  useEffect(() => {
    loadInvit();
  }, [id]);


  // ============================
  // LOAD MARKET AFTER INVIT
  // ============================

  useEffect(() => {
    if (invit?.ticker) {
      loadMarketData(
        invit.ticker
      );
    }
  }, [invit]);


  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#6b7280"
        }}
      >
        Loading InvIT details...
      </div>
    );
  }


  // ============================
  // ERROR
  // ============================

  if (error || !invit) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "30px",
          textAlign: "center",
          background: "#f9fafb",
          borderRadius: "15px"
        }}
      >
        <h2>
          InvIT Not Found
        </h2>

        <p
          style={{
            color: "#6b7280"
          }}
        >
          {error ||
            "The requested InvIT could not be found."}
        </p>

        <button
          onClick={() =>
            navigate("/invits")
          }
          style={{
            padding: "11px 18px",
            border: "none",
            borderRadius: "9px",
            background: "#111827",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Back to InvIT Explorer
        </button>
      </div>
    );
  }


  // ============================
  // MARKET VALUES
  // ============================

  const marketPrice =
    marketData?.price ??
    null;

  const marketChange =
    marketData?.change ??
    null;

  const marketChangePercent =
    marketData?.changePercent ??
    null;

  const previousClose =
    marketData?.previousClose ??
    null;

  const dayHigh =
    marketData?.high ??
    null;

  const dayLow =
    marketData?.low ??
    null;

  const volume =
    marketData?.volume ??
    null;

  const fiftyTwoWeekHigh =
    marketData?.fiftyTwoWeekHigh ??
    null;

  const fiftyTwoWeekLow =
    marketData?.fiftyTwoWeekLow ??
    null;

  const marketSource =
    marketData?.source ||
    "Unavailable";

  const isPositive =
    Number(marketChange) > 0;

  const isNegative =
    Number(marketChange) < 0;

  const changeColor =
    isPositive
      ? "#16a34a"
      : isNegative
      ? "#dc2626"
      : "#6b7280";

  // ============================
  // VALUE HELPERS
  // ============================

  const isMissing = (value) => {
    return (
      value === null ||
      value === undefined ||
      value === ""
    );
  };


  // ============================
  // RETURN
  // ============================

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px"
      }}
    >

      {/* ============================
          BACK BUTTON
      ============================ */}

      <button
        onClick={() =>
          navigate("/invits")
        }
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          marginBottom: "20px",
          color: "#4f46e5",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600"
        }}
      >
        ← Back to InvIT Explorer
      </button>


      {/* ============================
          HEADER
      ============================ */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "28px",
          boxShadow:
            "0 4px 15px rgba(0, 0, 0, 0.08)",
          border:
            "1px solid #e5e7eb",
          marginBottom: "20px"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap"
          }}
        >

          <div>

            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "32px",
                color: "#111827"
              }}
            >
              {invit.name}
            </h1>

            <p
              style={{
                margin: 0,
                color: "#6b7280"
              }}
            >
              NSE: {invit.ticker}
            </p>

          </div>

          <span
            style={{
              background: "#eef2ff",
              color: "#4338ca",
              padding: "8px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            InvIT
          </span>

        </div>


        {/* SECTOR */}

        <div
          style={{
            marginTop: "22px",
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "15px"
          }}
        >

          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "5px"
            }}
          >
            Infrastructure Sector
          </div>

          <div
            style={{
              fontSize: "17px",
              fontWeight: "600",
              color: "#111827"
            }}
          >
            {invit.sector}
          </div>

        </div>

      </div>


      {/* ============================
          MARKET DATA
      ============================ */}

      <section
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "22px",
          border:
            "1px solid #e5e7eb",
          marginBottom: "20px",
          boxShadow:
            "0 4px 15px rgba(0, 0, 0, 0.05)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "18px"
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "20px"
              }}
            >
              Market Data
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                fontSize: "12px",
                color: "#6b7280"
              }}
            >
              Current market information
            </p>

          </div>

          {!marketLoading && (
            <span
              style={{
                fontSize: "11px",
                padding:
                  "6px 10px",
                borderRadius:
                  "20px",
                background:
                  marketSource ===
                  "NSE MCP"
                    ? "#dcfce7"
                    : marketSource ===
                      "Yahoo Finance"
                    ? "#fef3c7"
                    : "#f3f4f6",
                color:
                  marketSource ===
                  "NSE MCP"
                    ? "#166534"
                    : marketSource ===
                      "Yahoo Finance"
                    ? "#92400e"
                    : "#6b7280"
              }}
            >
              {marketSource ===
              "NSE MCP"
                ? "🟢 NSE Market Data"
                : marketSource ===
                  "Yahoo Finance"
                ? "🟡 Yahoo Finance • Delayed"
                : "🟠 Market data unavailable"}
            </span>
          )}

        </div>


        {marketLoading ? (

          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
              background: "#f9fafb",
              borderRadius: "12px"
            }}
          >
            Loading market data...
          </div>

        ) : marketData &&
          marketPrice !== null ? (

          <>

            {/* MAIN PRICE */}

            <div
              style={{
                background:
                  "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "15px"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap: "15px",
                  flexWrap: "wrap"
                }}
              >

                <div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "5px"
                    }}
                  >
                    Current Market Price
                  </div>

                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "700",
                      color: "#111827"
                    }}
                  >
                    ₹
                    {Number(
                      marketPrice
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits:
                          2,
                        maximumFractionDigits:
                          2
                      }
                    )}
                  </div>

                </div>


                {/* CHANGE */}

                {marketChange !==
                  null && (
                  <div
                    style={{
                      textAlign:
                        "right"
                    }}
                  >

                    <div
                      style={{
                        fontSize:
                          "18px",
                        fontWeight:
                          "700",
                        color:
                          changeColor
                      }}
                    >
                      {isPositive
                        ? "▲"
                        : isNegative
                        ? "▼"
                        : "—"}{" "}
                      {Number(
                        marketChange
                      ) >= 0
                        ? "+"
                        : ""}
                      {Number(
                        marketChange
                      ).toFixed(2)}
                    </div>

                    {marketChangePercent !==
                      null && (
                      <div
                        style={{
                          fontSize:
                            "13px",
                          color:
                            changeColor,
                          marginTop:
                            "3px"
                        }}
                      >
                        {Number(
                          marketChangePercent
                        ) >= 0
                          ? "+"
                          : ""}
                        {Number(
                          marketChangePercent
                        ).toFixed(2)}
                        %
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>


            {/* MARKET METRICS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "10px"
              }}
            >

              <MarketMetric
                label="Previous Close"
                value={
                  previousClose !==
                  null
                    ? `₹${Number(
                        previousClose
                      ).toFixed(2)}`
                    : "—"
                }
              />

              <MarketMetric
                label="Day High"
                value={
                  dayHigh !== null
                    ? `₹${Number(
                        dayHigh
                      ).toFixed(2)}`
                    : "—"
                }
              />

              <MarketMetric
                label="Day Low"
                value={
                  dayLow !== null
                    ? `₹${Number(
                        dayLow
                      ).toFixed(2)}`
                    : "—"
                }
              />

              <MarketMetric
                label="Volume"
                value={
                  volume !== null
                    ? Number(
                        volume
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "—"
                }
              />

              <MarketMetric
                label="52W High"
                value={
                  fiftyTwoWeekHigh !==
                  null
                    ? `₹${Number(
                        fiftyTwoWeekHigh
                      ).toFixed(2)}`
                    : "—"
                }
              />

              <MarketMetric
                label="52W Low"
                value={
                  fiftyTwoWeekLow !==
                  null
                    ? `₹${Number(
                        fiftyTwoWeekLow
                      ).toFixed(2)}`
                    : "—"
                }
              />

            </div>

          </>

        ) : (

          <div
            style={{
              padding: "25px",
              background: "#fff7ed",
              border:
                "1px solid #fed7aa",
              borderRadius: "12px",
              color: "#9a3412",
              fontSize: "13px"
            }}
          >
            🟠 Market data is currently
            unavailable for this InvIT.
            Other InvIT information is
            still available below.
          </div>

        )}

      </section>


      {/* ============================
          KEY METRICS
      ============================ */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "20px"
        }}
      >

        <MetricCard
          label="Database Price"
          value={isMissing(invit.price) ? "N/A" : `₹${invit.price}`}
        />

        <MetricCard
          label="Distribution Yield"
          value={isMissing(invit.distributionYield) ? "N/A" : `${invit.distributionYield}%`}
        />

        <MetricCard
          label="NAV"
          value={isMissing(invit.nav) ? "N/A" : `₹${invit.nav}`}
        />

        <MetricCard
          label="AUM"
          value={isMissing(invit.aum) ? "N/A" : `₹${invit.aum}`}
        />

        <MetricCard
          label="Asset Value"
          value={isMissing(invit.assetValue) ? "N/A" : `₹${invit.assetValue}`}
        />

        <MetricCard
          label="Debt"
          value={isMissing(invit.debt) ? "N/A" : `₹${invit.debt}`}
        />

      </div>


      {/* ============================
          RETURNS + RISK
      ============================ */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}
      >

        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            border:
              "1px solid #e5e7eb"
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#111827",
              fontSize: "20px"
            }}
          >
            Performance
          </h2>

          <DetailRow
            label="1 Year Return"
            value={isMissing(invit.return1Y) ? "N/A" : `${invit.return1Y}%`}
          />

          <DetailRow
            label="3 Year Return"
            value={isMissing(invit.return3Y) ? "N/A" : `${invit.return3Y}%`}
          />

          <DetailRow
            label="5 Year Return"
            value={isMissing(invit.return5Y) ? "N/A" : `${invit.return5Y}%`}
          />

          <DetailRow
            label="Volatility"
            value={isMissing(invit.volatility) ? "N/A" : `${invit.volatility}%`}
          />

          <DetailRow
            label="Risk Score"
            value={isMissing(invit.riskScore) ? "N/A" : `${invit.riskScore}/100`}
          />

        </section>


        {/* DESCRIPTION */}

        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            border:
              "1px solid #e5e7eb"
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#111827",
              fontSize: "20px"
            }}
          >
            About this InvIT
          </h2>

          <p
            style={{
              color: "#6b7280",
              lineHeight: "1.7",
              marginBottom: 0
            }}
          >
            {invit.description ||
              "No description available."}
          </p>

        </section>

      </div>


      {/* ============================
          ASSETS / PROJECTS
      ============================ */}

      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "22px",
          border:
            "1px solid #e5e7eb",
          marginBottom: "20px"
        }}
      >

        <h2
          style={{
            marginTop: 0,
            color: "#111827",
            fontSize: "20px"
          }}
        >
          Infrastructure Assets
        </h2>

        {invit.assets &&
        invit.assets.length > 0 ? (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px"
            }}
          >

            {invit.assets.map(
              (asset, index) => (

                <div
                  key={index}
                  style={{
                    background: "#f9fafb",
                    borderRadius: "12px",
                    padding: "15px"
                  }}
                >

                  <h3
                    style={{
                      margin:
                        "0 0 7px",
                      fontSize: "15px",
                      color: "#111827"
                    }}
                  >
                    {asset.name}
                  </h3>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b7280"
                    }}
                  >
                    Type: {asset.type}
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      marginTop: "4px"
                    }}
                  >
                    Location: {asset.location}
                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <p
            style={{
              color: "#6b7280"
            }}
          >
            No infrastructure assets
            added yet.
          </p>

        )}

      </section>


      {/* ============================
          PERFORMANCE HISTORY
      ============================ */}

      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "22px",
          border:
            "1px solid #e5e7eb"
        }}
      >

        <h2
          style={{
            marginTop: 0,
            color: "#111827",
            fontSize: "20px"
          }}
        >
          Historical Performance
        </h2>

        {invit.performance &&
        invit.performance.length > 0 ? (

          <div
            style={{
              overflowX: "auto"
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >

              <thead>

                <tr>

                  <th
                    style={
                      tableHeader
                    }
                  >
                    Year
                  </th>

                  <th
                    style={
                      tableHeader
                    }
                  >
                    Return
                  </th>

                  <th
                    style={
                      tableHeader
                    }
                  >
                    Distribution
                  </th>

                </tr>

              </thead>

              <tbody>

                {invit.performance.map(
                  (item, index) => (

                    <tr
                      key={index}
                    >

                      <td
                        style={
                          tableCell
                        }
                      >
                        {item.year}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {isMissing(item.return)
                          ? "N/A"
                          : item.return}
                        %
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {isMissing(item.distribution)
                          ? "N/A"
                          : item.distribution}
                        %
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <p
            style={{
              color: "#6b7280",
              marginBottom: 0
            }}
          >
            Historical performance
            data will be added later.
          </p>

        )}

      </section>

    </div>
  );
};


// ============================
// MARKET METRIC
// ============================

const MarketMetric = ({
  label,
  value
}) => {
  return (
    <div
      style={{
        background: "#f8fafc",
        padding: "12px",
        borderRadius: "10px",
        border:
          "1px solid #e2e8f0"
      }}
    >

      <div
        style={{
          fontSize: "11px",
          color: "#64748b",
          marginBottom: "5px"
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


// ============================
// METRIC CARD
// ============================

const MetricCard = ({
  label,
  value
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "18px",
        border:
          "1px solid #e5e7eb"
      }}
    >

      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "7px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "19px",
          fontWeight: "700",
          color: "#111827"
        }}
      >
        {value}
      </div>

    </div>
  );
};


// ============================
// DETAIL ROW
// ============================

const DetailRow = ({
  label,
  value
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        padding: "11px 0",
        borderBottom:
          "1px solid #e5e7eb"
      }}
    >

      <span
        style={{
          color: "#6b7280",
          fontSize: "14px"
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: "#111827",
          fontSize: "14px"
        }}
      >
        {value}
      </strong>

    </div>
  );
};


// ============================
// TABLE STYLES
// ============================

const tableHeader = {
  textAlign: "left",
  padding: "12px",
  borderBottom:
    "2px solid #e5e7eb",
  color: "#374151",
  fontSize: "13px"
};

const tableCell = {
  padding: "12px",
  borderBottom:
    "1px solid #e5e7eb",
  color: "#6b7280",
  fontSize: "14px"
};


export default InvitDetails;