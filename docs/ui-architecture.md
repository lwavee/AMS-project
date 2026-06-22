# UI Architecture & Design Language

## Design Philosophy
The "Sterling Insurance" theme is built on a foundation of clean, high-contrast, premium web aesthetics. It avoids visually cluttered desktop paradigms and embraces web-native patterns. 

All UI components should prioritize:
- **Legibility:** Ample padding and clear typographic hierarchy.
- **Hierarchy:** Clear structural boundaries using subtle borders and soft background colors rather than stark boxes.
- **Interactivity:** Fluid transitions on hover and active states.

## Tailwind CSS Conventions

### 1. Color Palette Tokens
We use custom Tailwind CSS utility classes mapped to our premium color palette.
- **Backgrounds:** The core page wrapper should use `bg-bg-base`. Panels use `bg-white`. Sub-headers or nested grids use `bg-slate-50`.
- **Text:** Primary text is `text-text-main`. Secondary or label text is `text-slate-400` or `text-slate-500`.
- **Accents:** Use `text-primary` or `bg-primary` for primary actions, titles, and active row highlights. Use `danger` for cancel actions or destructive elements.

### 2. Panel Structure
Legacy mockups often used tight gray boxes or collapsible accordions. Our modern standard is the **Flat Data Card**.
```tsx
const panelHeaderCls = "w-full px-5 py-3.5 bg-secondary/20 border-b border-border-main flex items-center gap-2 text-xs font-bold text-primary rounded-t-2xl";
const panelContainerCls = "border border-border-main bg-white shadow-sm rounded-2xl";
```
- Never use deep, nested accordions for static data. If data must be shown, display it permanently.
- Use `lucide-react` icons within panel headers to provide visual anchors (e.g., `<Calculator />` for totals).

### 3. Typography & Form Elements
- **Labels:** Labels above fields should be extremely crisp. We standardize on:
  `text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1`
- **Inputs & Selects:** 
  `h-9 px-3 bg-white border border-border-main text-xs font-semibold rounded-xl shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`
- **Boolean Flags:** Instead of overwhelming walls of checkboxes, boolean flags (`true/false`) should be rendered as elegant "badges" only when true.
  ```tsx
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded-md border border-primary/20">
    <Check size={10} className="stroke-[3]" /> {text}
  </span>
  ```

### 4. Interactive Tables
Tables should avoid vertical gridlines. 
- **Headers:** `bg-slate-50 border-b text-[10px] uppercase font-extrabold tracking-wider`.
- **Rows:** `hover:bg-slate-50/50 transition-colors`.
- **Selection State:** When a row is selected for editing, it should visually detach:
  `bg-primary/10 border-l-2 border-primary`