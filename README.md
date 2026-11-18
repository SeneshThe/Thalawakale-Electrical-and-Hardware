# Thalawakale Electrical & Hardware

Online catalog and storefront for **Thalawakale Electrical & Hardware** (No. 42, Main Street, Thalawakale 22100, Sri Lanka), priced in LKR (incl. 18% VAT).

## Local Development

```bash
npm install
npm run dev
```

Runs the storefront on `http://localhost:3000`.

### Build & Type-Check

```bash
npm run lint
npm run build
```

## Hosting on GitHub Pages

This project is preconfigured with a relative Vite `base` (`./`), subpath-safe image URLs, `.nojekyll`, a `404.html` SPA fallback, and a GitHub Actions deployment workflow (`.github/workflows/deploy.yml`).

### 1. Push to a GitHub repository

```bash
git init
git add .
git commit -m "Initial commit: Thalawakale Electrical & Hardware storefront"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Open your repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. The included workflow builds the Vite site and publishes it automatically at `https://<your-username>.github.io/<your-repo>/`.

### 3. Enable Google Sign-In on your GitHub Pages URL (Firebase Auth)

If you use Google Sign-In from the hosted GitHub Pages domain:
1. Open the [Firebase Console](https://console.firebase.google.com/) for project `ai-studio-voltgearelectric-175813fd-7f34-4994-9414-15e5ecbb381c`.
2. Go to **Authentication → Settings → Authorized domains**.
3. Add `<your-username>.github.io`.
