import Investment from "./pages/Investment";
import AdminInvestments from "./pages/AdminInvestments";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminRoute from "./components/AdminRoute";
import InvitDetails
  from "./pages/InvitDetails";

import {
  Routes,
  Route
} from "react-router-dom";

import Navbar
  from "./components/Navbar";

import Footer
  from "./components/Footer";

import Dashboard
  from "./pages/Dashboard";

import ReitExplorer
  from "./pages/ReitExplorer";

import ReitDetails
  from "./pages/ReitDetails";

import InvitExplorer
  from "./pages/InvitExplorer";

import Compare
  from "./pages/Compare";

import Calculator
  from "./pages/Calculator";

import Properties
  from "./pages/Properties";

import PropertyDetails
  from "./pages/PropertyDetails";

import Purchase
  from "./pages/Purchase";

import MyInvestments
  from "./pages/MyInvestments";


export default function App() {

  return (

    <div className="app">

      <Navbar />


      <main className="container">

        <Routes>

          {/* =========================
              DASHBOARD
          ========================= */}

          <Route
            path="/"
            element={<Dashboard />}
          />


          {/* =========================
              REIT ROUTES
          ========================= */}

          <Route
            path="/reits"
            element={<ReitExplorer />}
          />


          <Route
            path="/reits/:id"
            element={<ReitDetails />}
          />


          {/* =========================
              INVIT ROUTES
          ========================= */}

          <Route
            path="/invits"
            element={<InvitExplorer />}
          />

          <Route
  path="/invits/:id"
  element={<InvitDetails />}
/>


          {/* =========================
              COMPARE
          ========================= */}

          <Route
            path="/compare"
            element={<Compare />}
          />


          {/* =========================
              CALCULATOR
          ========================= */}

          <Route
            path="/calculator"
            element={<Calculator />}
          />


          {/* =========================
              PROPERTY ROUTES
          ========================= */}

          <Route
            path="/properties"
            element={<Properties />}
          />


          <Route
            path="/properties/:id"
            element={<PropertyDetails />}
          />


          {/* =========================
              INVESTMENT ROUTE
          ========================= */}

          <Route
            path="/properties/:id/invest"
            element={<Investment />}
          />


          {/* =========================
              OLD PURCHASE ROUTE
          ========================= */}

          <Route
            path="/properties/:id/purchase"
            element={<Purchase />}
          />


          {/* =========================
              MY INVESTMENTS
          ========================= */}

          <Route
            path="/my-investments"
            element={<MyInvestments />}
          />


          {/* =========================
              SIGNUP
          ========================= */}

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* =========================
              LOGIN
          ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* =========================
              ADMIN INVESTMENTS
          ========================= */}

          <Route
            path="/admin/investments"
            element={
              <AdminRoute>
                <AdminInvestments />
              </AdminRoute>
            }
          />

        </Routes>

      </main>


      <Footer />

    </div>

  );
}