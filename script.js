const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHjYdKL-DbXDzp19ukPoJwYJgDYcayWc2wJG4Ho23uReMI3uBAHAgD7PfhaOFdj0it2R88XDF5pEqk/pub?output=csv";
const GOAL = 15000000;

const money = (value) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);

const numberOnly = (raw) => {
  if (raw === null || raw === undefined) return 0;
  const str = String(raw).trim();
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.-]/g, "");
  const num = Number(cleaned || 0);
  return Number.isFinite(num) ? num : 0;
};

function getKeyFromCandidates(obj, candidates) {
  const keys = Object.keys(obj);
  for (const pattern of candidates) {
    const match = keys.find((key) => {
      const normalized = String(key).trim();
      return normalized.includes(pattern);
    });
    if (match) return match;
  }
  return null;
}

function normalizeRows(rows) {
  return rows.map((row) => {
    const normalized = {};
    Object.keys(row).forEach((key) => {
      normalized[String(key).trim()] = row[key];
    });
    return normalized;
  });
}

function renderTable(rows, columnKeys) {
  const thead = document.querySelector("#salesTable thead");
  const tbody = document.querySelector("#salesTable tbody");

  const visibleHeaders = columnKeys.slice(0, 8);
  thead.innerHTML = "<tr>" + visibleHeaders.map((h) => `<th>${h}</th>`).join("") + "</tr>";

  tbody.innerHTML = rows.slice(0, 20).map((row) => {
    const cells = visibleHeaders.map((key) => `<td>${row[key] ?? ""}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
}

function renderBarChart(canvasId, labels, values, color) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (window[`${canvasId}Chart`]) {
    window[`${canvasId}Chart`].destroy();
  }

  window[`${canvasId}Chart`] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "매출",
        data: values,
        backgroundColor: color,
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: (value) => money(value),
          },
        },
      },
    },
  });
}

function loadData() {
  fetch(SHEET_URL)
    .then((res) => res.text())
    .then((csvText) => {
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (!parsed.data || parsed.data.length === 0) {
        alert("데이터가 비어 있습니다.");
        return;
      }

      const rows = normalizeRows(parsed.data);
      const firstRow = rows[0];
      const columnKeys = Object.keys(firstRow);

      const salesKey = getKeyFromCandidates(firstRow, [
        "매출",
        "금액",
        "총액",
        "결제금액",
        "판매금액",
        "금액합계",
      ]) || columnKeys.find((key) => /매출|금액|총액|결제/.test(key));

      const dateKey = getKeyFromCandidates(firstRow, [
        "날짜",
        "일자",
        "일시",
      ]) || columnKeys.find((key) => /날짜|일자|일시/.test(key));

      const nameKey = getKeyFromCandidates(firstRow, [
        "담당자",
        "사원",
        "이름",
        "판매자",
      ]) || columnKeys.find((key) => /담당자|사원|이름|판매자/.test(key));

      const salesValues = rows.map((row) => numberOnly(row[salesKey])).filter((v) => v > 0);
      const totalSales = salesValues.reduce((sum, value) => sum + value, 0);
      const totalCount = salesValues.length;
      const avgSales = totalCount ? totalSales / totalCount : 0;
      const goalRate = (totalSales / GOAL) * 100;

      document.getElementById("total-sales").textContent = money(totalSales);
      document.getElementById("total-count").textContent = totalCount.toLocaleString();
      document.getElementById("avg-sales").textContent = money(avgSales);
      document.getElementById("target-rate").textContent = `${goalRate.toFixed(1)}%`;
      document.getElementById("target-remaining").textContent = `목표 잔액: ${money(GOAL - totalSales)}`;
      document.getElementById("sales-trend").textContent = totalCount ? `최근 ${totalCount}건` : "데이터 없음";

      const dateMap = {};
      rows.forEach((row) => {
        const date = String(row[dateKey] ?? "").trim();
        if (!date) return;
        const amount = numberOnly(row[salesKey]);
        if (!dateMap[date]) dateMap[date] = 0;
        dateMap[date] += amount;
      });

      const personMap = {};
      rows.forEach((row) => {
        const name = String(row[nameKey] ?? "").trim();
        if (!name) return;
        const amount = numberOnly(row[salesKey]);
        if (!personMap[name]) personMap[name] = 0;
        personMap[name] += amount;
      });

      renderBarChart(
        "salesChart",
        Object.keys(dateMap),
        Object.values(dateMap),
        "#2563eb"
      );

      renderBarChart(
        "personChart",
        Object.keys(personMap),
        Object.values(personMap),
        "#10b981"
      );

      renderTable(rows, columnKeys);
    })
    .catch((err) => {
      console.error(err);
      alert("CSV를 불러오지 못했습니다. 공개 URL을 확인해 주세요.");
    });
}

loadData();
