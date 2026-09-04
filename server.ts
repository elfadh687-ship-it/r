import express from "express";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage configuration
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

interface ShortlinkRecord {
  id: number;
  user_id: string;
  title: string;
  short_slug: string;
  place_id: string | null;
  target_url: string | null;
  click_count: number;
  created_at: string;
  updated_at: string;
  click_logs: { timestamp: string; ip?: string }[];
}

interface UserRecord {
  id: string;
  email: string;
  password?: string;
  created_at: string;
}

interface LocalStore {
  users: UserRecord[];
  shortlinks: ShortlinkRecord[];
  lastId: number;
}

// Initial sample data so the app looks lively right away
const defaultStore: LocalStore = {
  users: [
    {
      id: "usr_demo_001",
      email: "elfadh687@gmail.com",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ],
  shortlinks: [
    {
      id: 1001,
      user_id: "usr_demo_001",
      title: "Kopi Kenangan Cab. Tebet",
      short_slug: "1001",
      place_id: "ChIJW9xK49TxaS4Rgq_Q_j3M1R8",
      target_url: "https://search.google.com/local/writereview?placeid=ChIJW9xK49TxaS4Rgq_Q_j3M1R8",
      click_count: 142,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      click_logs: Array.from({ length: 142 }).map((_, i) => ({
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)).toISOString(),
      })),
    },
    {
      id: 1002,
      user_id: "usr_demo_001",
      title: "Warung Pasta Grand Indonesia",
      short_slug: "1002",
      place_id: "ChIJk9Xw97TxaS4Rx8x3_kLM2F0",
      target_url: "https://search.google.com/local/writereview?placeid=ChIJk9Xw97TxaS4Rx8x3_kLM2F0",
      click_count: 89,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      click_logs: Array.from({ length: 89 }).map((_, i) => ({
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 86400000)).toISOString(),
      })),
    },
    {
      id: 1003,
      user_id: "usr_demo_001",
      title: "Bakmi GM Senopati",
      short_slug: "1003",
      place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      target_url: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      click_count: 57,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      click_logs: Array.from({ length: 57 }).map((_, i) => ({
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)).toISOString(),
      })),
    },
    {
      id: 1004,
      user_id: "usr_demo_001",
      title: "Stand Booth Event Mall Kelapa Gading (Belum Dikonfigurasi)",
      short_slug: "1004",
      place_id: null,
      target_url: null,
      click_count: 12,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      click_logs: Array.from({ length: 12 }).map((_, i) => ({
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 2 * 86400000)).toISOString(),
      })),
    },
  ],
  lastId: 1004,
};

// Ensure data folder and file exists
function readStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultStore, null, 2), "utf8");
      return defaultStore;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading store, falling back to in-memory default:", err);
    return defaultStore;
  }
}

function writeStore(store: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing store:", err);
  }
}

// Optional Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http"));
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

// Helper: compute target_url from place_id
function formatTargetUrl(placeId: string | null | undefined): string | null {
  if (!placeId || !placeId.trim()) return null;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`;
}

// Helper: get base host URL
function getBaseUrl(req: express.Request): string {
  const host = req.get("host") || `localhost:${PORT}`;
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  return `${protocol}://${host}`;
}

// -------------------------------------------------------------
// Core Feature: Redirection & Dynamic Shortlink (/r/:id)
// -------------------------------------------------------------
app.get("/r/:id", (req, res) => {
  const param = req.params.id;
  const store = readStore();
  
  // Find link by id (numeric) or short_slug
  const link = store.shortlinks.find(
    (item) => String(item.id) === param || item.short_slug.toLowerCase() === param.toLowerCase()
  );

  if (!link) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Shortlink Tidak Ditemukan - ReviewLink</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #F8FAFC;
            color: #1E293B;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 20px;
            padding: 40px 32px;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px -15px rgba(0, 92, 83, 0.1);
          }
          .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: #FEF2F2;
            color: #DC2626;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
          }
          h1 { font-size: 20px; margin: 0 0 8px; color: #0F172A; }
          p { color: #64748B; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
          a.btn {
            display: inline-block;
            background: #005C53;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🔍</div>
          <h1>Shortlink Tidak Ditemukan</h1>
          <p>Tautan review <strong>/r/${param}</strong> tidak terdaftar di sistem atau mungkin telah dihapus.</p>
          <a class="btn" href="/">Kembali ke Beranda</a>
        </div>
      </body>
      </html>
    `);
  }

  // Increment click count and log timestamp
  link.click_count = (link.click_count || 0) + 1;
  if (!link.click_logs) link.click_logs = [];
  link.click_logs.push({
    timestamp: new Date().toISOString(),
    ip: req.ip || req.socket.remoteAddress,
  });
  link.updated_at = new Date().toISOString();
  writeStore(store);

  // KONDISI A: Place ID terisi -> Redirect ke target_url
  if (link.place_id && link.place_id.trim()) {
    const targetUrl = link.target_url || formatTargetUrl(link.place_id);
    
    // If request specifies ?direct=1 or is a direct browser navigation
    // We provide a seamless auto-redirecting landing page with instant button
    // This guarantees compatibility even inside iFrames that block cross-origin top redirects!
    return res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mengarahkan ke Google Review - ${link.title}</title>
        <meta http-equiv="refresh" content="1;url=${targetUrl}" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #F8FAFC;
            color: #0F172A;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(0, 92, 83, 0.15);
            border-radius: 24px;
            padding: 44px 36px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 92, 83, 0.15);
          }
          .spinner {
            width: 52px;
            height: 52px;
            border: 4px solid rgba(0, 92, 83, 0.15);
            border-top-color: #005C53;
            border-radius: 50%;
            margin: 0 auto 24px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          h1 { font-size: 22px; font-weight: 700; margin: 0 0 10px; color: #005C53; }
          .sub { color: #64748B; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
          .dest {
            background: #F1F5F9;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 13px;
            color: #334155;
            font-weight: 500;
            margin-bottom: 24px;
            word-break: break-all;
          }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(135deg, #005C53 0%, #042f2e 100%);
            color: white;
            padding: 14px 28px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 10px 20px -5px rgba(0, 92, 83, 0.3);
            transition: transform 0.2s, background 0.2s;
          }
          .btn-primary:hover {
            transform: translateY(-1px);
            background: #00463f;
          }
          .tag {
            display: inline-block;
            background: #E6F4F1;
            color: #005C53;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 16px;
          }
        </style>
        <script>
          // Automatic redirection to Google Maps Review
          setTimeout(function() {
            window.location.href = "${targetUrl}";
          }, 400);
        </script>
      </head>
      <body>
        <div class="card">
          <div class="tag">Google Maps Review</div>
          <div class="spinner"></div>
          <h1>Membuka Formulir Review</h1>
          <p class="sub">Menghubungkan Anda ke halaman review resmi untuk <strong>${link.title}</strong>...</p>
          <div class="dest">📍 Place ID: ${link.place_id}</div>
          <a class="btn-primary" href="${targetUrl}" target="_top">
            Buka Halaman Review Sekarang &rarr;
          </a>
        </div>
      </body>
      </html>
    `);
  }

  // KONDISI B: Place ID kosong -> Tampilkan halaman khusus "Shortlink ini belum dikonfigurasi"
  // Sediakan form input Place ID -> Simpan -> Tampilkan tombol Lanjut ke Google Review
  return res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Konfigurasi Place ID - ${link.title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F8FAFC;
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 24px;
        }
        .card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: 40px 32px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 92, 83, 0.12), 0 0 0 1px rgba(0, 92, 83, 0.05);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FEF3C7;
          color: #92400E;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 22px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 8px;
        }
        .desc {
          color: #64748B;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 24px;
        }
        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }
        .input-row {
          position: relative;
          display: flex;
        }
        input[type="text"] {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          border: 1px solid #CBD5E1;
          border-radius: 12px;
          outline: none;
          background: #FFFFFF;
          color: #0F172A;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input[type="text"]:focus {
          border-color: #005C53;
          box-shadow: 0 0 0 3px rgba(0, 92, 83, 0.15);
        }
        .finder-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #005C53;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          margin-top: 8px;
        }
        .finder-link:hover {
          text-decoration: underline;
        }
        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #005C53 0%, #042f2e 100%);
          color: white;
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-submit:hover {
          opacity: 0.95;
        }
        .btn-submit:active {
          transform: scale(0.99);
        }
        .success-box {
          display: none;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          margin-top: 20px;
        }
        .success-box h3 {
          color: #065F46;
          margin: 0 0 6px;
          font-size: 16px;
        }
        .success-box p {
          color: #047857;
          font-size: 13px;
          margin: 0 0 16px;
        }
        .btn-review {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #005C53;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">
          ⚠️ Shortlink Ini Belum Dikonfigurasi
        </div>
        <h1>${link.title}</h1>
        <p class="desc">
          Shortlink <strong>/r/${link.short_slug}</strong> sudah aktif dan siap digunakan, tetapi belum dihubungkan dengan Google Maps Place ID tempat usaha Anda.
        </p>

        <form id="setupForm" onsubmit="handleSavePlaceId(event)">
          <div class="form-group">
            <label for="placeIdInput">Masukkan Google Maps Place ID:</label>
            <input 
              type="text" 
              id="placeIdInput" 
              placeholder="Contoh: ChIJW9xK49TxaS4Rgq_Q_j3M1R8" 
              required
            />
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <a 
                class="finder-link" 
                href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                🔍 Buka Google Place ID Finder &rarr;
              </a>
              <span style="font-size: 11px; color: #94A3B8;">Tab baru</span>
            </div>
          </div>

          <button type="submit" id="saveBtn" class="btn-submit">
            Simpan & Aktifkan Review Link
          </button>
        </form>

        <div id="successBox" class="success-box">
          <h3>✅ Berhasil Disimpan!</h3>
          <p>Link review Google Maps otomatis diperbarui tanpa mengubah URL shortlink ataupun QR Code yang sudah dicetak.</p>
          <a id="continueBtn" class="btn-review" href="#" target="_top">
            Lanjut ke Google Review &rarr;
          </a>
        </div>
      </div>

      <script>
        async function handleSavePlaceId(e) {
          e.preventDefault();
          const placeId = document.getElementById('placeIdInput').value.trim();
          if (!placeId) return;

          const saveBtn = document.getElementById('saveBtn');
          saveBtn.disabled = true;
          saveBtn.innerText = 'Menyimpan...';

          try {
            const res = await fetch('/api/shortlinks/${link.id}/set-place', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ place_id: placeId })
            });
            const data = await res.json();
            if (data.success) {
              document.getElementById('setupForm').style.display = 'none';
              const successBox = document.getElementById('successBox');
              successBox.style.display = 'block';
              document.getElementById('continueBtn').href = data.target_url;
            } else {
              alert(data.error || 'Gagal menyimpan Place ID');
              saveBtn.disabled = false;
              saveBtn.innerText = 'Simpan & Aktifkan Review Link';
            }
          } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan jaringan.');
            saveBtn.disabled = false;
            saveBtn.innerText = 'Simpan & Aktifkan Review Link';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Public route to update Place ID from the unassigned landing page
app.post("/api/shortlinks/:id/set-place", (req, res) => {
  const { place_id } = req.body;
  if (!place_id || typeof place_id !== "string" || !place_id.trim()) {
    return res.status(400).json({ error: "Place ID tidak boleh kosong" });
  }

  const store = readStore();
  const link = store.shortlinks.find(
    (item) => String(item.id) === req.params.id || item.short_slug === req.params.id
  );

  if (!link) {
    return res.status(404).json({ error: "Shortlink tidak ditemukan" });
  }

  const cleanedPlaceId = place_id.trim();
  link.place_id = cleanedPlaceId;
  link.target_url = formatTargetUrl(cleanedPlaceId);
  link.updated_at = new Date().toISOString();
  writeStore(store);

  return res.json({
    success: true,
    target_url: link.target_url,
    shortlink: link,
  });
});

// Auth Endpoints (Sign up, Login, Me)
app.post("/api/auth/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  const store = readStore();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: "Email sudah terdaftar. Silakan login." });
  }

  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    password: password,
    created_at: new Date().toISOString(),
  };

  store.users.push(newUser);
  writeStore(store);

  res.json({
    user: { id: newUser.id, email: newUser.email, created_at: newUser.created_at },
    token: `token_${newUser.id}`,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password, isDemo } = req.body;

  const store = readStore();

  if (isDemo) {
    let demoUser = store.users.find((u) => u.email === "elfadh687@gmail.com") || store.users[0];
    if (!demoUser) {
      demoUser = {
        id: "usr_demo_001",
        email: "elfadh687@gmail.com",
        created_at: new Date().toISOString(),
      };
      store.users.push(demoUser);
      writeStore(store);
    }
    return res.json({
      user: { id: demoUser.id, email: demoUser.email, created_at: demoUser.created_at },
      token: `token_${demoUser.id}`,
    });
  }

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || (user.password && user.password !== password)) {
    return res.status(401).json({ error: "Email atau password tidak sesuai." });
  }

  res.json({
    user: { id: user.id, email: user.email, created_at: user.created_at },
    token: `token_${user.id}`,
  });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  const store = readStore();

  if (!authHeader) {
    // Default to the first user or demo user
    const defaultUser = store.users[0] || {
      id: "usr_demo_001",
      email: "elfadh687@gmail.com",
      created_at: new Date().toISOString(),
    };
    return res.json({ user: defaultUser });
  }

  const token = authHeader.replace("Bearer ", "");
  const userId = token.replace("token_", "");
  const user = store.users.find((u) => u.id === userId) || store.users[0];

  if (!user) {
    return res.status(401).json({ error: "Sesi tidak valid." });
  }

  res.json({ user });
});

// Database / Supabase Status Endpoint
app.get("/api/db/status", (req, res) => {
  res.json({
    isConfigured: isSupabaseConfigured,
    mode: isSupabaseConfigured ? "supabase" : "local",
    url: supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, "").split(".")[0] + ".supabase.co" : undefined,
    message: isSupabaseConfigured
      ? "Terhubung ke Supabase Cloud (PostgreSQL + Auth)"
      : "Menggunakan High-Performance Persistent Local Store (Siap Digunakan)",
    sqlScript: `
-- Supabase SQL Schema setup for ReviewLink
CREATE TABLE IF NOT EXISTS public.shortlinks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_slug TEXT UNIQUE NOT NULL,
  place_id TEXT,
  target_url TEXT,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shortlinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shortlinks" 
ON public.shortlinks FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view and redirect shortlinks" 
ON public.shortlinks FOR SELECT 
USING (true);
    `.trim(),
  });
});

// Shortlinks CRUD
app.get("/api/shortlinks", (req, res) => {
  const store = readStore();
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const filter = typeof req.query.filter === "string" ? req.query.filter : "all";

  let items = [...store.shortlinks];

  // Search filter
  if (search) {
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        String(item.id).includes(search) ||
        item.short_slug.toLowerCase().includes(search) ||
        (item.place_id && item.place_id.toLowerCase().includes(search))
    );
  }

  // Status filter
  if (filter === "assigned") {
    items = items.filter((item) => Boolean(item.place_id && item.place_id.trim()));
  } else if (filter === "unassigned") {
    items = items.filter((item) => !item.place_id || !item.place_id.trim());
  }

  // Sort by newest
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    shortlinks: items,
    baseUrl: getBaseUrl(req),
  });
});

app.post("/api/shortlinks", (req, res) => {
  const { title, place_id, custom_slug } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Nama / Label shortlink wajib diisi." });
  }

  const store = readStore();

  // Generate next numeric ID
  store.lastId = (store.lastId || 1000) + 1;
  const newId = store.lastId;

  // Custom slug or default to ID
  let slug = String(newId);
  if (custom_slug && custom_slug.trim()) {
    const sanitizedSlug = custom_slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (sanitizedSlug) {
      // Check if already exists
      const exists = store.shortlinks.find((s) => s.short_slug.toLowerCase() === sanitizedSlug);
      if (exists) {
        return res.status(400).json({ error: `Short ID / Slug "${sanitizedSlug}" sudah digunakan.` });
      }
      slug = sanitizedSlug;
    }
  }

  const cleanedPlaceId = place_id && place_id.trim() ? place_id.trim() : null;
  const targetUrl = formatTargetUrl(cleanedPlaceId);

  const newLink: ShortlinkRecord = {
    id: newId,
    user_id: "usr_demo_001",
    title: title.trim(),
    short_slug: slug,
    place_id: cleanedPlaceId,
    target_url: targetUrl,
    click_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    click_logs: [],
  };

  store.shortlinks.unshift(newLink);
  writeStore(store);

  res.status(201).json({
    success: true,
    shortlink: newLink,
    message: "Shortlink berhasil dibuat!",
  });
});

app.put("/api/shortlinks/:id", (req, res) => {
  const idParam = req.params.id;
  const { title, place_id } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Nama / Label shortlink wajib diisi." });
  }

  const store = readStore();
  const link = store.shortlinks.find((item) => String(item.id) === idParam);

  if (!link) {
    return res.status(404).json({ error: "Shortlink tidak ditemukan." });
  }

  const cleanedPlaceId = place_id && place_id.trim() ? place_id.trim() : null;
  link.title = title.trim();
  link.place_id = cleanedPlaceId;
  // Requirement: "link review otomatis menyesuaikan di backend tanpa mengubah ID shortlink"
  link.target_url = formatTargetUrl(cleanedPlaceId);
  link.updated_at = new Date().toISOString();

  writeStore(store);

  res.json({
    success: true,
    shortlink: link,
    message: "Shortlink berhasil diperbarui!",
  });
});

app.delete("/api/shortlinks/:id", (req, res) => {
  const idParam = req.params.id;
  const store = readStore();
  const initialCount = store.shortlinks.length;
  store.shortlinks = store.shortlinks.filter((item) => String(item.id) !== idParam);

  if (store.shortlinks.length === initialCount) {
    return res.status(404).json({ error: "Shortlink tidak ditemukan." });
  }

  writeStore(store);
  res.json({ success: true, message: "Shortlink berhasil dihapus." });
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  const store = readStore();
  const links = store.shortlinks;

  const totalShortlinks = links.length;
  const totalClicks = links.reduce((acc, curr) => acc + (curr.click_count || 0), 0);
  const unassignedCount = links.filter((l) => !l.place_id || !l.place_id.trim()).length;

  // Top performing locations
  const topLocations = [...links]
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      title: l.title,
      short_slug: l.short_slug,
      click_count: l.click_count || 0,
      place_id: l.place_id,
    }));

  // Daily click trend for last 7 days
  const now = new Date();
  const clickTrends = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });

    // Count logs on that day
    let count = 0;
    links.forEach((l) => {
      if (l.click_logs) {
        l.click_logs.forEach((log) => {
          if (log.timestamp && log.timestamp.startsWith(dateStr)) {
            count++;
          }
        });
      }
    });

    clickTrends.push({
      date: dateStr,
      label: dayLabel,
      clicks: count,
    });
  }

  res.json({
    totalShortlinks,
    totalClicks,
    unassignedCount,
    topLocations,
    clickTrends,
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    isSupabaseConfigured,
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ReviewLink running on port ${PORT}`);
  });
}

startServer();
