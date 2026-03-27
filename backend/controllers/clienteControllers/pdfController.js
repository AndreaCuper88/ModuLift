const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const generatePianoAlimentarePdf = async (req, res) => {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ message: "Piano mancante" });

    const logoPath = path.join(__dirname, "../../assets/ModuLift_Logo.png");
    const logoBase64 = fs.existsSync(logoPath)
        ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
        : null;

    const mealsHtml = plan.meals.map((meal, idx) => `
        <div class="meal-block">
            <div class="meal-name">${meal.name || `Pasto ${idx + 1}`}</div>
            <p class="meal-text">${meal.notes || "Nessuna nota"}</p>
        </div>
    `).join("");

    const html = `<!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8" />
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                color: #1a1a1a;
                background: #ffffff;
                padding: 52px 60px;
                font-size: 13px;
            }

            /* HEADER */
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #1a1a1a;
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .brand img {
                height: 36px;
                width: auto;
            }
            .brand-name {
                font-size: 20px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .header-meta {
                text-align: right;
            }
            .header-meta .doc-title {
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                color: #555;
            }
            .header-meta .doc-date {
                font-size: 11px;
                color: #999;
                margin-top: 3px;
            }

            /* PIANO TITLE */
            .plan-label {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #999;
                margin-bottom: 6px;
            }
            .plan-title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 36px;
                line-height: 1.2;
            }

            /* SECTION */
            .section-label {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #999;
                margin-bottom: 18px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }

            /* MEALS */
            .meals-section { margin-bottom: 36px; }

            .meal-block { margin-bottom: 22px; }
            .meal-name {
                font-size: 13px;
                font-weight: 700;
                margin-bottom: 5px;
                color: #1a1a1a;
            }
            .meal-text {
                font-size: 12.5px;
                line-height: 1.75;
                color: #444;
                white-space: pre-line;
                padding-left: 12px;
                border-left: 2px solid #e5e7eb;
            }

            /* NOTE */
            .note-section { margin-bottom: 36px; }
            .note-block { margin-bottom: 22px; }
            .note-title {
                font-size: 13px;
                font-weight: 700;
                margin-bottom: 5px;
                color: #1a1a1a;
            }
            .note-text {
                font-size: 12.5px;
                line-height: 1.75;
                color: #444;
                white-space: pre-line;
                padding-left: 12px;
                border-left: 2px solid #e5e7eb;
            }

            /* FOOTER */
            .footer {
                margin-top: 48px;
                display: flex;
                justify-content: space-between;
                border-top: 1px solid #e5e7eb;
                padding-top: 10px;
            }
            .footer span {
                font-size: 10px;
                color: #bbb;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }
        </style>
    </head>
    <body>

        <div class="header">
            <div class="brand">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" />` : ""}
                <span class="brand-name">ModuLift</span>
            </div>
            <div class="header-meta">
                <div class="doc-title">Piano Alimentare</div>
                <div class="doc-date">${new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</div>
            </div>
        </div>

        <div class="plan-label">Piano attivo</div>
        <div class="plan-title">${plan.title}</div>

        <div class="meals-section">
            <div class="section-label">Pasti</div>
            ${mealsHtml}
        </div>

        <div class="note-section">
            <div class="section-label">Note</div>
            <div class="note-block">
                <div class="note-title">Commenti</div>
                <div class="note-text">${plan.comments || "Nessun commento"}</div>
            </div>
            <div class="note-block">
                <div class="note-title">Raccomandazioni</div>
                <div class="note-text">${plan.recommendations || "Nessuna raccomandazione"}</div>
            </div>
        </div>

        <div class="footer">
            <span>ModuLift</span>
            <span>Documento generato automaticamente</span>
        </div>

    </body>
    </html>`;

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "15mm", bottom: "20mm", left: "0mm", right: "0mm" },
        });
        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="piano-alimentare.pdf"`,
            "Content-Length": pdfBuffer.length,
        });
        res.end(pdfBuffer);

    } catch (e) {
        console.error("Puppeteer error:", e);
        res.status(500).json({ message: "Errore generazione PDF" });
    }
};

module.exports = { generatePianoAlimentarePdf };