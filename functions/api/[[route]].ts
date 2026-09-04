// Cloudflare Pages Function: API Route Handler
// Handles /api/* endpoints on Cloudflare Pages Edge

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

interface EventContext {
  request: Request;
  env: Env;
  params: { route: string[] };
}

const sampleShortlinks = [
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
  },
];

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function onRequest(context: EventContext): Promise<Response> {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const route = params.route ? params.route.join("/") : "";

  // Handle CORS Preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  const isSupabaseReady = Boolean(supabaseUrl && supabaseKey);

  // 1. /api/db/status
  if (route === "db/status") {
    return jsonResponse({
      isConfigured: isSupabaseReady,
      mode: isSupabaseReady ? "supabase" : "cloudflare_edge",
      url: supabaseUrl || undefined,
      message: isSupabaseReady
        ? "Terhubung ke Supabase Database di Cloudflare Edge."
        : "Berjalan di Cloudflare Pages Edge Runtime.",
    });
  }

  // 2. /api/auth/me
  if (route === "auth/me") {
    return jsonResponse({
      user: {
        id: "usr_cloudflare_edge",
        email: "admin@reviewlink.app",
        created_at: new Date().toISOString(),
      },
    });
  }

  // 3. /api/auth/login or /api/auth/register
  if (route === "auth/login" || route === "auth/register") {
    let body: any = {};
    try {
      body = await request.json();
    } catch {}
    return jsonResponse({
      token: "jwt_token_cloudflare_" + Date.now(),
      user: {
        id: "usr_cloudflare_" + Date.now(),
        email: body.email || "user@example.com",
        created_at: new Date().toISOString(),
      },
    });
  }

  // 4. /api/shortlinks
  if (route === "shortlinks" || route.startsWith("shortlinks/")) {
    const parts = route.split("/");
    const id = parts[1];

    if (method === "GET") {
      if (isSupabaseReady) {
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/shortlinks?select=*&order=created_at.desc`, {
            headers: {
              apikey: supabaseKey!,
              Authorization: `Bearer ${supabaseKey}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse({
              shortlinks: data,
              baseUrl: `${url.protocol}//${url.host}`,
            });
          }
        } catch (e) {
          console.error("Supabase fetch failed on Cloudflare:", e);
        }
      }

      return jsonResponse({
        shortlinks: sampleShortlinks,
        baseUrl: `${url.protocol}//${url.host}`,
      });
    }

    if (method === "POST") {
      const body: any = await request.json();
      const placeId = body.place_id?.trim() || null;
      const targetUrl = placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : null;
      const newSlug = body.custom_slug?.trim() || String(Math.floor(1000 + Math.random() * 9000));

      const newRecord = {
        id: Math.floor(Date.now() / 1000),
        user_id: "usr_cf",
        title: body.title || "Toko Baru",
        short_slug: newSlug,
        place_id: placeId,
        target_url: targetUrl,
        click_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseReady) {
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/shortlinks`, {
            method: "POST",
            headers: {
              apikey: supabaseKey!,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(newRecord),
          });
          if (res.ok) {
            const created = await res.json();
            return jsonResponse({ shortlink: created[0] || newRecord }, 201);
          }
        } catch (e) {
          console.error("Supabase create failed:", e);
        }
      }

      return jsonResponse({ shortlink: newRecord }, 201);
    }

    if (method === "PUT" && id) {
      const body: any = await request.json();
      const placeId = body.place_id !== undefined ? (body.place_id?.trim() || null) : undefined;
      const targetUrl = placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : (placeId === null ? null : undefined);

      if (isSupabaseReady) {
        try {
          const updatePayload: any = { updated_at: new Date().toISOString() };
          if (body.title) updatePayload.title = body.title;
          if (placeId !== undefined) {
            updatePayload.place_id = placeId;
            updatePayload.target_url = targetUrl;
          }
          await fetch(`${supabaseUrl}/rest/v1/shortlinks?id=eq.${id}`, {
            method: "PATCH",
            headers: {
              apikey: supabaseKey!,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayload),
          });
        } catch (e) {
          console.error("Supabase update failed:", e);
        }
      }

      return jsonResponse({ success: true });
    }

    if (method === "DELETE" && id) {
      if (isSupabaseReady) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/shortlinks?id=eq.${id}`, {
            method: "DELETE",
            headers: {
              apikey: supabaseKey!,
              Authorization: `Bearer ${supabaseKey}`,
            },
          });
        } catch (e) {
          console.error("Supabase delete failed:", e);
        }
      }
      return jsonResponse({ success: true });
    }
  }

  // 5. /api/analytics
  if (route === "analytics") {
    let links = sampleShortlinks;
    if (isSupabaseReady) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/shortlinks?select=*`, {
          headers: {
            apikey: supabaseKey!,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });
        if (res.ok) {
          links = await res.json();
        }
      } catch (e) {}
    }

    const totalShortlinks = links.length;
    const totalClicks = links.reduce((sum: number, item: any) => sum + (item.click_count || 0), 0);
    const unassignedCount = links.filter((item: any) => !item.place_id || !item.place_id.trim()).length;

    const topLocations = [...links]
      .sort((a: any, b: any) => (b.click_count || 0) - (a.click_count || 0))
      .slice(0, 5)
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        short_slug: item.short_slug,
        click_count: item.click_count || 0,
        place_id: item.place_id,
      }));

    // Mock trend dates
    const clickTrends = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      return {
        date: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
        clicks: Math.floor(Math.random() * 30) + 5,
      };
    });

    return jsonResponse({
      totalShortlinks,
      totalClicks,
      unassignedCount,
      topLocations,
      clickTrends,
    });
  }

  return jsonResponse({ error: "Endpoint not found" }, 404);
}
