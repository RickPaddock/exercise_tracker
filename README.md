# Abs Challenge Tracker

A small web app that tracks progress in **Igor Voitenko’s 28-Day Abs Challenge**.  
You can set a start date, add participants, and mark off daily workouts.  
Built with **React** + **Tailwind CSS**, hosted on **Netlify**.

<img width="2490" height="1194" alt="image" src="https://github.com/user-attachments/assets/f180ca3f-755b-4e85-a7e9-cc9a7fba3203" />

---

## 📂 Project Structure

- **`src/App.js`** → Main React component containing app logic, participant tracking, and UI.  
- **`src/index.js`** → React entry point; mounts `App` into the browser DOM.  
- **`src/styles.css`** → Global styles (Tailwind base, components, utilities).  
- **`package.json`** → Defines dependencies and npm scripts.  
- **`public/index.html`** → Static HTML shell that React injects into.  
- **`tailwind.config.js`** → Tailwind CSS configuration (theme, plugins).  
- **`postcss.config.js`** → PostCSS setup for Tailwind and Autoprefixer.

---

## 🚀 Hosting on Netlify

This app is deployed with [Netlify](https://www.netlify.com/).  
Netlify handles the React build step automatically.

Deployment settings:
- **Build Command:** `npm run build`  
- **Publish Directory:** `build`  

After the build, Netlify serves everything from the `/build` folder (optimized HTML, CSS, and JavaScript bundles).

---

## 🖥️ Why React App and not Static Page

- **Static Page:** Plain `.html` + `.css` files. Content is fixed in the file, and the browser simply renders it.  
- **React App:** Loads a minimal `index.html`, then React’s JavaScript bundles generate and manage the UI dynamically in the browser.  
- Because of this, React apps require a **build step** to turn the JSX and modern JavaScript into optimized files that browsers understand.

---

## 📦 Imports & Dependencies

This project uses the following key dependencies:

- **React (`react`, `react-dom`)**  
  - Core library for building UI with components.  
  - `react-dom` is used to render React components into the DOM (`index.js`).  

- **Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`)**  
  - Utility-first CSS framework.  
  - `postcss` processes Tailwind’s utilities.  
  - `autoprefixer` ensures CSS works across browsers.  

- **Lucide React (`lucide-react`)**  
  - Open-source icon library.  
  - Provides icons like **Plus**, **Calendar**, and **User** for buttons and labels.  

- **Framer Motion (optional)**  
  - If used, provides smooth animations and transitions for UI elements.  

---

## ⚙️ Build Process Explained

When you run **`npm run build`** (or when Netlify does it automatically):

1. **JSX Compilation** → All React code (`.js`/`.jsx` with JSX syntax) is compiled into plain JavaScript.  
2. **Bundling** → Webpack (via Create React App) bundles files into optimized chunks.  
3. **Tailwind Processing** → PostCSS compiles Tailwind classes into a single CSS file.  
4. **Optimization** → CSS/JS is minified, and unused Tailwind classes are purged.  
5. **Output** → The final production-ready files go into the `/build` folder, which is what Netlify serves.

---

## 🌐 Live Hosting

👉 [View Live on Netlify](https://rickexercisetracker.netlify.app/)
