const express = require("express");
const fs = require("fs-extra");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "db.json";

// Charger DB
function loadDB() {
    return fs.readJsonSync(DB_FILE, { throws: false }) || {};
}

// Sauvegarder DB
function saveDB(data) {
    fs.writeJsonSync(DB_FILE, data, { spaces: 2 });
}

// 🔴 SIGNALER
app.post("/signaler", (req, res) => {
    const { numero, raison } = req.body;

    let db = loadDB();

    if (!db[numero]) {
        db[numero] = {
            signalements: 0,
            raisons: []
        };
    }

    db[numero].signalements++;
    db[numero].raisons.push(raison);

    saveDB(db);

    res.json({
        message: "🚨 Signalé",
        total: db[numero].signalements
    });
});

// 🔍 VERIFIER
app.get("/verifier/:numero", (req, res) => {
    let db = loadDB();
    const numero = req.params.numero;

    const data = db[numero] || {
        signalements: 0,
        raisons: []
    };

    let score = data.signalements * 20;
    if (score > 100) score = 100;

    let statut = "✅ SÛR";
    if (score >= 40) statut = "⚠️ SUSPECT";
    if (score >= 80) statut = "🚫 ARNAQUEUR";

    res.json({
        numero,
        signalements: data.signalements,
        score,
        statut,
        raisons: data.raisons
    });
});

// 🌍 TOP
app.get("/top", (req, res) => {
    let db = loadDB();

    const classement = Object.entries(db)
        .sort((a, b) => b[1].signalements - a[1].signalements)
        .slice(0, 10);

    res.json(classement);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Serveur lancé sur " + PORT));
