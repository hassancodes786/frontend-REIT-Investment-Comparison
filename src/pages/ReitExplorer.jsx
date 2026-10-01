import { useEffect, useMemo, useState } from "react";

import {
  getReits,
  getLiveReitPrice
} from "../api/api";

import ReitCard from "../components/ReitCard";

export default function ReitExplorer() {
  const [reits, setReits] = useState([]);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [marketLoading, setMarketLoading] =
    useState(false);

  const [lastMarketUpdate, setLastMarketUpdate] =
    useState(null);

  // ============================
  // LOAD REITS FROM MONGODB
  // ============================

  const loadReits = async () => {
    try {
      setLoading(true);

      const response = await getReits();

      const data =
        response.data?.data || [];

      const formattedData =
        data.map((reit) => ({
          ...reit,

          id: reit._id,

          // MongoDB saved price
          price: Number(reit.price || 0),

          // Market data initially empty
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

          // Market source
          marketSource: null,
          marketDelayed: false,
          marketSymbol: null
        }));

      setReits(formattedData);
      setError("");

    } catch (err) {
      console.error(
        "Error loading REITs:",
        err
      );

      setError(
        "Unable to load REITs."
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

  const loadMarketPrices = async () => {
    if (reits.length === 0) {
      return;
    }

    try {
      setMarketLoading(true);

      const updatedReits =
        await Promise.all(
          reits.map(
            async (reit) => {

              try {

                // ============================
                // REIT → NSE SYMBOL
                // ============================

                const symbolMap = {
                  BROOKFIELD: "BIRET",
                  BIRET: "BIRET",
                  EMBASSY: "EMBASSY",
                  MINDSPACE: "MINDSPACE",
                  NEXUS: "NXST",
                  NXST: "NXST"
                };

                const symbol =
                  symbolMap[
                    String(
                      reit.ticker || ""
                    ).toUpperCase()
                  ] ||
                  String(
                    reit.ticker || ""
                  ).toUpperCase();

                if (!symbol) {
                  return reit;
                }


                // ============================
                // CALL BACKEND
                // ============================

                const response =
                  await getLiveReitPrice(
                    symbol
                  );

                const marketData =
                  response.data?.data;


                // ============================
                // MARKET DATA RECEIVED
                // ============================

                if (
                  response.data?.success &&
                  marketData
                ) {

                  return {
                    ...reit,

                    // Price
                    livePrice:
                      marketData.price,

                    // Daily change
                    liveChange:
                      marketData.change,

                    liveChangePercent:
                      marketData.changePercent,

                    livePreviousClose:
                      marketData.previousClose,

                    // Additional market data
                    liveVolume:
                      marketData.volume,

                    liveHigh:
                      marketData.high,

                    liveLow:
                      marketData.low,

                    live52WeekHigh:
                      marketData.fiftyTwoWeekHigh,

                    live52WeekLow:
                      marketData.fiftyTwoWeekLow,

                    // Time
                    liveTimestamp:
                      marketData.latestTimestamp,

                    liveUpdatedAt:
                      marketData.updatedAt,

                    // Symbol
                    marketSymbol:
                      symbol,

                    // Source
                    marketSource:
                      response.data?.source ||
                      marketData.source ||
                      "Market Data",

                    // Delay status
                    marketDelayed:
                      response.data?.delayed === true
                  };
                }


                // Keep MongoDB data
                return reit;

              } catch (err) {

                console.error(
                  `Market data error for ${reit.ticker}:`,
                  err
                );

                // Keep MongoDB data
                return reit;
              }
            }
          )
        );


      setReits(updatedReits);

      setLastMarketUpdate(
        new Date()
      );

    } catch (err) {

      console.error(
        "Market Data Error:",
        err
      );

    } finally {
      setMarketLoading(false);
    }
  };


  // ============================
  // INITIAL LOAD
  // ============================

  useEffect(() => {
    loadReits();
  }, []);


  // ============================
  // LOAD MARKET DATA
  // AFTER REITS LOAD
  // ============================

  useEffect(() => {

    if (reits.length === 0) {
      return;
    }

    loadMarketPrices();

  }, [reits.length]);


  // ============================
  // AUTO REFRESH
  // EVERY 60 SECONDS
  // ============================

  useEffect(() => {

    if (reits.length === 0) {
      return;
    }

    const interval =
      setInterval(() => {
        loadMarketPrices();
      }, 60000);

    return () => {
      clearInterval(interval);
    };

  }, [reits.length]);


  // ============================
  // FILTER + SORT
  // ============================

  const filteredReits =
    useMemo(() => {

      let result =
        reits.filter((reit) => {

          const searchText =
            search.toLowerCase();

          const matchesSearch =
            reit.name
              ?.toLowerCase()
              .includes(searchText) ||

            reit.ticker
              ?.toLowerCase()
              .includes(searchText);

          const matchesSector =
            sector === "All" ||
            reit.sector === sector;

          return (
            matchesSearch &&
            matchesSector
          );
        });


      // ============================
      // PRICE SORT
      // ============================

      if (sort === "price") {

        result.sort(
          (a, b) =>
            (
              a.livePrice ??
              a.price ??
              0
            ) -
            (
              b.livePrice ??
              b.price ??
              0
            )
        );

      }


      // ============================
      // RETURN SORT
      // ============================

      if (sort === "return") {

        result.sort(
          (a, b) =>
            (b.return1Y ?? 0) -
            (a.return1Y ?? 0)
        );

      }


      // ============================
      // DIVIDEND SORT
      // ============================

      if (sort === "dividend") {

        result.sort(
          (a, b) =>
            (b.dividendYield ?? 0) -
            (a.dividendYield ?? 0)
        );

      }


      // ============================
      // RISK SORT
      // ============================

      if (sort === "risk") {

        result.sort(
          (a, b) =>
            (a.riskScore ?? 0) -
            (b.riskScore ?? 0)
        );

      }


      // ============================
      // NAME SORT
      // ============================

      if (sort === "name") {

        result.sort(
          (a, b) =>
            (a.name || "")
              .localeCompare(
                b.name || ""
              )
        );

      }


      return result;

    }, [
      reits,
      search,
      sector,
      sort
    ]);


  // ============================
  // MARKET STATUS
  // ============================

  const marketSources =
    reits
      .map(
        (reit) =>
          reit.marketSource
      )
      .filter(Boolean);


  const hasNSE =
    marketSources.includes(
      "NSE MCP"
    );


  const hasYahoo =
    marketSources.includes(
      "Yahoo Finance"
    );


  let marketStatus =
    "Fetching market data...";


  if (marketLoading) {

    marketStatus =
      "🟡 Updating market data...";

  } else if (
    hasNSE &&
    hasYahoo
  ) {

    marketStatus =
      "🟢 NSE Market Data + Yahoo Finance fallback";

  } else if (hasNSE) {

    marketStatus =
      "🟢 NSE Market Data • ~1–3 min delayed";

  } else if (hasYahoo) {

    marketStatus =
      "🟡 Yahoo Finance • Delayed";

  } else {

    marketStatus =
      "🟠 Market data unavailable";

  }


  // ============================
  // LOADING
  // ============================

  if (loading) {

    return (
      <div className="empty">
        Loading REITs...
      </div>
    );

  }


  // ============================
  // ERROR
  // ============================

  if (error) {

    return (
      <div className="empty">
        {error}
      </div>
    );

  }


  // ============================
  // PAGE
  // ============================

  return (
    <div>

      {/* =========================
          PAGE HEADING
      ========================= */}

      <section className="page-heading">

        <span className="eyebrow">
          EXPLORE
        </span>

        <h1>
          REIT Explorer
        </h1>

        <p>
          Search, filter and inspect
          available REITs.
        </p>

      </section>


      {/* =========================
          MARKET DATA STATUS
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
          flexWrap: "wrap"
        }}
      >

        <div
          style={{
            fontSize: "14px"
          }}
        >

          <span>
            {marketStatus}
          </span>

        </div>


        <div
          style={{
            fontSize: "13px",
            opacity: 0.7
          }}
        >

          {lastMarketUpdate
            ? `Last checked: ${lastMarketUpdate.toLocaleTimeString()}`
            : "Fetching latest market data..."}

        </div>

      </div>


      {/* =========================
          FILTERS
      ========================= */}

      <section className="filters">

        <input
          type="text"
          placeholder="Search REIT or ticker..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />


        <select
          value={sector}
          onChange={(event) =>
            setSector(
              event.target.value
            )
          }
        >

          <option value="All">
            All Sectors
          </option>

          <option value="Office">
            Office
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

          <option value="name">
            Sort: Name
          </option>

          <option value="return">
            Highest 1Y Return
          </option>

          <option value="dividend">
            Highest Dividend
          </option>

          <option value="risk">
            Lowest Risk
          </option>

          <option value="price">
            Lowest Price
          </option>

        </select>

      </section>


      {/* =========================
          RESULTS
      ========================= */}

      <div className="results-info">

        Showing {filteredReits.length} REIT
        {filteredReits.length !== 1
          ? "s"
          : ""}

      </div>


      {/* =========================
          REIT CARDS
      ========================= */}

      <section className="card-grid">

        {filteredReits.map(
          (reit) => (

            <ReitCard
              key={reit.id}
              reit={reit}
            />

          )
        )}

      </section>


      {/* =========================
          NO RESULTS
      ========================= */}

      {filteredReits.length === 0 && (

        <div className="empty">
          No REITs found.
        </div>

      )}

    </div>
  );
}