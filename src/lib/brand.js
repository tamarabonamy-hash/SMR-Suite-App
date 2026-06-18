export const BRAND = {
  teal900: "#063835",
  teal800: "#09524F",
  teal700: "#0E6964",
  teal100: "#DDECE9",
  mint: "#87D3C5",
  lime: "#D8F35E",
  limeHover: "#C7E650",
  white: "#FFFFFF",
  paper: "#F5F8F6",
  surface: "#FFFFFF",
  surfaceElevated: "#EEF4F1",
  ink: "#10211F",
  textSecondary: "#37534F",
  body: "#34524E",
  muted: "#667A76",
  line: "rgba(9,82,79,0.16)",
  focus: "rgba(135,211,197,0.42)",
  error: "#B94040",
  warning: "#9A6A00",
  success: "#0E6964",
}

export const brandFonts = {
  sans: "'IBM Plex Sans', Arial, sans-serif",
  mono: "'JetBrains Mono', monospace",
}

export const mono = { fontFamily: brandFonts.mono }
export const sans = { fontFamily: brandFonts.sans }

export const globalBrandCSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
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
::-webkit-scrollbar-thumb{background:rgba(9,82,79,0.34);border-radius:8px;}
input,textarea,select{
  background:var(--smr-surface);
  border:1px solid rgba(9,82,79,0.2);
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
