# Panduan Deploy ReviewLink ke Cloudflare Pages

Aplikasi **ReviewLink** telah disesuaikan secara khusus agar siap di-hosting langsung di **Cloudflare Pages** dengan dukungan **Cloudflare Pages Functions (Edge Runtime)** untuk pengalihan dynamic shortlink `/r/:id` dan pembaruan Google Place ID secara instan di edge global Cloudflare.

---

## 🚀 Opsi 1: Deploy Otomatis via GitHub (Sangat Direkomendasikan)

Setiap kali Anda melakukan push kode ke GitHub, Cloudflare Pages akan otomatis mem-build dan men-deploy web Anda secara gratis.

### Langkah-langkah:
1. **Push Repository ke GitHub**
   - Buat repository baru di GitHub (misal: `reviewlink`).
   - Push seluruh kode proyek ini ke repository tersebut.

2. **Buka Cloudflare Dashboard**
   - Masuk ke [dash.cloudflare.com](https://dash.cloudflare.com).
   - Di menu sebelah kiri, pilih **Workers & Pages** -> **Create application** -> Tab **Pages** -> **Connect to Git**.
   - Pilih repository GitHub Anda (`reviewlink`).

3. **Pengaturan Build (Build Settings)**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build:pages` (atau `vite build`)
   - **Build output directory**: `dist`
   - **Root directory**: `/` (biarkan kosong / default)

4. **Environment Variables (Opsional untuk Database Supabase)**:
   Di menu *Environment variables (advanced)*, tambahkan:
   - `SUPABASE_URL`: URL project Supabase Anda (contoh: `https://xyzcompany.supabase.co`)
   - `SUPABASE_ANON_KEY`: Anon / public key Supabase Anda

5. **Klik "Save and Deploy"**
   - Tunggu sekitar 1-2 menit hingga build selesai.
   - Cloudflare akan memberikan domain gratis: `https://reviewlink.pages.dev`.
   - Anda juga bisa menautkan custom domain Anda sendiri (misal: `link.restoku.com` atau `review.toko.id`) secara gratis dengan SSL otomatis!

---

## ⚡ Opsi 2: Deploy Cepat via Terminal (Cloudflare Wrangler CLI)

Jika Anda ingin langsung men-deploy dari laptop/komputer tanpa perlu push ke GitHub:

1. **Install Wrangler (jika belum)**:
   ```bash
   npm install -g wrangler
   ```

2. **Login ke Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Build Frontend**:
   ```bash
   npm run build:pages
   ```

4. **Deploy ke Cloudflare Pages**:
   ```bash
   npx wrangler pages deploy dist --project-name=reviewlink
   ```
   Terminal akan langsung memberikan URL live Cloudflare Pages Anda!

---

## 📁 File Konfigurasi yang Sudah Disediakan

Proyek ini telah dilengkapi dengan:
1. **`wrangler.toml`**: File konfigurasi utama Cloudflare Pages / Workers dengan `nodejs_compat`.
2. **`public/_redirects`**: Menjamin Single Page Application (SPA) routing berjalan mulus tanpa error 404 saat refresh halaman.
3. **`public/_headers`**: Header keamanan HTTP dan optimasi CDN cache Cloudflare untuk aset statis.
4. **`/functions/r/[id].ts`**: Cloudflare Pages Function untuk redirect dynamic `/r/:id` di edge network Cloudflare:
   - Jika Place ID sudah ada: langsung mengarahkan ke form Google Review toko Anda.
   - Jika Place ID belum ada: menampilkan formulir input Place ID ramah pengguna.
   - Otomatis mencatat klik di Supabase.
5. **`/functions/api/[[route]].ts`**: Cloudflare Edge API router untuk sinkronisasi data shortlink dan analitik.
6. **`package.json`**: Tersedia script `npm run build:pages` dan `npm run deploy:cloudflare`.

---

## 🌐 Menambahkan Custom Domain Sendiri di Cloudflare
1. Buka project Pages Anda di Cloudflare Dashboard.
2. Klik tab **Custom domains** -> **Set up a custom domain**.
3. Masukkan domain/subdomain Anda (misal: `review.namabisnis.com`).
4. Cloudflare otomatis menerbitkan sertifikat SSL HTTPS gratis!
