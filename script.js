// 🔐 LOGIN SYSTEM (simple demo)
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "1234") {
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

    const data = {
        amount: parseFloat(document.getElementById("amount").value),
        transactions_per_hour: parseInt(document.getElementById("txns").value),
        hour: parseInt(document.getElementById("hour").value),
        location: document.getElementById("location").value
    };

    const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    // UI update
    if (result.status === "SAFE") {
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
}