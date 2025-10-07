document.getElementById("generateBtn").addEventListener("click", async () => {
  const sheetLink = document.getElementById("sheetLink").value.trim();
  const status = document.getElementById("status");
  if (!sheetLink) {
    status.textContent = "⚠️ Vui lòng nhập link Google Sheet!";
    return;
  }

  // Lấy ID của Sheet từ link
  const match = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    status.textContent = "❌ Link không hợp lệ!";
    return;
  }

  const sheetId = match[1];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  status.textContent = "⏳ Đang tải dữ liệu từ Google Sheet...";

  try {
    const res = await fetch(csvUrl);
    const csvText = await res.text();

    // Chuyển CSV → mảng dòng
    const rows = csvText.split("\n").map(r => r.split(","));
    const headers = rows.shift(); // Dòng đầu tiên (tên cột)

    // Tạo file .txt cho Anki
    let output = "";
    for (const row of rows) {
      const [H, A, B, C, D, E, F] = row.map(c => c.trim());
      const front = `
<div class="mcq-card">
  <div class="lesson">📘 ${H}</div>
  <div class="question">${A}</div>
  <div class="options">
    <div>A. ${B}</div>
    <div>B. ${C}</div>
    <div>C. ${D}</div>
    <div>D. ${E}</div>
  </div>
</div>
      `.trim();

      const back = `✅ Đáp án đúng là: ${F}`;
      output += `${front}\t${back}\n`;
    }

    // Tạo file và tải xuống
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "anki_cards.txt";
    link.click();

    status.textContent = "✅ Tạo thành công file anki_cards.txt!";
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Lỗi khi đọc Google Sheet!";
  }
});
