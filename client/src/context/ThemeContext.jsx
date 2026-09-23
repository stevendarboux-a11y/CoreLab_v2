import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const STORAGE_KEY = "corelab-student-theme";

// Chaque thème n'est ici que des métadonnées d'affichage (nom, badge, libellés) :
// les vraies valeurs visuelles (couleurs, polices, rayon, ombre) vivent en CSS
// pur via `[data-theme="..."]` dans StudentLayout.css, scopé à .student-layout.
// -> aucune variable n'est jamais posée sur :root, pour ne jamais fuiter vers
// l'espace admin (même classe de bug que le login jaune corrigé plus tôt).
export const themes = {
  luxe: {
    id: "luxe",
    name: "Haute Couture",
    badge: "AW 2026",
    flashColor: "#3ddc97",
  },
  streetwear: {
    id: "streetwear",
    name: "Streetwear Industrial",
    badge: '"STREETWEAR"',
    flashColor: "#ff5500",
  },
};

// Flash plein écran joué au moment du basculement de thème : un aplat de la
// couleur du thème CIBLE apparaît puis disparaît quasi instantanément. Le
// <div> est créé/détruit hors de l'arbre React (effet ponctuel, pas d'état à
// garder), donc aucun risque de conflit avec le rendu du reste de l'app.
function playThemeSwitchFlash(color) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: ${color};
    z-index: 9999;
    opacity: 0.8;
    pointer-events: none;
    transition: opacity 0.2s ease-out;
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = "0";
    });
  });

  setTimeout(() => overlay.remove(), 300);
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && themes[saved] ? saved : "luxe";
    } catch {
      return "luxe";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currentTheme);
    } catch {
      // navigation privée / stockage bloqué : on continue sans persister
    }
  }, [currentTheme]);

  function setCurrentTheme(id) {
    if (id === currentTheme) return;
    playThemeSwitchFlash(themes[id].flashColor);
    setCurrentThemeState(id);
  }

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setCurrentTheme, themeData: themes[currentTheme] }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
