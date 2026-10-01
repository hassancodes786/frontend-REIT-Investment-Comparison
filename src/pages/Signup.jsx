import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/api";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone: sirf numbers, maximum 10 digits
    if (name === "phone") {
      const onlyNumbers = value.replace(/\D/g, "");

      setFormData({
        ...formData,
        phone: onlyNumbers.slice(0, 10)
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;

    // Full Name validation
    if (!name) {
      return "Please enter your full name.";
    }

    if (!/^[A-Za-z ]{2,50}$/.test(name)) {
      return "Name should contain only letters and spaces.";
    }

    // Email validation
    if (!email) {
      return "Please enter your email address.";
    }

    const emailRegex =
      /^[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    // Phone validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    // Password validation
    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        password: formData.password
      });

      setMessage(
        response.data.message || "Account created successfully!"
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: ""
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Signup Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h1 style={styles.title}>
          Create Account
        </h1>

        <p style={styles.subtitle}>
          Create your account to start investing
        </p>

        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}
          <label style={styles.label}>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
            style={styles.input}
          />

          {/* EMAIL */}
          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            style={styles.input}
          />

          {/* PHONE */}
          <label style={styles.label}>
            Phone
          </label>

          <input
            type="tel"
            name="phone"
            placeholder="Enter 10-digit mobile number"
            value={formData.phone}
            onChange={handleChange}
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            required
            style={styles.input}
          />

          {/* PASSWORD */}
          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            minLength={8}
            style={styles.input}
          />

          <p style={styles.passwordHint}>
            Password must contain 8+ characters, uppercase,
            lowercase and number.
          </p>

          {/* SIGN UP BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}

          <Link
            to="/login"
            style={styles.link}
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    background: "#f5f7fb"
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    background: "#ffffff",
    padding: "35px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
  },

  title: {
    margin: "0 0 8px",
    textAlign: "center",
    fontSize: "30px"
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "25px"
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
    color: "#333"
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "18px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px"
  },

  passwordHint: {
    marginTop: "-8px",
    marginBottom: "18px",
    fontSize: "12px",
    color: "#777"
  },

  button: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer"
  },

  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center"
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center"
  },

  loginText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#555"
  },

  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none"
  }
};