import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});


// ============================
// AUTH TOKEN
// ============================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ============================
// REIT API
// ============================

export const getReits = () =>
  API.get("/reits");

export const getReitById = (id) =>
  API.get(`/reits/${id}`);


// ============================
// INVIT API
// ============================

export const getInvits = () =>
  API.get("/invits");

export const getInvitById = (id) =>
  API.get(`/invits/${id}`);

export const createInvit = (invitData) =>
  API.post(
    "/invits",
    invitData
  );


// ============================
// PROPERTY API
// ============================

export const getProperties = () =>
  API.get("/properties");

export const getPropertyById = (id) =>
  API.get(`/properties/${id}`);


// ============================
// INVESTMENT API
// ============================

export const createInvestment = (
  investmentData
) =>
  API.post(
    "/investments",
    investmentData
  );


export const getInvestments = () =>
  API.get("/investments");


export const getInvestmentById = (
  id
) =>
  API.get(`/investments/${id}`);


export const updateInvestmentStatus = (
  id,
  status
) =>
  API.put(
    `/investments/${id}/status`,
    { status }
  );


// ============================
// DELETE INVESTMENT
// ============================

export const deleteInvestment = (
  id
) =>
  API.delete(
    `/investments/${id}`
  );


// ============================
// AUTH API
// ============================

export const signup = (userData) =>
  API.post(
    "/auth/signup",
    userData
  );


export const login = (credentials) =>
  API.post(
    "/auth/login",
    credentials
  );


// ============================
// REIT MARKET API
// ============================

// Single REIT live/delayed quote
export const getLiveReitPrice = (
  symbol
) =>
  API.get(
    `/market/quote/${encodeURIComponent(symbol)}`
  );


// All REIT market quotes
export const getLiveReitPrices = () =>
  API.get(
    "/market/quotes"
  );


// ============================
// INVIT MARKET API
// ============================

// Single InvIT live/delayed quote
export const getLiveInvitPrice = (
  symbol
) =>
  API.get(
    `/market/invit/quote/${encodeURIComponent(symbol)}`
  );


// All InvIT market quotes
export const getLiveInvitPrices = () =>
  API.get(
    "/market/invit/quotes"
  );


// ============================
// DEFAULT API
// ============================

export default API;