import { useEffect, useState } from "react";
import { getReits } from "../api/api";

export default function Calculator() {
  const [reits, setReits] = useState([]);
  const [reitId, setReitId] = useState("");

  // Main calculator selector
  const [calculatorType, setCalculatorType] =
    useState("investment");

  // Existing REIT Investment Calculator
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(5);
  const [growth, setGrowth] = useState(10);

  // Common calculator inputs
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7);
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(20);

  // Real estate inputs
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [propertyExpenses, setPropertyExpenses] =
    useState(50000);
  const [propertyGrowth, setPropertyGrowth] =
    useState(8);

  // Tax / retirement
  const [salary, setSalary] = useState(600000);
  const [currentAge, setCurrentAge] = useState(25);
  const [retirementAge, setRetirementAge] =
    useState(60);
  const [retirementMonthly, setRetirementMonthly] =
    useState(30000);
  const [inflation, setInflation] = useState(6);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================
  // CALCULATOR OPTIONS
  // =====================================

  const calculatorGroups = [
    {
      title: "Investment & Savings",
      options: [
        {
          value: "investment",
          label: "REIT Investment Calculator"
        },
        {
          value: "lic",
          label: "LIC Calculator"
        },
        {
          value: "mutual-fund",
          label: "Mutual Fund Calculator"
        },
        {
          value: "sip",
          label: "SIP Calculator"
        },
        {
          value: "lumpsum",
          label: "Lumpsum Calculator"
        },
        {
          value: "ppf",
          label: "PPF Calculator"
        },
        {
          value: "fd",
          label: "FD Calculator"
        },
        {
          value: "rd",
          label: "RD Calculator"
        },
        {
          value: "nps",
          label: "NPS Calculator"
        },
        {
          value: "epf",
          label: "EPF Calculator"
        }
      ]
    },
    {
      title: "Loan Calculators",
      options: [
        {
          value: "home-loan",
          label: "Home Loan Calculator"
        },
        {
          value: "personal-loan",
          label: "Personal Loan Calculator"
        },
        {
          value: "car-loan",
          label: "Car Loan Calculator"
        },
        {
          value: "education-loan",
          label: "Education Loan Calculator"
        },
        {
          value: "loan-eligibility",
          label: "Loan Eligibility Calculator"
        },
        {
          value: "emi",
          label: "EMI Calculator"
        }
      ]
    },
    {
      title: "Real Estate Calculators",
      options: [
        {
          value: "home-buying",
          label: "Home Buying Calculator"
        },
        {
          value: "property-roi",
          label: "Property ROI Calculator"
        },
        {
          value: "rental-yield",
          label: "Rental Yield Calculator"
        },
        {
          value: "stamp-duty",
          label: "Stamp Duty Calculator"
        },
        {
          value: "registration",
          label: "Registration Charges Calculator"
        },
        {
          value: "home-vs-rent",
          label: "Home Loan vs Rent Calculator"
        }
      ]
    },
    {
      title: "Tax & Retirement",
      options: [
        {
          value: "income-tax",
          label: "Income Tax Calculator"
        },
        {
          value: "capital-gains",
          label: "Capital Gains Tax Calculator"
        },
        {
          value: "retirement",
          label: "Retirement Calculator"
        },
        {
          value: "gratuity",
          label: "Gratuity Calculator"
        },
        {
          value: "inflation",
          label: "Inflation Calculator"
        }
      ]
    }
  ];

  // =====================================
  // FETCH REITS
  // =====================================

  useEffect(() => {
    const fetchReits = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getReits();

        const data =
          response.data.data || [];

        setReits(data);

        if (data.length > 0) {
          setReitId(data[0]._id);
          setGrowth(data[0].return1Y);
        }
      } catch (err) {
        console.error(
          "Calculator API Error:",
          err
        );

        setError(
          "Unable to load REIT data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReits();
  }, []);

  // =====================================
  // SELECTED REIT
  // =====================================

  const selectedReit =
    reits.find(
      (reit) =>
        reit._id === reitId
    );

  // =====================================
  // EXISTING REIT CALCULATOR
  // =====================================

  const investment =
    Number(amount) || 0;

  const period =
    Number(years) || 0;

  const growthRate =
    (Number(growth) || 0) / 100;

  const dividendRate =
    selectedReit
      ? selectedReit.dividendYield / 100
      : 0;

  const capitalValue =
    investment *
    Math.pow(
      1 + growthRate,
      period
    );

  const annualDividend =
    investment * dividendRate;

  const totalDividend =
    annualDividend * period;

  const totalValue =
    capitalValue + totalDividend;

  const estimatedProfit =
    totalValue - investment;

  const roi =
    investment > 0
      ? (estimatedProfit / investment) * 100
      : 0;

  // =====================================
  // SIP
  // =====================================

  const sipMonthlyRate =
    (Number(rate) || 0) / 100 / 12;

  const sipMonths =
    (Number(years) || 0) * 12;

  const sipValue =
    Number(monthlyAmount) > 0 &&
    sipMonthlyRate > 0
      ? Number(monthlyAmount) *
        (
          (Math.pow(
            1 + sipMonthlyRate,
            sipMonths
          ) - 1) /
          sipMonthlyRate
        ) *
        (1 + sipMonthlyRate)
      : Number(monthlyAmount) *
        sipMonths;

  const sipInvestment =
    Number(monthlyAmount) *
    sipMonths;

  const sipProfit =
    sipValue - sipInvestment;

  // =====================================
  // LUMPSUM / FD / PPF
  // =====================================

  const lumpValue =
    Number(principal) *
    Math.pow(
      1 + Number(rate) / 100,
      Number(years)
    );

  const lumpProfit =
    lumpValue - Number(principal);

  // =====================================
  // EMI
  // =====================================

  const monthlyLoanRate =
    Number(loanRate) / 100 / 12;

  const totalLoanMonths =
    Number(loanYears) * 12;

  const emi =
    monthlyLoanRate > 0
      ? Number(loanAmount) *
        monthlyLoanRate *
        Math.pow(
          1 + monthlyLoanRate,
          totalLoanMonths
        ) /
        (
          Math.pow(
            1 + monthlyLoanRate,
            totalLoanMonths
          ) - 1
        )
      : Number(loanAmount) /
        totalLoanMonths;

  const totalPayment =
    emi * totalLoanMonths;

  const totalInterest =
    totalPayment - Number(loanAmount);

  // =====================================
  // PROPERTY ROI
  // =====================================

  const annualRent =
    Number(monthlyRent) * 12;

  const netAnnualRent =
    annualRent -
    Number(propertyExpenses);

  const rentalYield =
    Number(propertyPrice) > 0
      ? (netAnnualRent /
          Number(propertyPrice)) *
        100
      : 0;

  const propertyFutureValue =
    Number(propertyPrice) *
    Math.pow(
      1 + Number(propertyGrowth) / 100,
      Number(years)
    );

  const propertyProfit =
    propertyFutureValue -
    Number(propertyPrice);

  // =====================================
  // RETIREMENT
  // =====================================

  const retirementYears =
    Math.max(
      0,
      Number(retirementAge) -
        Number(currentAge)
    );

  const retirementFutureValue =
    Number(retirementMonthly) *
    12 *
    retirementYears;

  // =====================================
  // INFLATION
  // =====================================

  const inflationFutureValue =
    Number(principal) *
    Math.pow(
      1 + Number(inflation) / 100,
      Number(years)
    );

  const purchasingPower =
    Number(years) > 0
      ? Number(principal) /
        Math.pow(
          1 + Number(inflation) / 100,
          Number(years)
        )
      : Number(principal);

  // =====================================
  // FORMAT INR
  // =====================================

  function formatINR(value) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }
    ).format(
      Number.isFinite(value)
        ? value
        : 0
    );
  }

  // =====================================
  // REIT CHANGE
  // =====================================

  function handleReitChange(event) {
    const id =
      event.target.value;

    setReitId(id);

    const reit =
      reits.find(
        (item) =>
          item._id === id
      );

    if (reit) {
      setGrowth(reit.return1Y);
    }
  }

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="empty">
        <h2>
          Loading Calculator...
        </h2>

        <p>
          Fetching REIT data
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
          Calculator Error
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

      {/* HEADER */}

      <section className="page-heading">

        <span className="eyebrow">
          FINANCIAL TOOLS
        </span>

        <h1>
          Investment Calculator
        </h1>

        <p>
          Choose a calculator and
          estimate your investment,
          loan or real estate returns.
        </p>

      </section>


      {/* CALCULATOR SELECTOR */}

      <section
        className="panel"
        style={{
          marginBottom: "24px"
        }}
      >

        <span className="eyebrow">
          SELECT TOOL
        </span>

        <h2>
          Choose Calculator
        </h2>

        <select
          value={calculatorType}
          onChange={(e) =>
            setCalculatorType(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #d7e0dc",
            fontSize: "15px",
            background: "#fff",
            marginTop: "10px"
          }}
        >

          {calculatorGroups.map(
            (group) => (
              <optgroup
                key={group.title}
                label={group.title}
              >

                {group.options.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}

              </optgroup>
            )
          )}

        </select>

      </section>


      {/* =================================================
          REIT INVESTMENT CALCULATOR
      ================================================= */}

      {calculatorType ===
        "investment" && (

        <div className="calculator-grid">

          <section className="panel">

            <span className="eyebrow">
              INPUTS
            </span>

            <h2>
              Investment Details
            </h2>

            <label className="form-label">

              Select REIT

              <select
                value={reitId}
                onChange={
                  handleReitChange
                }
              >

                {reits.map(
                  (reit) => (
                    <option
                      key={reit._id}
                      value={reit._id}
                    >
                      {reit.name}
                    </option>
                  )
                )}

              </select>

            </label>


            <label className="form-label">

              Investment Amount (₹)

              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
              />

            </label>


            <label className="form-label">

              Investment Period (Years)

              <input
                type="number"
                min="0"
                max="50"
                value={years}
                onChange={(e) =>
                  setYears(
                    e.target.value
                  )
                }
              />

            </label>


            <label className="form-label">

              Expected Annual Growth (%)

              <input
                type="number"
                min="-100"
                max="100"
                value={growth}
                onChange={(e) =>
                  setGrowth(
                    e.target.value
                  )
                }
              />

            </label>


            <div className="assumption">

              Selected REIT:

              <strong>
                {" "}
                {selectedReit?.ticker}
              </strong>

              <br />

              Current dividend yield:

              <strong>
                {" "}
                {selectedReit?.dividendYield}%
              </strong>

              <br />

              Historical 1Y return:

              <strong>
                {" "}
                {selectedReit?.return1Y}%
              </strong>

            </div>

          </section>


          <section className="panel">

            <span className="eyebrow">
              ESTIMATED OUTCOME
            </span>

            <h2>
              Potential Value
            </h2>

            <div className="big-number">
              {formatINR(totalValue)}
            </div>

            <p className="muted">
              Estimated combined value
              after {period} years.
            </p>

            <div className="result-list">

              <div>
                <span>
                  Initial Investment
                </span>

                <strong>
                  {formatINR(investment)}
                </strong>
              </div>

              <div>
                <span>
                  Estimated Capital Value
                </span>

                <strong>
                  {formatINR(capitalValue)}
                </strong>
              </div>

              <div>
                <span>
                  Annual Dividend
                </span>

                <strong>
                  {formatINR(annualDividend)}
                </strong>
              </div>

              <div>
                <span>
                  Total Dividends
                </span>

                <strong>
                  {formatINR(totalDividend)}
                </strong>
              </div>

              <div>
                <span>
                  Estimated Profit
                </span>

                <strong>
                  {formatINR(estimatedProfit)}
                </strong>
              </div>

              <div>
                <span>
                  Estimated ROI
                </span>

                <strong>
                  {roi.toFixed(2)}%
                </strong>
              </div>

              <div className="highlight">

                <span>
                  Estimated Total
                </span>

                <strong>
                  {formatINR(totalValue)}
                </strong>

              </div>

            </div>

            <p className="disclaimer">
              This is an educational estimate
              based on constant growth and
              dividend assumptions. Actual
              market returns may differ.
            </p>

          </section>

        </div>
      )}


      {/* =================================================
          SIP CALCULATOR
      ================================================= */}

      {calculatorType === "sip" && (

        <CalculatorBox
          title="SIP Calculator"
          description="Estimate the future value of your monthly SIP investment."
        >

          <Input
            label="Monthly Investment (₹)"
            value={monthlyAmount}
            setValue={setMonthlyAmount}
          />

          <Input
            label="Expected Annual Return (%)"
            value={rate}
            setValue={setRate}
          />

          <Input
            label="Investment Period (Years)"
            value={years}
            setValue={setYears}
          />

          <Result
            label="Invested Amount"
            value={formatINR(sipInvestment)}
          />

          <Result
            label="Estimated Profit"
            value={formatINR(sipProfit)}
          />

          <Result
            label="Estimated Future Value"
            value={formatINR(sipValue)}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          LUMPSUM / FD / PPF / NPS / EPF / MUTUAL FUND
      ================================================= */}

      {[
        "lumpsum",
        "fd",
        "ppf",
        "nps",
        "epf",
        "mutual-fund"
      ].includes(calculatorType) && (

        <CalculatorBox
          title={
            calculatorGroups
              .flatMap(
                (g) => g.options
              )
              .find(
                (o) =>
                  o.value ===
                  calculatorType
              )?.label
          }
          description="Calculate estimated growth on your investment."
        >

          <Input
            label="Investment Amount (₹)"
            value={principal}
            setValue={setPrincipal}
          />

          <Input
            label="Expected Annual Return (%)"
            value={rate}
            setValue={setRate}
          />

          <Input
            label="Investment Period (Years)"
            value={years}
            setValue={setYears}
          />

          <Result
            label="Initial Investment"
            value={formatINR(principal)}
          />

          <Result
            label="Estimated Profit"
            value={formatINR(lumpProfit)}
          />

          <Result
            label="Estimated Maturity Value"
            value={formatINR(lumpValue)}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          EMI / LOAN CALCULATORS
      ================================================= */}

      {[
        "home-loan",
        "personal-loan",
        "car-loan",
        "education-loan",
        "emi"
      ].includes(calculatorType) && (

        <CalculatorBox
          title={
            calculatorGroups
              .flatMap(
                (g) => g.options
              )
              .find(
                (o) =>
                  o.value ===
                  calculatorType
              )?.label
          }
          description="Calculate monthly EMI, total interest and total repayment."
        >

          <Input
            label="Loan Amount (₹)"
            value={loanAmount}
            setValue={setLoanAmount}
          />

          <Input
            label="Interest Rate (%)"
            value={loanRate}
            setValue={setLoanRate}
          />

          <Input
            label="Loan Period (Years)"
            value={loanYears}
            setValue={setLoanYears}
          />

          <Result
            label="Monthly EMI"
            value={formatINR(emi)}
          />

          <Result
            label="Total Interest"
            value={formatINR(totalInterest)}
          />

          <Result
            label="Total Repayment"
            value={formatINR(totalPayment)}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          REAL ESTATE CALCULATORS
      ================================================= */}

      {[
        "home-buying",
        "property-roi",
        "rental-yield",
        "stamp-duty",
        "registration",
        "home-vs-rent"
      ].includes(calculatorType) && (

        <CalculatorBox
          title={
            calculatorGroups
              .flatMap(
                (g) => g.options
              )
              .find(
                (o) =>
                  o.value ===
                  calculatorType
              )?.label
          }
          description="Estimate property cost, rental income and investment returns."
        >

          <Input
            label="Property Value (₹)"
            value={propertyPrice}
            setValue={setPropertyPrice}
          />

          <Input
            label="Monthly Rent (₹)"
            value={monthlyRent}
            setValue={setMonthlyRent}
          />

          <Input
            label="Annual Expenses (₹)"
            value={propertyExpenses}
            setValue={setPropertyExpenses}
          />

          <Input
            label="Property Growth (%)"
            value={propertyGrowth}
            setValue={setPropertyGrowth}
          />

          <Input
            label="Period (Years)"
            value={years}
            setValue={setYears}
          />

          <Result
            label="Annual Rental Income"
            value={formatINR(annualRent)}
          />

          <Result
            label="Net Annual Rental Income"
            value={formatINR(netAnnualRent)}
          />

          <Result
            label="Rental Yield"
            value={`${rentalYield.toFixed(2)}%`}
          />

          <Result
            label="Estimated Capital Gain"
            value={formatINR(propertyProfit)}
          />

          <Result
            label="Estimated Future Property Value"
            value={formatINR(propertyFutureValue)}
            highlight
          />
        </CalculatorBox>

      )}


      {/* =================================================
          LIC
      ================================================= */}

      {calculatorType === "lic" && (

        <CalculatorBox
          title="LIC Calculator"
          description="Estimate total premiums and maturity value for an insurance investment."
        >

          <Input
            label="Annual Premium (₹)"
            value={principal}
            setValue={setPrincipal}
          />

          <Input
            label="Policy Period (Years)"
            value={years}
            setValue={setYears}
          />

          <Input
            label="Expected Annual Growth (%)"
            value={rate}
            setValue={setRate}
          />

          <Result
            label="Total Premium Paid"
            value={formatINR(
              principal * years
            )}
          />

          <Result
            label="Estimated Maturity Value"
            value={formatINR(lumpValue)}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          RD
      ================================================= */}

      {calculatorType === "rd" && (

        <CalculatorBox
          title="RD Calculator"
          description="Estimate recurring deposit maturity amount."
        >

          <Input
            label="Monthly Deposit (₹)"
            value={monthlyAmount}
            setValue={setMonthlyAmount}
          />

          <Input
            label="Interest Rate (%)"
            value={rate}
            setValue={setRate}
          />

          <Input
            label="Period (Years)"
            value={years}
            setValue={setYears}
          />

          <Result
            label="Total Deposited"
            value={formatINR(
              monthlyAmount *
                years *
                12
            )}
          />

          <Result
            label="Estimated Maturity"
            value={formatINR(sipValue)}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          LOAN ELIGIBILITY
      ================================================= */}

      {calculatorType ===
        "loan-eligibility" && (

        <CalculatorBox
          title="Loan Eligibility Calculator"
          description="Estimate a possible loan amount based on monthly income and repayment capacity."
        >

          <Input
            label="Monthly Income (₹)"
            value={monthlyAmount}
            setValue={setMonthlyAmount}
          />

          <Input
            label="Interest Rate (%)"
            value={loanRate}
            setValue={setLoanRate}
          />

          <Input
            label="Loan Period (Years)"
            value={loanYears}
            setValue={setLoanYears}
          />

          <Result
            label="Estimated Eligible EMI"
            value={formatINR(
              monthlyAmount * 0.5
            )}
          />

          <Result
            label="Estimated Loan Eligibility"
            value={formatINR(
              (
                (monthlyAmount * 0.5) *
                (
                  1 -
                  Math.pow(
                    1 +
                      Number(loanRate) /
                        100 /
                        12,
                    -Number(loanYears) *
                      12
                  )
                ) /
                (
                  Number(loanRate) /
                  100 /
                  12
                )
              )
            )}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          TAX
      ================================================= */}

      {calculatorType === "income-tax" && (

        <CalculatorBox
          title="Income Tax Calculator"
          description="Estimate income tax based on annual income."
        >

          <Input
            label="Annual Income (₹)"
            value={salary}
            setValue={setSalary}
          />

          <Result
            label="Annual Income"
            value={formatINR(salary)}
          />

          <Result
            label="Estimated Taxable Amount"
            value={formatINR(
              Math.max(
                0,
                Number(salary) - 500000
              )
            )}
            highlight
          />

          <p className="disclaimer">
            Tax calculation is a simplified
            educational estimate. Actual tax
            depends on the applicable tax regime,
            deductions and current rules.
          </p>

        </CalculatorBox>

      )}


      {/* =================================================
          RETIREMENT
      ================================================= */}

      {calculatorType ===
        "retirement" && (

        <CalculatorBox
          title="Retirement Calculator"
          description="Estimate the amount accumulated through regular savings before retirement."
        >

          <Input
            label="Current Age"
            value={currentAge}
            setValue={setCurrentAge}
          />

          <Input
            label="Retirement Age"
            value={retirementAge}
            setValue={setRetirementAge}
          />

          <Input
            label="Monthly Retirement Saving (₹)"
            value={retirementMonthly}
            setValue={setRetirementMonthly}
          />

          <Result
            label="Years Remaining"
            value={`${retirementYears} years`}
          />

          <Result
            label="Estimated Savings"
            value={formatINR(
              retirementFutureValue
            )}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          GRATUITY
      ================================================= */}

      {calculatorType === "gratuity" && (

        <CalculatorBox
          title="Gratuity Calculator"
          description="Estimate gratuity based on salary and years of service."
        >

          <Input
            label="Last Drawn Monthly Salary (₹)"
            value={principal}
            setValue={setPrincipal}
          />

          <Input
            label="Years of Service"
            value={years}
            setValue={setYears}
          />

          <Result
            label="Estimated Gratuity"
            value={formatINR(
              (
                Number(principal) *
                15 *
                Number(years)
              ) / 26
            )}
            highlight
          />

        </CalculatorBox>

      )}


      {/* =================================================
          CAPITAL GAINS
      ================================================= */}

      {calculatorType ===
        "capital-gains" && (

        <CalculatorBox
          title="Capital Gains Tax Calculator"
          description="Estimate capital gain from an investment sale."
        >

          <Input
            label="Purchase Price (₹)"
            value={principal}
            setValue={setPrincipal}
          />

          <Input
            label="Sale Price (₹)"
            value={propertyPrice}
            setValue={setPropertyPrice}
          />

          <Result
            label="Capital Gain"
            value={formatINR(
              Number(propertyPrice) -
              Number(principal)
            )}
            highlight
          />

          <p className="disclaimer">
            This calculator shows capital gain,
            not a complete tax liability.
            Actual tax depends on asset type,
            holding period and applicable rules.
          </p>

        </CalculatorBox>

      )}


      {/* =================================================
          INFLATION
      ================================================= */}

      {calculatorType ===
        "inflation" && (

        <CalculatorBox
          title="Inflation Calculator"
          description="See how inflation can change the future purchasing power of money."
        >

          <Input
            label="Current Amount (₹)"
            value={principal}
            setValue={setPrincipal}
          />

          <Input
            label="Inflation Rate (%)"
            value={inflation}
            setValue={setInflation}
          />

          <Input
            label="Period (Years)"
            value={years}
            setValue={setYears}
          />

          <Result
            label="Future Cost Equivalent"
            value={formatINR(
              inflationFutureValue
            )}
          />

          <Result
            label="Current Purchasing Power"
            value={formatINR(
              purchasingPower
            )}
            highlight
          />

        </CalculatorBox>

      )}

    </div>
  );
}


/* =========================================================
   REUSABLE CALCULATOR BOX
========================================================= */

function CalculatorBox({
  title,
  description,
  children
}) {
  return (
    <div className="calculator-grid">

      <section className="panel">

        <span className="eyebrow">
          CALCULATOR
        </span>

        <h2>
          {title}
        </h2>

        <p className="muted">
          {description}
        </p>

        <div
          style={{
            marginTop: "20px"
          }}
        >
          {children}
        </div>

      </section>

    </div>
  );
}


/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  value,
  setValue
}) {
  return (
    <label className="form-label">

      {label}

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
      />

    </label>
  );
}


/* =========================================================
   RESULT
========================================================= */

function Result({
  label,
  value,
  highlight = false
}) {
  return (
    <div
      className={
        highlight
          ? "highlight"
          : "result-list"
      }
      style={{
        marginTop: "12px",
        padding: "14px"
      }}
    >

      <span>
        {label}
      </span>

      <strong
        style={{
          float: "right"
        }}
      >
        {value}
      </strong>

    </div>
  );
}