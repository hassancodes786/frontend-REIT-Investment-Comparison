import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getInvits,
  getLiveInvitPrices
} from "../api/api";

import InvitCard from "../components/InvitCard";

const InvitExplorer = () => {
  const navigate = useNavigate();

  const [invits, setInvits] = useState([]);

  const [marketData, setMarketData] = useState({});

  const [loading, setLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");

  // ============================
  // LOAD INVITS
  // ============================

  const loadInvits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInvits();

      const data = response.data?.data || [];

      setInvits(data);

    } catch (err) {
      console.error(
        "Error loading InvITs:",
        err
      );

      setError(
        "Unable to load InvIT data. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // LOAD INVIT MARKET DATA
  // ============================

  const loadMarketData = async () => {
    try {
      setMarketLoading(true);

      const response =
        await getLiveInvitPrices();

      const data =
        response.data?.data || [];

      const marketMap = {};

      data.forEach((item) => {
        if (!item?.symbol) {
          return;
        }

        // Store using canonical NSE symbol
        marketMap[
          item.symbol.toUpperCase()
        ] = item;
      });

      setMarketData(marketMap);

    } catch (err) {
      console.error(
        "Error loading InvIT market data:",
        err
      );

      // Market data failure should NOT
      // stop InvIT cards from loading.
      setMarketData({});

    } finally {
      setMarketLoading(false);
    }
  };

  // ============================
  // INITIAL LOAD
  // ============================

  useEffect(() => {
    loadInvits();
    loadMarketData();
  }, []);

  // ============================
  // SEARCH + FILTER
  // ============================

  const filteredInvits = useMemo(() => {
    let result = [...invits];

    if (search.trim()) {
      const searchText = search.toLowerCase();
      result = result.filter(
        (invit) =>
          `${invit.name} ${invit.ticker} ${invit.sector}`
            .toLowerCase()
            .includes(searchText)
      );
    }

    if (sector !== "All") {
      result = result.filter((invit) => invit.sector === sector);
    }

    return result;
  }, [search, sector, invits]);

  // ============================
  // GET MARKET DATA FOR INVIT
  // ============================

  const getMarketDataForInvit = (
    invit
  ) => {
    if (!invit?.ticker) {
      return null;
    }

    const ticker =
      invit.ticker.toUpperCase();

    // MongoDB currently has IRBIT,
    // NSE uses IRBINVIT.
    const marketSymbol =
      ticker === "IRBIT"
        ? "IRBINVIT"
        : ticker;

    return (
      marketData[marketSymbol] ||
      null
    );
  };

  // ============================
  // VIEW DETAILS
  // ============================

  const handleViewDetails = (
    id
  ) => {
    navigate(`/invits/${id}`);
  };

  // ============================
  // SECTORS
  // ============================

  const sectors = [
    "All",
    ...new Set(
      invits
        .map(
          (invit) =>
            invit.sector
        )
        .filter(Boolean)
    )
  ];

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}
    >

      {/* ============================
          HEADER
      ============================ */}

      <div
        style={{
          marginBottom: "25px"
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "32px",
            color: "#111827"
          }}
        >
          InvIT Explorer
        </h1>

        <p
          style={{
            margin: 0,
            color: "#6b7280",
            fontSize: "15px"
          }}
        >
          Explore Infrastructure Investment
          Trusts available for comparison.
        </p>
      </div>


      {/* ============================
          SEARCH + FILTER
      ============================ */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "25px"
        }}
      >

        <input
          type="text"
          placeholder="Search InvIT by name, ticker or sector..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            flex: "1",
            minWidth: "250px",
            padding: "12px 15px",
            border:
              "1px solid #d1d5db",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px"
          }}
        />

        <select
          value={sector}
          onChange={(e) =>
            setSector(e.target.value)
          }
          style={{
            padding: "12px 15px",
            border:
              "1px solid #d1d5db",
            borderRadius: "10px",
            background: "#ffffff",
            fontSize: "14px",
            minWidth: "190px"
          }}
        >
          {sectors.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item === "All"
                ? "All Sectors"
                : item}
            </option>
          ))}
        </select>

      </div>


      {/* ============================
          MARKET DATA STATUS
      ============================ */}

      {!marketLoading &&
        Object.keys(marketData).length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px 14px",
              background: "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              borderRadius: "10px",
              color: "#166534",
              fontSize: "13px"
            }}
          >
            🟢 Market data loaded
          </div>
        )}


      {marketLoading && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px 14px",
            background: "#fffbeb",
            border:
              "1px solid #fde68a",
            borderRadius: "10px",
            color: "#92400e",
            fontSize: "13px"
          }}
        >
          🟡 Loading market data...
        </div>
      )}


      {/* ============================
          LOADING
      ============================ */}

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#6b7280"
          }}
        >
          Loading InvITs...
        </div>
      )}


      {/* ============================
          ERROR
      ============================ */}

      {!loading && error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}
        >
          {error}
        </div>
      )}


      {/* ============================
          RESULTS
      ============================ */}

      {!loading &&
        !error &&
        filteredInvits.length > 0 && (
          <>

            <div
              style={{
                marginBottom: "15px",
                color: "#6b7280",
                fontSize: "14px"
              }}
            >
              Showing{" "}
              <strong>
                {filteredInvits.length}
              </strong>{" "}
              InvIT
              {filteredInvits.length !== 1
                ? "s"
                : ""}
            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px"
              }}
            >

              {filteredInvits.map(
                (invit) => (
                  <InvitCard
                    key={invit._id}
                    invit={invit}
                    marketData={
                      getMarketDataForInvit(
                        invit
                      )
                    }
                    onViewDetails={
                      handleViewDetails
                    }
                  />
                )
              )}

            </div>

          </>
        )}


      {/* ============================
          NO RESULTS
      ============================ */}

      {!loading &&
        !error &&
        filteredInvits.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#f9fafb",
              borderRadius: "15px"
            }}
          >

            <h3
              style={{
                marginBottom: "8px",
                color: "#111827"
              }}
            >
              No InvITs found
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6b7280"
              }}
            >
              Try changing your search
              or sector filter.
            </p>

          </div>
        )}

    </div>
  );
};

export default InvitExplorer;