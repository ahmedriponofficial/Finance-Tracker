# Ledger: Vercel deploy (bundled)

Vercel installs every library when it builds, so the live site never
downloads from esm.sh or any other CDN. It loads faster and doesn't hit
cross-origin errors.

## Deploy through GitHub (recommended, works from a browser)
1. github.com -> **New repository** -> name it `ledger` -> Create.
2. **uploading an existing file** -> drag in everything from this folder,
   keeping the `src` folder -> **Commit changes**.
   On iPhone, switch Safari to "Request Desktop Website" first.
3. vercel.com -> **Add New -> Project** -> import `ledger` -> **Deploy**.
   Vercel detects Vite by itself; nothing to change.

Every later change: replace `src/App.jsx` on GitHub and Vercel redeploys.

## Or from a computer with Node installed
In this folder, run `npx vercel --prod`.

## Turn on accounts
1. In Supabase, run `supabase-setup.sql` (SQL Editor -> New query -> Run).
2. Edit `index.html`: fill in `supabaseUrl` and `supabaseAnonKey` in the
   LEDGER SETTINGS block. Commit, and Vercel redeploys.
3. Supabase -> Authentication -> URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

## Bring your current records across
Old site: Settings -> Export backup. New site: sign in -> Import backup.

## Privacy policy and account deletion (needed for the app stores)
1. **Run the SQL again.** `supabase-setup.sql` now also creates
   `delete_my_account()`, which Settings -> Account -> Delete account uses.
   It's safe to re-run over the earlier version.
2. **Your public privacy policy** is at `https://your-app.vercel.app/privacy.html`.
   Paste that address into App Store Connect and Google Play Console.
   It's also in the app: Settings -> Privacy -> Privacy policy, and on the
   sign-in screen.
3. **Add a contact email.** Both stores expect one. In `src/App.jsx`, search
   for `APP_CONTACT_EMAIL` and put your address between the quotes. Then
   ask me to regenerate `privacy.html`, which is built from the same text.
4. Google Play also asks for a **web page about deleting an account**. Use
   the same privacy.html address: its "Your rights" section explains how.
