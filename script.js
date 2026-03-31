// 🔐 LOGIN SYSTEM (simple demo)
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("loggedIn", "true"); // session
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("error").innerText = "Invalid login!";
    }
}

// 📊 Charts setup
let riskData = [];
let labels = [];
let fraudCount = 0;
let safeCount = 0;

let riskChart;
let pieChart;

window.onload = function () {

    // 🔐 Protect dashboard
    if (document.getElementById("riskChart") && !localStorage.getItem("loggedIn")) {
        window.location.href = "login.html";
        return;
    }

    if (document.getElementById("riskChart")) {

        const ctx = document.getElementById("riskChart").getContext("2d");
        riskChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Risk %",
                    data: riskData
                }]
            }
        });

        const pctx = document.getElementById("pieChart").getContext("2d");
        pieChart = new Chart(pctx, {
            type: "pie",
            data: {
                labels: ["Safe", "Fraud"],
                datasets: [{
                    data: [safeCount, fraudCount]
                }]
            }
        });
    }
};

// 🚀 MAIN FUNCTION
async function checkFraud() {

    const resultBox = document.getElementById("result");
    const detailsBox = document.getElementById("details");

    resultBox.innerHTML = "⏳ Checking...";
    detailsBox.innerHTML = "";

    // ✅ Convert location to numeric
    const locValue = document.getElementById("location").value;
    const location = locValue === "IN" ? 0 : 1;

    const data = {
        amount: Number(document.getElementById("amount").value),
        freq: Number(document.getElementById("txns").value), // FIXED
        hour: Number(document.getElementById("hour").value),
        location: location
    };

    try {
        const res = await fetch("https://frauddetectorbackend.onrender.com/predict", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.error) {
            resultBox.innerHTML = "❌ " + result.error;
            resultBox.className = "fraud";
            return;
        }

        // ✅ UI update (FIXED)
        if (result.decision === "ALLOW") {
            resultBox.innerHTML = "✅ SAFE";
            resultBox.className = "safe";
            safeCount++;
        } else {
            resultBox.innerHTML = "🚨 FRAUD";
            resultBox.className = "fraud";
            fraudCount++;
        }

        detailsBox.innerHTML = `
            Risk Score: ${result.risk_score}% <br>
            Reasons: ${result.reasons.join(", ")}
        `;

        // 📈 Update Graph
        riskData.push(result.risk_score);
        labels.push("T" + (labels.length + 1));
        riskChart.update();

        // 📊 Update Pie
        pieChart.data.datasets[0].data = [safeCount, fraudCount];
        pieChart.update();

    } catch (err) {
        resultBox.innerHTML = "⚠️ Server not reachable";
        resultBox.className = "fraud";
    }
}

// 🔓 LOGOUT
function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}
