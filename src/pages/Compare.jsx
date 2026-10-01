import {
  useEffect,
  useMemo,
  useState
} from "react";

import ReitCard from "../components/ReitCard";
import InvitCard from "../components/InvitCard";

import {
  getReits,
  getLiveReitPrice,
  getInvits,
  getLiveInvitPrice
} from "../api/api";


// =====================================
// CALCULATE REIT SCORE
// =====================================

function calculateScore(investment, weights) {
  const return1Y = Number(investment.return1Y) || 0;
  const return5Y = Number(investment.return5Y) || 0;
  const distributionYield = Number(
    investment.investmentType === "InvIT"
      ? investment.distributionYield
      : investment.dividendYield
  ) || 0;

  const returnScore = Math.min(return1Y / 20, 1) * 100;
  const dividendScore = Math.min(distributionYield / 10, 1) * 100;
  const occupancyScore = Number(investment.occupancy) || 0;

  const marketCap = Number(investment.marketCap) || 0;
  const debt = Number(investment.debt) || 0;
  const debtRatio = marketCap ? debt / marketCap : 0;
  const debtScore = Math.max(0, 100 - debtRatio * 100);

  const riskValue = Number(investment.riskScore);
  const riskScore = Number.isFinite(riskValue)
    ? 100 - riskValue * 10
    : 0;

  const growthScore = Math.min(return5Y / 60, 1) * 100;

  const totalWeight =
    weights.returns +
    weights.dividend +
    weights.occupancy +
    weights.debt +
    weights.risk +
    weights.growth;

  if (totalWeight === 0) return 0;

  return (
    (returnScore * weights.returns +
      dividendScore * weights.dividend +
      occupancyScore * weights.occupancy +
      debtScore * weights.debt +
      riskScore * weights.risk +
      growthScore * weights.growth) /
    totalWeight
  );
}


// =====================================
// COMPARE PAGE
// =====================================

export default function Compare() {

  const [reits, setReits] =
    useState([]);

  const [invits, setInvits] = useState([]);

  const [investmentType, setInvestmentType] = useState("REIT");


  const [selected, setSelected] =
    useState([]);


  const [weights, setWeights] =
    useState({

      returns: 30,

      dividend: 20,

      occupancy: 15,

      debt: 15,

      risk: 10,

      growth: 10

    });


  const [loading, setLoading] =
    useState(true);


  const [marketLoading, setMarketLoading] =
    useState(false);


  const [lastMarketUpdate, setLastMarketUpdate] =
    useState(null);


  const [error, setError] =
    useState("");


  // =====================================
  // LOAD REITS + INVITS FROM MONGODB
  // =====================================

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        setError("");

        const [reitResponse, invitResponse] = await Promise.all([
          getReits(),
          getInvits()
        ]);

        const reitData = reitResponse.data?.data || [];
        const invitData = invitResponse.data?.data || [];

        const formattedReits = reitData.map((reit) => ({
          ...reit,
          investmentType: "REIT",
          id: reit._id,
          livePrice: null,
          liveChange: null,
          liveChangePercent: null,
          livePreviousClose: null,
          liveVolume: null,
          liveHigh: null,
          liveLow: null,
          live52WeekHigh: null,
          live52WeekLow: null,
          liveTimestamp: null,
          liveUpdatedAt: null,
          marketSource: null,
          marketDelayed: false,
          marketSymbol: null
        }));

        const formattedInvits = invitData.map((invit) => ({
          ...invit,
          investmentType: "InvIT",
          id: invit._id,
          livePrice: null,
          liveChange: null,
          liveChangePercent: null,
          livePreviousClose: null,
          liveVolume: null,
          liveHigh: null,
          liveLow: null,
          live52WeekHigh: null,
          live52WeekLow: null,
          liveTimestamp: null,
          liveUpdatedAt: null,
          marketSource: null,
          marketDelayed: false,
          marketSymbol: null
        }));

        setReits(formattedReits);
        setInvits(formattedInvits);
      } catch (err) {
        console.error("Compare investment API Error:", err);
        setError("Unable to load investment data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);


  // =====================================
  // LOAD LIVE MARKET DATA
  // =====================================

  useEffect(() => {
    const investments = investmentType === "REIT" ? reits : invits;
    if (investments.length === 0) return;

    const loadMarketPrices = async () => {
      try {
        setMarketLoading(true);

        const updated = await Promise.all(
          investments.map(async (investment) => {
            try {
              let symbol;

              if (investment.investmentType === "InvIT") {
                const ticker = String(investment.ticker || "").toUpperCase();
                symbol = ticker === "IRBIT" ? "IRBINVIT" : ticker;
              } else {
                const symbolMap = {
                  BROOKFIELD: "BIRET",
                  BIRET: "BIRET",
                  EMBASSY: "EMBASSY",
                  MINDSPACE: "MINDSPACE",
                  NEXUS: "NXST",
                  NXST: "NXST"
                };
                symbol = symbolMap[String(investment.ticker || "").toUpperCase()] ||
                  String(investment.ticker || "").toUpperCase();
              }

              if (!symbol) return investment;

              const response = investment.investmentType === "InvIT"
                ? await getLiveInvitPrice(symbol)
                : await getLiveReitPrice(symbol);

              const marketData = response.data?.data;

              if (response.data?.success && marketData) {
                return {
                  ...investment,
                  livePrice: marketData.price,
                  liveChange: marketData.change,
                  liveChangePercent: marketData.changePercent,
                  livePreviousClose: marketData.previousClose,
                  liveVolume: marketData.volume,
                  liveHigh: marketData.high,
                  liveLow: marketData.low,
                  live52WeekHigh: marketData.fiftyTwoWeekHigh,
                  live52WeekLow: marketData.fiftyTwoWeekLow,
                  liveTimestamp: marketData.latestTimestamp,
                  liveUpdatedAt: marketData.updatedAt,
                  marketSource: response.data?.source || marketData.source || "Market Data",
                  marketDelayed: response.data?.delayed === true,
                  marketSymbol: symbol
                };
              }

              return investment;
            } catch (err) {
              console.error(`Market data error for ${investment.ticker}:`, err);
              return investment;
            }
          })
        );

        if (investmentType === "REIT") setReits(updated);
        else setInvits(updated);

        setLastMarketUpdate(new Date());
      } catch (err) {
        console.error("Compare Market Data Error:", err);
      } finally {
        setMarketLoading(false);
      }
    };

    loadMarketPrices();
  }, [investmentType, reits.length, invits.length]);

  // =====================================
  // AUTO REFRESH MARKET DATA
  // EVERY 60 SECONDS
  // =====================================

  useEffect(() => {
    const investments = investmentType === "REIT" ? reits : invits;
    if (investments.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updated = await Promise.all(
          investments.map(async (investment) => {
            try {
              let symbol;
              if (investment.investmentType === "InvIT") {
                const ticker = String(investment.ticker || "").toUpperCase();
                symbol = ticker === "IRBIT" ? "IRBINVIT" : ticker;
              } else {
                const symbolMap = {
                  BROOKFIELD: "BIRET",
                  BIRET: "BIRET",
                  EMBASSY: "EMBASSY",
                  MINDSPACE: "MINDSPACE",
                  NEXUS: "NXST",
                  NXST: "NXST"
                };
                symbol = symbolMap[String(investment.ticker || "").toUpperCase()] ||
                  String(investment.ticker || "").toUpperCase();
              }

              const response = investment.investmentType === "InvIT"
                ? await getLiveInvitPrice(symbol)
                : await getLiveReitPrice(symbol);
              const marketData = response.data?.data;

              if (response.data?.success && marketData) {
                return {
                  ...investment,
                  livePrice: marketData.price,
                  liveChange: marketData.change,
                  liveChangePercent: marketData.changePercent,
                  livePreviousClose: marketData.previousClose,
                  liveVolume: marketData.volume,
                  liveHigh: marketData.high,
                  liveLow: marketData.low,
                  live52WeekHigh: marketData.fiftyTwoWeekHigh,
                  live52WeekLow: marketData.fiftyTwoWeekLow,
                  liveTimestamp: marketData.latestTimestamp,
                  liveUpdatedAt: marketData.updatedAt,
                  marketSource: response.data?.source || marketData.source || "Market Data",
                  marketDelayed: response.data?.delayed === true,
                  marketSymbol: symbol
                };
              }
              return investment;
            } catch {
              return investment;
            }
          })
        );

        if (investmentType === "REIT") setReits(updated);
        else setInvits(updated);
        setLastMarketUpdate(new Date());
      } catch (err) {
        console.error("Compare refresh error:", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [investmentType, reits.length, invits.length]);



  // =====================================
  // SELECT / REMOVE INVESTMENT
  // =====================================

  function handleCompare(
    reit
  ) {

    setSelected(
      (current) => {

        const exists =
          current.some(
            (item) =>
              item._id ===
              reit._id
          );


        if (exists) {

          return current.filter(
            (item) =>
              item._id !==
              reit._id
          );

        }


        if (
          current.length >= 4
        ) {

          alert(
            "You can compare maximum 4 investments."
          );

          return current;

        }


        return [
          ...current,
          reit
        ];

      }
    );

  }


  // =====================================
  // CALCULATE SCORES
  // =====================================

  const scoredReits =
    useMemo(() => {

      return selected

        .map(
          (reit) => ({

            ...reit,

            score:
              calculateScore(
                reit,
                weights
              )

          })
        )

        .sort(
          (a, b) =>
            b.score -
            a.score
        );

    }, [
      selected,
      weights
    ]);


  // =====================================
  // TOTAL WEIGHT
  // =====================================

  const totalWeight =
    Object.values(
      weights
    ).reduce(
      (sum, value) =>
        sum +
        Number(value),
      0
    );


  // =====================================
  // HELPERS
  // =====================================

  const formatNumber = (
    value
  ) => {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "—";
    }


    return Number(
      value
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  };


  const formatVolume = (
    value
  ) => {

    if (
      value === undefined ||
      value === null
    ) {
      return "—";
    }


    return Number(
      value
    ).toLocaleString(
      "en-IN"
    );

  };


  const getMarketSourceLabel =
    (reit) => {

      if (
        reit.marketSource ===
        "NSE MCP"
      ) {

        return (
          "NSE Market Data • ~1–3 min delayed"
        );

      }


      if (
        reit.marketSource ===
        "Yahoo Finance"
      ) {

        return (
          "Yahoo Finance • Delayed"
        );

      }


      if (
        reit.marketSource
      ) {

        return reit.marketDelayed
          ? `${reit.marketSource} • Delayed`
          : reit.marketSource;

      }


      return "Market data unavailable";

    };


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="empty">

        <h2>
          Loading REITs...
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
          Unable to Load Investments
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
  // PAGE
  // =====================================

  return (

    <div>


      {/* =================================
          PAGE HEADING
      ================================= */}

      <section className="page-heading">

        <span className="eyebrow">
          DECISION TOOL
        </span>

        <h1>
          Compare Investments
        </h1>

        <p>
          Select up to four investments
          and compare their
          investment characteristics.
        </p>

      </section>


      {/* =================================
          MARKET STATUS
      ================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "20px"
        }}
      >

        <div
          style={{
            fontSize: "14px"
          }}
        >

          {marketLoading

            ? "🟡 Updating market data..."

            : (investmentType === "REIT" ? reits : invits).some(
                (reit) =>
                  reit.marketSource ===
                  "NSE MCP"
              ) &&
              (investmentType === "REIT" ? reits : invits).some(
                (reit) =>
                  reit.marketSource ===
                  "Yahoo Finance"
              )

            ? "🟢 NSE Market Data + Yahoo Finance fallback"

            : (investmentType === "REIT" ? reits : invits).some(
                (reit) =>
                  reit.marketSource ===
                  "NSE MCP"
              )

            ? "🟢 NSE Market Data • ~1–3 min delayed"

            : (investmentType === "REIT" ? reits : invits).some(
                (reit) =>
                  reit.marketSource ===
                  "Yahoo Finance"
              )

            ? "🟡 Yahoo Finance • Delayed"

            : "🟠 Market data unavailable"

          }

        </div>


        <div
          style={{
            fontSize: "13px",
            opacity: 0.7
          }}
        >

          {lastMarketUpdate
            ? `Last checked: ${lastMarketUpdate.toLocaleTimeString()}`
            : "Fetching market data..."}

        </div>

      </div>


      {/* =================================
          INVESTMENT TYPE
      ================================= */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px"
        }}
      >
        <button
          className="button"
          onClick={() => {
            setInvestmentType("REIT");
            setSelected([]);
          }}
          style={{
            opacity: investmentType === "REIT" ? 1 : 0.55
          }}
        >
          🏢 REIT
        </button>

        <button
          className="button"
          onClick={() => {
            setInvestmentType("InvIT");
            setSelected([]);
          }}
          style={{
            opacity: investmentType === "InvIT" ? 1 : 0.55
          }}
        >
          ⚡ InvIT
        </button>
      </div>

      {/* =================================
          INVESTMENT SELECTION
      ================================= */}

      <section className="card-grid">

        {(investmentType === "REIT" ? reits : invits).map(
          (investment) => (
            investment.investmentType === "InvIT" ? (
              <InvitCard
                key={investment._id}
                invit={investment}
                marketData={investment.livePrice != null ? {
                  price: investment.livePrice,
                  change: investment.liveChange,
                  changePercent: investment.liveChangePercent,
                  source: investment.marketSource,
                  delayed: investment.marketDelayed
                } : null}
                selected={selected.some((item) => item._id === investment._id)}
                onCompare={handleCompare}
              />
            ) : (
              <ReitCard
                key={investment._id}
                reit={{ ...investment, id: investment._id }}
                selected={selected.some((item) => item._id === investment._id)}
                onCompare={handleCompare}
              />
            )
          )
        )}

      </section>


      {/* =================================
          COMPARISON
      ================================= */}

      {selected.length > 0 && (

        <>

          <section className="content-section">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  ANALYSIS
                </span>

                <h2>
                  Side-by-Side Comparison
                </h2>

              </div>

            </div>


            <div className="table-wrapper">

              <table className="comparison-table">

                <thead>

                  <tr>

                    <th>
                      Metric
                    </th>


                    {scoredReits.map(
                      (reit) => (

                        <th
                          key={
                            reit._id
                          }
                        >

                          {reit.ticker}

                        </th>

                      )
                    )}

                  </tr>

                </thead>


                <tbody>


                  {/* =========================
                      CURRENT PRICE
                  ========================= */}

                  <tr>

                    <td>
                      Current Price
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          ₹
                          {formatNumber(
                            reit.livePrice ??
                            reit.price
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      DAILY CHANGE
                  ========================= */}

                  <tr>

                    <td>
                      Daily Change
                    </td>


                    {scoredReits.map(
                      (reit) => {

                        const change =
                          Number(
                            reit.liveChange ||
                              0
                          );


                        const positive =
                          change >= 0;


                        return (

                          <td
                            key={
                              reit._id
                            }
                          >

                            {reit.liveChange !==
                            null &&
                            reit.liveChange !==
                            undefined
                              ? (
                                <>
                                  {positive
                                    ? "+"
                                    : ""}

                                  {formatNumber(
                                    change
                                  )}

                                  {" "}

                                  (
                                  {positive
                                    ? "+"
                                    : ""}

                                  {formatNumber(
                                    reit.liveChangePercent
                                  )}

                                  %)
                                </>
                              )
                              : "—"}

                          </td>

                        );

                      }
                    )}

                  </tr>


                  {/* =========================
                      MARKET SOURCE
                  ========================= */}

                  <tr>

                    <td>
                      Market Source
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                          style={{
                            fontSize:
                              "12px"
                          }}
                        >

                          {getMarketSourceLabel(
                            reit
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      PREVIOUS CLOSE
                  ========================= */}

                  <tr>

                    <td>
                      Previous Close
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          ₹
                          {formatNumber(
                            reit.livePreviousClose
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      DAY HIGH
                  ========================= */}

                  <tr>

                    <td>
                      Day High
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          ₹
                          {formatNumber(
                            reit.liveHigh
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      DAY LOW
                  ========================= */}

                  <tr>

                    <td>
                      Day Low
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          ₹
                          {formatNumber(
                            reit.liveLow
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      VOLUME
                  ========================= */}

                  <tr>

                    <td>
                      Volume
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {formatVolume(
                            reit.liveVolume
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      52W HIGH
                  ========================= */}

                  <tr>

                    <td>
                      52W High
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          ₹
                          {formatNumber(
                            reit.live52WeekHigh
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      52W LOW
                  ========================= */}

                  <tr>

                    <td>
                      52W Low
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          ₹
                          {formatNumber(
                            reit.live52WeekLow
                          )}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      1 YEAR
                  ========================= */}

                  <tr>

                    <td>
                      1Y Return
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                          className="positive"
                        >

                          {reit.return1Y ?? "N/A"}%

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      3 YEAR
                  ========================= */}

                  <tr>

                    <td>
                      3Y Return
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {reit.return3Y ?? "N/A"}%

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      5 YEAR
                  ========================= */}

                  <tr>

                    <td>
                      5Y Return
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {reit.return5Y ?? "N/A"}%

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      DIVIDEND
                  ========================= */}

                  <tr>

                    <td>
                      Dividend Yield
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {reit.investmentType === "InvIT" ? (reit.distributionYield ?? "N/A") : (reit.dividendYield ?? "N/A")}%

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      OCCUPANCY
                  ========================= */}

                  <tr>

                    <td>
                      Occupancy
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {reit.investmentType === "InvIT" ? "N/A" : `${reit.occupancy ?? "N/A"}%`}

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      DEBT
                  ========================= */}

                  <tr>

                    <td>
                      Debt
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          ₹
                          {Number(
                            reit.debt ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                          {" "}Cr

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      VOLATILITY
                  ========================= */}

                  <tr>

                    <td>
                      Volatility
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {reit.volatility}%

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      RISK
                  ========================= */}

                  <tr>

                    <td>
                      Risk Score
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {reit.riskScore ?? "N/A"} /10

                        </td>

                      )
                    )}

                  </tr>


                  {/* =========================
                      OVERALL SCORE
                  ========================= */}

                  <tr className="score-row">

                    <td>
                      Overall Score
                    </td>


                    {scoredReits.map(
                      (reit) => (

                        <td
                          key={
                            reit._id
                          }
                        >

                          {Math.round(
                            reit.score
                          )}

                          /100

                        </td>

                      )
                    )}

                  </tr>


                </tbody>

              </table>

            </div>

          </section>


          {/* =================================
              ANALYSIS
          ================================= */}

          <section className="analysis-grid">


            {/* =================================
                WEIGHTS
            ================================= */}

            <div className="panel">

              <span className="eyebrow">
                PERSONALIZATION
              </span>

              <h2>
                Customize Score
              </h2>

              <p className="muted">
                Adjust the importance of
                each investment factor.
              </p>


              {Object.entries(
                weights
              ).map(
                ([key, value]) => (

                  <label
                    className="range-row"
                    key={key}
                  >

                    <span>

                      {key
                        .charAt(0)
                        .toUpperCase() +
                        key.slice(1)}

                      <b>
                        {value}%
                      </b>

                    </span>


                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={value}
                      onChange={(
                        event
                      ) =>
                        setWeights({

                          ...weights,

                          [key]:
                            Number(
                              event
                                .target
                                .value
                            )

                        })
                      }
                    />

                  </label>

                )
              )}


              <div
                className={
                  totalWeight ===
                  100
                    ? "weight-ok"
                    : "weight-warning"
                }
              >

                Total Weight:
                {" "}
                {totalWeight}%

                {totalWeight ===
                100
                  ? " ✓"
                  : " — should equal 100%"}

              </div>

            </div>


            {/* =================================
                TOP MATCH
            ================================= */}

            <div className="panel winner">

              <span className="eyebrow">
                TOP MATCH
              </span>


              {totalWeight ===
                100 &&
              scoredReits.length >
                0 ? (

                <>

                  <h2>
                    {
                      scoredReits[0]
                        .name
                    }
                  </h2>

                  <strong>
                    {Math.round(
                      scoredReits[0]
                        .score
                    )}
                    /100
                  </strong>

                  <p>
                    Highest score based
                    on your selected
                    comparison weights.
                  </p>

                </>

              ) : (

                <>

                  <h2>
                    Complete your weights
                  </h2>

                  <strong>
                    --
                  </strong>

                  <p>
                    Set total weight to
                    100% to calculate
                    the winner.
                  </p>

                </>

              )}

            </div>

          </section>

        </>

      )}


      {/* =================================
          EMPTY
      ================================= */}

      {selected.length === 0 && (

        <div className="empty">

          Select investments above to
          start comparing.

        </div>

      )}

    </div>

  );

}