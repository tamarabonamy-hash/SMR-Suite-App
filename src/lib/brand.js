// Strategy Made Real brand (matches strategymadereal.com.au).
// Legacy key names are kept so existing components keep working.
export const BRAND = {
  teal900: "#1F3F3D",
  teal800: "#2E5A57",   // deep teal
  teal700: "#557C78",   // teal
  teal100: "#E7E0D3",
  mint: "#A9C3BF",      // light teal, for accents on deep teal
  lime: "#557C78",      // primary accent (was lime)
  limeHover: "#2E5A57",
  white: "#FCFAF5",     // soft ivory
  ivory: "#F5F0E7",
  paper: "#F5F0E7",
  surface: "#FCFAF5",
  surfaceElevated: "#EEE7DA",
  ink: "#171717",
  textSecondary: "#2B2B2B",
  body: "#3D3A36",
  muted: "#6B6760",
  line: "rgba(23,23,23,0.12)",
  focus: "rgba(85,124,120,0.28)",
  error: "#B94040",
  warning: "#9A6A00",
  success: "#2E5A57",
}

export const brandFonts = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'IBM Plex Sans', Arial, sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
}

export const serif = { fontFamily: brandFonts.serif }
export const mono = { fontFamily: brandFonts.mono }
export const sans = { fontFamily: brandFonts.sans }

export const globalBrandCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
:root{
  --smr-bg:${BRAND.paper};
  --smr-surface:${BRAND.surface};
  --smr-elevated:${BRAND.surfaceElevated};
  --smr-ink:${BRAND.ink};
  --smr-text-secondary:${BRAND.textSecondary};
  --smr-muted:${BRAND.muted};
  --smr-line:${BRAND.line};
  --smr-accent:${BRAND.lime};
  --smr-accent-hover:${BRAND.limeHover};
  --smr-focus:${BRAND.focus};
  --smr-error:${BRAND.error};
  --smr-success:${BRAND.success};
  --smr-warning:${BRAND.warning};
}
*{box-sizing:border-box;margin:0;padding:0;}
html{background:var(--smr-bg);}
body,#root{
  background:var(--smr-bg);
  color:var(--smr-ink);
  font-family:${brandFonts.sans};
  min-height:100vh;
  font-size:16px;
  line-height:1.6;
}
button,input,textarea,select{font:inherit;}
button{border-radius:8px;}
::-webkit-scrollbar{width:7px;height:7px;}
::-webkit-scrollbar-track{background:${BRAND.teal100};}
::-webkit-scrollbar-thumb{background:rgba(46,90,87,0.34);border-radius:8px;}
input,textarea,select{
  background:var(--smr-surface);
  border:1px solid rgba(23,23,23,0.18);
  color:var(--smr-ink);
  font-family:${brandFonts.sans};
  font-size:13px;
  padding:10px 12px;
  outline:none;
  width:100%;
  border-radius:8px;
  transition:border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}
input:focus,textarea:focus,select:focus{
  border-color:${BRAND.teal700};
  box-shadow:0 0 0 3px var(--smr-focus);
}
select{cursor:pointer;}
textarea{resize:vertical;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
`
