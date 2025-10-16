// Eta templates embedded as strings (no runtime FS).
// Keep them tiny and HTML-first.

export const BaseLayout = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><%= it.title || "Stadli Admin" %></title>
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="Referrer-Policy" content="no-referrer" />
    <meta name="color-scheme" content="light dark" />
    <!-- Tailwind via CDN; no build step -->
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="min-h-screen bg-gray-50 text-gray-900">
    <header class="border-b bg-white">
      <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a class="font-semibold" href="/">Stadli Admin</a>
        <nav class="text-sm space-x-4">
          <a class="hover:underline" href="/home">Home</a>
          <a class="hover:underline" href="/web">Web</a>
          <a class="hover:underline" href="/crm">CRM</a>
          <a class="hover:underline" href="/campaigns">Campaigns</a>
          <a class="hover:underline" href="/analytics">Analytics</a>
          <a class="hover:underline" href="/commerce">Commerce</a>
          <a class="hover:underline" href="/settings">Settings</a>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6">
      <%- it.body %>
    </main>
    <footer class="mx-auto max-w-6xl px-4 py-8 text-xs text-gray-500">
      © <span id="y"></span> Stadli. Minimal Cloudflare Stack.
      <script>document.getElementById('y').textContent=new Date().getFullYear()</script>
    </footer>
  </body>
</html>`;

export const HomePage = `<section class="space-y-6">
  <h1 class="text-2xl font-semibold">Product Summary</h1>
  <p class="text-gray-700 max-w-3xl"><%= it.summary.description %></p>
  <div class="grid md:grid-cols-2 gap-4">
    <% it.summary.cores.forEach(core => { %>
      <article class="rounded-xl border bg-white p-4">
        <h2 class="font-semibold"><%= core.name %></h2>
        <p class="text-sm text-gray-700"><%= core.description %></p>
      </article>
    <% }) %>
  </div>
</section>`;

export const NotFound = `<section class="space-y-4">
  <h1 class="text-2xl font-semibold">Not found</h1>
  <p>That page does not exist.</p>
  <p><a class="underline" href="/">Go home</a></p>
</section>`;
