# ReelsPro · React App

A React + TypeScript port of the full ReelsPro app (from `app.html`): a sidebar shell
with five views —

- **Dashboard** — stat cards, recent projects, quick-start tiles
- **Templates** — compact category-filtered grid of built-in **and** custom templates. "Use"
  loads a template's full scenes/assets into the editor; custom ones can be edited or deleted.
- **Template Builder** — build a layout, bundle assets into reusable **groups**, mark fields as
  locked/editable, then **Save as template**. Custom templates and groups persist in
  `localStorage` (key `reelspro-templates`).
- **Video Editor** — scenes with draggable / resizable / rotatable assets (text, image,
  logo, video), a properties panel, and a timeline with a playhead. Each asset has:
  - **Start + End** timing within the scene (with a mini timing bar; duration is derived)
  - an **animation library** of entrance and exit effects (fade, slide, zoom, pop, rotate,
    blur) that preview instantly on the canvas and replay during timeline Play
  - for text: a **font-family picker** (curated Google Fonts) and a **color picker**
    (native wheel + quick swatches + typeable hex)
- **Consent Capture** — client form with a drawable signature pad and a signed-confirmation state
- **Meeting Room** — a mocked video call with timer, mic/camera toggles, and an invite panel

A toast system and top bar (search + "New video") tie it together.

## Demo content

Ships with a professional "RP Realty" demo world so it presents well out of the box:
original SVG logos and image posters plus three synthesized royalty-free music loops
live in `public/assets/`. The eight built-in templates are full multi-scene pieces
(real estate / mortgage / social) with branded logos on every slide, background music,
animated headlines, and timed scenes — pick one in **Templates → Use** and hit **Play**.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Zustand** for editor state

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Project layout

```
src/
  appStore.ts       Zustand store for the active view + toast
  store.ts          Zustand store for the editor: scenes, assets, selection, actions
  data.ts           dashboard/template/recent-project mock data + gradients
  types.ts          shared types + constants (ratios, colours, swatches)
  assetTypes.ts     per-type defaults + the createAsset() factory
  useTransform.ts   single drag / resize / rotate hook reused by every asset
  util.ts           colour shading + canvas-size maths
  components/
    AppShell.tsx        sidebar + topbar + active view + toast
    Sidebar.tsx         navy nav rail, upgrade card, user box
    Topbar.tsx          page title/subtitle, search, "New video"
    Toast.tsx           transient notifications
    icons.tsx           inline SVG icon set
    Editor.tsx          editor grid layout
    LeftPanel.tsx       add assets, asset list, scene list
    Stage.tsx           canvas + aspect-ratio switcher
    AssetView.tsx       renders one asset + its handles
    PropertiesPanel.tsx scene + selected-asset properties
    Timeline.tsx        scene blocks, ruler, animated playhead
    views/
      Dashboard.tsx     stats, recent projects, quick start
      Templates.tsx     filters + template grid
      Consent.tsx       consent form + signature pad
      Meeting.tsx       meeting-room mock
```

## Notes on the port

State that lived on `window.RP` and mutated the DOM directly now lives in a single
Zustand store; components subscribe to the slices they need and re-render on change.
Drag/resize/rotate is consolidated in `useTransform`, mirroring the original
`transform.js`. Text assets stay uncontrolled on the canvas so editing them never
resets the caret; the properties panel and canvas both write back to the same store.
# reelspro
