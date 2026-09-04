// Cloudflare Pages Function: Dynamic Shortlink Edge Redirection
// Route: /r/:id

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

interface EventContext {
  params: { id: string };
  request: Request;
  env: Env;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const { params, request, env } = context;
  const slug = params.id;
  const url = new URL(request.url);

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;

  let link: {
    id: number | string;
    title: string;
    short_slug: string;
    place_id: string | null;
    target_url: string | null;
    click_count?: number;
  } | null = null;

  // 1. Try fetching from Supabase if configured
  if (supabaseUrl && supabaseKey) {
    try {
      const isNumeric = /^\d+$/.test(slug);
      const queryParam = isNumeric 
        ? `or=(id.eq.${slug},short_slug.eq.${slug})`
        : `short_slug=eq.${slug}`;

      const res = await fetch(`${supabaseUrl}/rest/v1/shortlinks?${queryParam}&select=*&limit=1`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        const rows: any[] = await res.json();
        if (rows && rows.length > 0) {
          link = rows[0];

          // Increment click count asynchronously at the edge
          const newCount = (link.click_count || 0) + 1;
          fetch(`${supabaseUrl}/rest/v1/shortlinks?id=eq.${link.id}`, {
            method: 'PATCH',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              click_count: newCount,
              updated_at: new Date().toISOString(),
            }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Error fetching shortlink on Cloudflare Edge:', err);
    }
  }

  // 2. Fallback sample links if Supabase is not yet populated
  if (!link) {
    const sampleLinks: Record<string, { title: string; place_id: string | null }> = {
      '1001': { title: 'Kopi Kenangan Cab. Tebet', place_id: 'ChIJW9xK49TxaS4Rgq_Q_j3M1R8' },
      '1002': { title: 'Warung Pasta Grand Indonesia', place_id: 'ChIJk9Xw97TxaS4Rx8x3_kLM2F0' },
      '1003': { title: 'Bakmi GM Senopati', place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4' },
      '1004': { title: 'Stand Booth Event Mall Kelapa Gading', place_id: null },
    };

    if (sampleLinks[slug]) {
      link = {
        id: slug,
        title: sampleLinks[slug].title,
        short_slug: slug,
        place_id: sampleLinks[slug].place_id,
        target_url: sampleLinks[slug].place_id
          ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(sampleLinks[slug].place_id)}`
          : null,
      };
    }
  }

  // Not found
  if (!link) {
    return new Response(
      `<!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Shortlink Tidak Ditemukan - ReviewLink</title>
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
          }
          .card {
            background: white;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 20px;
            padding: 40px 32px;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px -15px rgba(0, 92, 83, 0.1);
          }
          .icon { font-size: 36px; margin-bottom: 16px; }
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
          <p>Tautan review <strong>/r/${slug}</strong> tidak terdaftar di sistem atau mungkin telah dihapus.</p>
          <a class="btn" href="/">Kembali ke Beranda</a>
        </div>
      </body>
      </html>`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // KONDISI A: Place ID Terisi -> Redirect ke Google Maps Review
  if (link.place_id && link.place_id.trim()) {
    const targetUrl = link.target_url || `https://search.google.com/local/writereview?placeid=${encodeURIComponent(link.place_id.trim())}`;
    
    // Auto redirect HTML page with meta refresh and instant JS
    return new Response(
      `<!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mengarahkan ke Google Review - ${link.title}</title>
        <meta http-equiv="refresh" content="1;url=${targetUrl}" />
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
          }
          .card {
            background: white;
            border: 1px solid rgba(0, 92, 83, 0.15);
            border-radius: 24px;
            padding: 44px 36px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 92, 83, 0.15);
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(0, 92, 83, 0.15);
            border-top-color: #005C53;
            border-radius: 50%;
            margin: 0 auto 24px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          h1 { font-size: 22px; font-weight: 700; margin: 0 0 10px; color: #005C53; }
          .sub { color: #64748B; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #005C53 0%, #70A9A1 100%);
            color: white;
            padding: 14px 28px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 10px 20px -5px rgba(0, 92, 83, 0.3);
          }
          .badge {
            display: inline-block;
            background: #E6F4F1;
            color: #005C53;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
          }
        </style>
        <script>
          setTimeout(function() {
            window.location.href = "${targetUrl}";
          }, 350);
        </script>
      </head>
      <body>
        <div class="card">
          <div class="badge">CLOUDFLARE EDGE REDIRECT</div>
          <div class="spinner"></div>
          <h1>Membuka Formulir Review</h1>
          <p class="sub">Menghubungkan Anda ke halaman review resmi untuk <strong>${link.title}</strong>...</p>
          <a class="btn-primary" href="${targetUrl}" target="_top">
            Buka Halaman Review Sekarang &rarr;
          </a>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // KONDISI B: Place ID Belum Terisi -> Form Konfigurasi Place ID
  return new Response(
    `<!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Konfigurasi Shortlink - ${link.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
        }
        .card {
          background: white;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 24px;
          padding: 36px 32px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.1);
        }
        .tag-warning {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 999px;
          margin-bottom: 16px;
        }
        h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #0F172A; }
        p.desc { font-size: 13px; color: #64748B; margin: 0 0 20px; line-height: 1.6; }
        .input-group { margin-bottom: 16px; }
        label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: #334155; }
        input[type="text"] {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #CBD5E1;
          font-size: 14px;
          outline: none;
          font-family: monospace;
        }
        input[type="text"]:focus {
          border-color: #005C53;
          box-shadow: 0 0 0 3px rgba(0, 92, 83, 0.15);
        }
        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #005C53 0%, #70A9A1 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(0, 92, 83, 0.25);
        }
        .helper-box {
          margin-top: 20px;
          padding: 14px;
          border-radius: 12px;
          background: #F8FAFC;
          border: 1px dashed #CBD5E1;
          font-size: 12px;
          color: #475569;
        }
        .helper-box a { color: #005C53; font-weight: 700; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="tag-warning">⚠️ Belum Dikonfigurasi</div>
        <h1>Tautkan Google Place ID</h1>
        <p class="desc">Shortlink <strong>/r/${slug}</strong> untuk <em>"${link.title}"</em> siap digunakan. Masukkan Google Place ID lokasi bisnis Anda agar pengunjung diarahkan langsung ke form ulasan resmi.</p>
        
        <form method="POST" action="/r/${slug}">
          <div class="input-group">
            <label for="place_id">Google Place ID Bisnis Anda:</label>
            <input 
              id="place_id" 
              name="place_id" 
              type="text" 
              required 
              placeholder="Contoh: ChIJW9xK49TxaS4Rgq_Q_j3M1R8" 
            />
          </div>
          <button type="submit" class="btn-submit">
            Simpan & Buka Halaman Review
          </button>
        </form>

        <div class="helper-box">
          Belum tahu Place ID toko Anda? Gunakan alat resmi: <br />
          <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener">
            Buka Google Place ID Finder &rarr;
          </a>
        </div>
      </div>
    </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

// Handler for POST /r/:id to update Place ID from the configuration form
export async function onRequestPost(context: EventContext): Promise<Response> {
  const { params, request, env } = context;
  const slug = params.id;

  try {
    const formData = await request.formData();
    const placeId = formData.get('place_id')?.toString().trim();

    if (!placeId) {
      return new Response('Place ID wajib diisi', { status: 400 });
    }

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const targetUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
      const isNumeric = /^\d+$/.test(slug);
      const queryParam = isNumeric 
        ? `or=(id.eq.${slug},short_slug.eq.${slug})`
        : `short_slug=eq.${slug}`;

      await fetch(`${supabaseUrl}/rest/v1/shortlinks?${queryParam}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place_id: placeId,
          target_url: targetUrl,
          updated_at: new Date().toISOString(),
        }),
      });
    }

    // Redirect to the newly updated target URL
    const targetUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
    return Response.redirect(targetUrl, 302);
  } catch (err: any) {
    return new Response(`Gagal menyimpan konfigurasi: ${err?.message}`, { status: 500 });
  }
}
