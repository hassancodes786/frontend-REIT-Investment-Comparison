import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getReitById,
  getLiveReitPrice
} from "../api/api";

export default function ReitDetails() {

  const { id } = useParams();

  const [reit, setReit] = useState(null);

  const [marketData, setMarketData] =
    useState(null);

  const [marketSource, setMarketSource] =
    useState(null);

  const [marketDelayed, setMarketDelayed] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [marketLoading, setMarketLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ============================
  // LOAD REIT FROM MONGODB
  // ============================

  const fetchReit = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getReitById(id);

      const data =
        response.data?.data;

      setReit(data);

    } catch (err) {

      console.error(
        "REIT Details Error:",
        err
      );

      setError(
        "Unable to load REIT details."
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================
  // LOAD MARKET DATA
  // NSE PRIMARY
  // YAHOO FALLBACK
  // ============================

  const fetchMarketData = async (
    currentReit
  ) => {

    if (!currentReit) {
      return;
    }

    try {

      setMarketLoading(true);

      // ============================
      // APPLICATION TICKER → NSE SYMBOL
      // ============================

      const symbolMap = {

        BROOKFIELD: "BIRET",

        BIRET: "BIRET",

        EMBASSY: "EMBASSY",

        MINDSPACE: "MINDSPACE",

        NEXUS: "NXST",

        NXST: "NXST"

      };


      const ticker =
        String(
          currentReit.ticker || ""
        ).toUpperCase();


      const symbol =
        symbolMap[ticker] ||
        ticker;


      if (!symbol) {
        return;
      }


      // ============================
      // CALL BACKEND MARKET API
      // ============================

      const response =
        await getLiveReitPrice(
          symbol
        );


      if (
        response.data?.success &&
        response.data?.data
      ) {

        setMarketData(
          response.data.data
        );

        // ============================
        // SOURCE
        // ============================

        setMarketSource(
          response.data?.source ||
          response.data.data?.source ||
          "Market Data"
        );


        // ============================
        // DELAY STATUS
        // ============================

        setMarketDelayed(
          response.data?.delayed === true
        );

      } else {

        setMarketData(null);
        setMarketSource(null);
        setMarketDelayed(false);

      }

    } catch (err) {

      console.error(
        "Market Data Error:",
        err
      );

      // Keep REIT/MongoDB details
      // even if market API fails.

      setMarketData(null);
      setMarketSource(null);
      setMarketDelayed(false);

    } finally {

      setMarketLoading(false);

    }

  };


  // ============================
  // INITIAL LOAD
  // ============================

  useEffect(() => {

    if (id) {
      fetchReit();
    }

  }, [id]);


  // ============================
  // LOAD MARKET DATA
  // AFTER REIT LOAD
  // ============================

  useEffect(() => {

    if (reit) {

      fetchMarketData(
        reit
      );

    }

  }, [reit]);


  // ============================
  // AUTO REFRESH
  // EVERY 60 SECONDS
  // ============================

  useEffect(() => {

    if (!reit) {
      return;
    }


    const interval =
      setInterval(() => {

        fetchMarketData(
          reit
        );

      }, 60000);


    return () => {

      clearInterval(
        interval
      );

    };

  }, [reit]);


  // ============================
  // LOADING
  // ============================

  if (loading) {

    return (
      <div className="empty">

        <h2>
          Loading REIT...
        </h2>

        <p>
          Fetching REIT details
          from MongoDB.
        </p>

      </div>
    );

  }


  // ============================
  // ERROR
  // ============================

  if (error || !reit) {

    return (
      <div className="empty">

        <h2>
          REIT not found
        </h2>

        <p>
          {error ||
            "The requested REIT could not be found."}
        </p>

        <Link
          to="/reits"
          className="button"
        >
          ← Back to REIT Explorer
        </Link>

      </div>
    );

  }


  // ============================
  // MARKET VALUES
  // ============================

  const hasMarketData =
    marketData &&
    marketData.price !== null &&
    marketData.price !== undefined;


  const currentPrice =
    hasMarketData
      ? marketData.price
      : reit.price;


  const change =
    Number(
      marketData?.change || 0
    );


  const changePercent =
    Number(
      marketData?.changePercent || 0
    );


  const isPositive =
    change >= 0;


  // ============================
  // MARKET SOURCE LABEL
  // ============================

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

    return "Using database price";

  };


  // ============================
  // FORMAT NUMBER
  // ============================

  const formatNumber = (
    value
  ) => {

    if (
      value === null ||
      value === undefined ||
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


  // ============================
  // FORMAT VOLUME
  // ============================

  const formatVolume = (
    value
  ) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return Number(value).toLocaleString(
      "en-IN"
    );

  };


  // ============================
  // MARKET TIMESTAMP
  // ============================

  const marketTimestamp =
    marketData?.latestTimestamp ||
    marketData?.updatedAt ||
    null;


  const formattedTimestamp =
    marketTimestamp
      ? new Date(
          marketTimestamp
        ).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }
        )
      : null;


  return (

    <div className="reit-details">


      {/* =========================
          BACK
      ========================= */}

      <Link
        to="/reits"
        className="back-link"
      >
        ← Back to REIT Explorer
      </Link>


      {/* =========================
          HEADING
      ========================= */}

      <section className="page-heading">

        <span className="eyebrow">
          {reit.ticker}
        </span>

        <h1>
          {reit.name}
        </h1>

        <p>
          {reit.description}
        </p>

      </section>


      {/* =========================
          MARKET DATA
      ========================= */}

      <section
        className="detail-section"
        style={{
          marginBottom: "24px"
        }}
      >

        {/* =========================
            MARKET HEADER
        ========================= */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}
        >

          <div>

            <span
              className="eyebrow"
            >
              MARKET DATA
            </span>

            <h2
              style={{
                marginBottom: "4px"
              }}
            >
              Latest Market Information
            </h2>

          </div>


          {/* =========================
              SOURCE STATUS
          ========================= */}

          <div
            style={{
              fontSize: "13px",
              opacity: 0.75
            }}
          >

            {marketLoading

              ? "🟡 Updating market data..."

              : hasMarketData

              ? `🟢 ${getMarketSourceLabel()}`

              : "🟠 Using database price"

            }

          </div>

        </div>


        {/* =========================
            PRICE + CHANGE
        ========================= */}

        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background:
              "rgba(0, 0, 0, 0.025)",
            marginBottom: "16px"
          }}
        >

          <span
            style={{
              display: "block",
              fontSize: "13px",
              opacity: 0.65,
              marginBottom: "5px"
            }}
          >
            Current Price
          </span>


          <strong
            style={{
              fontSize: "32px",
              display: "block"
            }}
          >

            ₹
            {formatNumber(
              currentPrice
            )}

          </strong>


          {/* =========================
              CHANGE
          ========================= */}

          {hasMarketData && (

            <div
              style={{
                marginTop: "8px",
                fontSize: "14px"
              }}
            >

              <strong>

                {isPositive
                  ? "▲"
                  : "▼"}{" "}

                {isPositive
                  ? "+"
                  : ""}

                {change.toFixed(2)}

                {" "} (

                {isPositive
                  ? "+"
                  : ""}

                {changePercent.toFixed(2)}

                %)

              </strong>

            </div>

          )}

        </div>


        {/* =========================
            MARKET SOURCE INFO
        ========================= */}

        {hasMarketData && (

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "16px",
              fontSize: "12px",
              opacity: 0.65
            }}
          >

            <span>
              Source:{" "}
              {getMarketSourceLabel()}
            </span>

            {marketData.symbol && (
              <span>
                Symbol:{" "}
                {marketData.symbol}
              </span>
            )}

          </div>

        )}


        {/* =========================
            MARKET METRICS
        ========================= */}

        {hasMarketData && (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px"
            }}
          >

            {/* PREVIOUS CLOSE */}

            <div className="metric-card">

              <span>
                Previous Close
              </span>

              <strong>
                ₹
                {formatNumber(
                  marketData.previousClose
                )}
              </strong>

            </div>


            {/* DAY HIGH */}

            <div className="metric-card">

              <span>
                Day High
              </span>

              <strong>
                ₹
                {formatNumber(
                  marketData.high
                )}
              </strong>

            </div>


            {/* DAY LOW */}

            <div className="metric-card">

              <span>
                Day Low
              </span>

              <strong>
                ₹
                {formatNumber(
                  marketData.low
                )}
              </strong>

            </div>


            {/* VOLUME */}

            <div className="metric-card">

              <span>
                Volume
              </span>

              <strong>
                {formatVolume(
                  marketData.volume
                )}
              </strong>

            </div>


            {/* 52 WEEK HIGH */}

            <div className="metric-card">

              <span>
                52W High
              </span>

              <strong>
                ₹
                {formatNumber(
                  marketData.fiftyTwoWeekHigh
                )}
              </strong>

            </div>


            {/* 52 WEEK LOW */}

            <div className="metric-card">

              <span>
                52W Low
              </span>

              <strong>
                ₹
                {formatNumber(
                  marketData.fiftyTwoWeekLow
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
              textAlign: "right",
              fontSize: "10px",
              opacity: 0.55,
              marginTop: "12px"
            }}
          >

            Market data timestamp:
            {" "}
            {formattedTimestamp}

          </div>

        )}

      </section>


      {/* =========================
          REIT STATS
      ========================= */}

      <section className="reit-stats-grid">

        {/* CURRENT PRICE */}

        <div className="metric-card">

          <span>
            Current Price
          </span>

          <strong>
            ₹
            {formatNumber(
              currentPrice
            )}
          </strong>

        </div>


        {/* 1Y RETURN */}

        <div className="metric-card">

          <span>
            1Y Return
          </span>

          <strong>
            +{reit.return1Y}%
          </strong>

        </div>


        {/* 3Y RETURN */}

        <div className="metric-card">

          <span>
            3Y Return
          </span>

          <strong>
            +{reit.return3Y}%
          </strong>

        </div>


        {/* 5Y RETURN */}

        <div className="metric-card">

          <span>
            5Y Return
          </span>

          <strong>
            +{reit.return5Y}%
          </strong>

        </div>


        {/* DIVIDEND */}

        <div className="metric-card">

          <span>
            Dividend Yield
          </span>

          <strong>
            {reit.dividendYield}%
          </strong>

        </div>


        {/* OCCUPANCY */}

        <div className="metric-card">

          <span>
            Occupancy
          </span>

          <strong>
            {reit.occupancy}%
          </strong>

        </div>


        {/* VOLATILITY */}

        <div className="metric-card">

          <span>
            Volatility
          </span>

          <strong>
            {reit.volatility}%
          </strong>

        </div>


        {/* RISK */}

        <div className="metric-card">

          <span>
            Risk Score
          </span>

          <strong>
            {reit.riskScore}/10
          </strong>

        </div>

      </section>


      {/* =========================
          REIT INFORMATION
      ========================= */}

      <section className="detail-section">

        <h2>
          REIT Information
        </h2>


        <div className="info-grid">

          {/* TICKER */}

          <div>

            <span>
              Ticker
            </span>

            <strong>
              {reit.ticker}
            </strong>

          </div>


          {/* SECTOR */}

          <div>

            <span>
              Sector
            </span>

            <strong>
              {reit.sector}
            </strong>

          </div>


          {/* MARKET CAP */}

          <div>

            <span>
              Market Cap
            </span>

            <strong>
              ₹
              {Number(
                reit.marketCap || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          {/* ANNUAL DISTRIBUTION */}

          <div>

            <span>
              Annual Distribution
            </span>

            <strong>
              ₹
              {reit.annualDistribution}
            </strong>

          </div>


          {/* DEBT */}

          <div>

            <span>
              Debt
            </span>

            <strong>
              ₹
              {Number(
                reit.debt || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          {/* DIVIDEND */}

          <div>

            <span>
              Dividend Yield
            </span>

            <strong>
              {reit.dividendYield}%
            </strong>

          </div>

        </div>

      </section>


      {/* =========================
          HISTORICAL PERFORMANCE
      ========================= */}

      <section className="detail-section">

        <h2>
          Historical Performance
        </h2>


        <div className="performance-table">

          <div className="performance-header">

            <span>
              Year
            </span>

            <span>
              Return
            </span>

            <span>
              Distribution
            </span>

          </div>


          {reit.performance &&
            reit.performance.map(
              (item, index) => (

                <div
                  className="performance-row"
                  key={index}
                >

                  <span>
                    {item.year}
                  </span>

                  <strong>
                    +{item.return}%
                  </strong>

                  <span>
                    ₹
                    {item.dividend}
                  </span>

                </div>

              )
            )}

        </div>

      </section>


      {/* =========================
          INVESTMENT CTA
      ========================= */}

      <section className="investment-cta">

        <div>

          <span className="eyebrow">
            INVESTMENT ANALYSIS
          </span>

          <h2>
            Evaluate {reit.name}
          </h2>

          <p>
            Compare this REIT with other
            available investment opportunities.
          </p>

        </div>


        <Link
          to="/compare"
          className="button"
        >
          Compare REIT →
        </Link>

      </section>


    </div>
  );
}