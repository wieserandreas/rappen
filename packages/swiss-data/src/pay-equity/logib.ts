import type { PayEquityInput, PayEquityResult, PayEquityEmployee } from "@rappen/shared";

/**
 * Pay Equity Analysis using Logib Module 1 (Blinder-Oaxaca Regression).
 *
 * Methodology:
 * - Dependent variable: ln(monthly salary)
 * - Explanatory variables: education, experience, service years, skill level, position
 * - Dummy variable: gender (1=female, 0=male)
 * - Tolerance: 5% unexplained gap
 * - Statistical test: t-test on gender coefficient
 *
 * Source: EBG (Eidg. Büro für die Gleichstellung) – Standard-Analyse-Modell Logib
 * Legal basis: GlG Art. 13 (Gleichstellungsgesetz)
 */
export function analyzePayEquity(input: PayEquityInput): PayEquityResult {
	const { employees } = input;

	if (employees.length < 10) {
		throw new Error("Mindestens 10 Mitarbeitende erforderlich für eine statistisch aussagekräftige Analyse.");
	}

	const maleCount = employees.filter((e) => e.gender === "M").length;
	const femaleCount = employees.filter((e) => e.gender === "F").length;

	if (maleCount < 2 || femaleCount < 2) {
		throw new Error("Mindestens 2 Mitarbeitende pro Geschlecht erforderlich.");
	}

	// ── Prepare data ──
	// Dependent variable: ln(standardized monthly salary)
	const y: number[] = [];
	const X: number[][] = [];

	for (const emp of employees) {
		// Standardize salary to 100% FTE
		const standardizedSalary = emp.salary_monthly / (emp.employment_percentage / 100);
		y.push(Math.log(standardizedSalary));

		// Independent variables: education, experience, service_years, skill, position, gender
		X.push([
			emp.education_level,
			emp.potential_experience_years,
			emp.service_years,
			emp.skill_level,
			emp.professional_position,
			emp.gender === "F" ? 1 : 0, // Gender dummy
		]);
	}

	// ── OLS Regression ──
	const result = olsRegression(y, X);

	const genderCoeffIndex = 5; // Last variable
	const genderCoeff = result.coefficients[genderCoeffIndex];
	const genderStdErr = result.standardErrors[genderCoeffIndex];
	const tStat = genderCoeff / genderStdErr;
	const degreesOfFreedom = employees.length - result.coefficients.length - 1;
	const pValue = tTestPValue(tStat, degreesOfFreedom);

	// Unexplained gap as percentage (exp(coefficient) - 1)
	const unexplainedGapPercent = (Math.exp(genderCoeff) - 1) * 100;
	const toleranceThreshold = 5.0;
	const compliant = Math.abs(unexplainedGapPercent) <= toleranceThreshold;

	const coeffLabels = ["education", "experience", "service_years", "skill_level", "position", "gender"];
	const coefficients: Record<string, string> = {};
	for (let i = 0; i < coeffLabels.length; i++) {
		coefficients[coeffLabels[i]] = result.coefficients[i].toFixed(6);
	}
	coefficients["intercept"] = result.intercept.toFixed(6);

	return {
		compliant,
		gender_coefficient: genderCoeff.toFixed(6),
		tolerance_threshold: toleranceThreshold.toFixed(1) + "%",
		t_statistic: tStat.toFixed(4),
		p_value: pValue.toFixed(6),
		sample_size: employees.length,
		unexplained_gap_percent: unexplainedGapPercent.toFixed(2) + "%",
		regression_details: {
			r_squared: result.rSquared.toFixed(4),
			coefficients,
		},
		recommendation: compliant
			? "Die Lohngleichheitsanalyse zeigt keinen signifikanten, unerklärten Lohnunterschied zwischen den Geschlechtern. Ihr Unternehmen erfüllt die Anforderungen des GlG."
			: `Die Analyse zeigt einen unerklärten Lohnunterschied von ${unexplainedGapPercent.toFixed(1)}% zuungunsten der Frauen. Dieser übersteigt die Toleranzschwelle von ${toleranceThreshold}%. Wir empfehlen eine vertiefte Prüfung und Anpassung der Lohnstruktur.`,
		legal_basis: ["GlG Art. 13 (Gleichstellungsgesetz)", "Logib – Standard-Analyse-Modell des EBG"],
	};
}

// ════════════════════════════════════════════════════════════
// OLS Regression (Ordinary Least Squares)
// ══���══════════════════════════��══════════════════════════════

interface OlsResult {
	coefficients: number[];
	intercept: number;
	standardErrors: number[];
	rSquared: number;
}

/**
 * Simple OLS regression implementation.
 * Solves: y = Xβ + ε using normal equation: β = (X'X)^(-1) X'y
 */
function olsRegression(y: number[], X: number[][]): OlsResult {
	const n = y.length;
	const k = X[0].length;

	// Add intercept column (column of 1s)
	const Xa: number[][] = X.map((row) => [1, ...row]);
	const kFull = k + 1;

	// X'X
	const XtX = matMul(transpose(Xa), Xa);

	// Add small ridge regularization to avoid singularity (λ = 1e-6)
	for (let i = 0; i < kFull; i++) {
		XtX[i][i] += 1e-6;
	}

	// X'y
	const Xty = matVecMul(transpose(Xa), y);

	// β = (X'X)^(-1) * X'y
	const XtXinv = invertMatrix(XtX);
	const beta = matVecMul(XtXinv, Xty);

	// Predictions and residuals
	const yHat = Xa.map((row) => row.reduce((sum, val, i) => sum + val * beta[i], 0));
	const residuals = y.map((yi, i) => yi - yHat[i]);

	// R²
	const yMean = y.reduce((a, b) => a + b, 0) / n;
	const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
	const ssRes = residuals.reduce((sum, e) => sum + e ** 2, 0);
	const rSquared = 1 - ssRes / ssTot;

	// Standard errors
	const mse = ssRes / (n - kFull);
	const standardErrors = XtXinv.map((row, i) => Math.sqrt(Math.abs(mse * row[i])));

	return {
		coefficients: beta.slice(1), // Exclude intercept
		intercept: beta[0],
		standardErrors: standardErrors.slice(1),
		rSquared,
	};
}

// ════════════════════════════════════════════════════════════
// Matrix utilities
// ══════════════════════════���═════════════════════════════════

function transpose(m: number[][]): number[][] {
	return m[0].map((_, j) => m.map((row) => row[j]));
}

function matMul(a: number[][], b: number[][]): number[][] {
	const rows = a.length;
	const cols = b[0].length;
	const result: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			for (let k = 0; k < a[0].length; k++) {
				result[i][j] += a[i][k] * b[k][j];
			}
		}
	}
	return result;
}

function matVecMul(m: number[][], v: number[]): number[] {
	return m.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

function invertMatrix(m: number[][]): number[][] {
	const n = m.length;
	const aug: number[][] = m.map((row, i) => {
		const identity = new Array(n).fill(0);
		identity[i] = 1;
		return [...row, ...identity];
	});

	// Gauss-Jordan elimination
	for (let col = 0; col < n; col++) {
		let maxRow = col;
		for (let row = col + 1; row < n; row++) {
			if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
				maxRow = row;
			}
		}
		[aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

		const pivot = aug[col][col];
		if (Math.abs(pivot) < 1e-12) throw new Error("Matrix ist singulär – Regression nicht möglich.");

		for (let j = 0; j < 2 * n; j++) {
			aug[col][j] /= pivot;
		}
		for (let row = 0; row < n; row++) {
			if (row !== col) {
				const factor = aug[row][col];
				for (let j = 0; j < 2 * n; j++) {
					aug[row][j] -= factor * aug[col][j];
				}
			}
		}
	}

	return aug.map((row) => row.slice(n));
}

/**
 * Approximate p-value for a two-tailed t-test.
 * Uses a simple approximation for large df.
 */
function tTestPValue(t: number, df: number): number {
	const absT = Math.abs(t);
	// Approximation using normal distribution for large df
	if (df > 30) {
		// Standard normal CDF approximation
		const z = absT;
		const p = 2 * (1 - normalCdf(z));
		return Math.max(p, 1e-10);
	}
	// For smaller df, use a rougher approximation
	const x = df / (df + absT * absT);
	const p = incompleteBeta(x, df / 2, 0.5);
	return Math.max(p, 1e-10);
}

function normalCdf(z: number): number {
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;
	const sign = z < 0 ? -1 : 1;
	const x = Math.abs(z) / Math.sqrt(2);
	const t = 1 / (1 + p * x);
	const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
	return 0.5 * (1 + sign * y);
}

function incompleteBeta(x: number, a: number, b: number): number {
	// Simple approximation using continued fraction
	if (x < 0 || x > 1) return 0;
	if (x === 0) return 0;
	if (x === 1) return 1;
	// Use series expansion for small x
	let sum = 0;
	let term = 1;
	for (let n = 0; n < 200; n++) {
		term *= (x * (a + b + n)) / ((a + 1 + n) * (1));
		if (n === 0) term = (x ** a * (1 - x) ** b) / a;
		sum += term;
		if (Math.abs(term) < 1e-12) break;
	}
	return Math.min(Math.max(sum, 0), 1);
}
