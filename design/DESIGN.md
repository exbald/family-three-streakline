# Streakline — design kit

Kit for "Streakline", a dark single-screen running tracker. Source of truth: the app's own CSS; nothing here is invented.

## Mood

Dense, dark and single-screen — a terminal-flavoured training log, not a lifestyle app. Numbers are the decoration: one enormous lime streak digit, monospace everywhere, uppercase micro-labels. Warm but not cute — a single amber warning tone and a lime accent carry all the personality; nothing airy, nothing white, nothing whimsical.

## Colour

| Token | Hex | Job |
|---|---|---|
| `--color-bg` | `#0b0d10` | Page background; also button text on lime |
| `--color-surface` | `#12151a` | Panels: banner, stat tiles, chart box, form, list |
| `--color-surface-2` | `#181c23` | Raised fills: inputs, day cells, odd run rows, tooltip |
| `--color-line` | `#232830` | All borders, dividers, chart gridlines |
| `--color-ink` | `#e6e9ee` | Primary text, big values |
| `--color-ink-2` | `#9aa3b2` | Secondary text: sub-lines, dates, units |
| `--color-ink-3` | `#5b6472` | Muted text: labels, axis ticks, placeholders, footers |
| `--color-accent` | `#82c91e` | Lime: streak number, current week, primary button, focus/success |
| `--color-accent-mark` | `#66a80f` | Darker lime: chart bars for past weeks (`data-palette`) |
| `--color-accent-dim` | `#4a6b1c` | Lime-tinted border on the banner; input focus border |
| `--color-accent-soft` | `rgba(130,201,30,.08)` | Lime wash behind "today" day cell |
| `--color-warning` | `#e6a23c` | Amber: form error text, delete-button hover |
| `--shadow` | `0 4px 16px rgba(0,0,0,.5)` | Floating tooltip only |

## Type

- Family: `"IBM Plex Mono", ui-monospace, monospace` — the only family, everything is monospace.
- Base: `13px` / `1.45` line-height, antialiased.
- Scale: `9px` day-of-week · `10px` uppercase labels & axis ticks · `11px` sub-lines, messages, tooltips · `12px` list rows, buttons · `13px` body & day numbers · `15px` header wordmark · `16px` unit `small` in the banner · `30px` stat tile values (`26px` under 720px) · `64px` streak hero number.
- Weights: `400` body, `500` units and `small`, `600` values/km/emphasis, `700` hero number and wordmark.
- Monospace discipline: use it for everything, but reserve tracking for labels — `letter-spacing: .12–.18em` with `text-transform: uppercase` on 10px labels, `.18em` on the wordmark, and *negative* `-.02em` to `-.03em` on 30–64px numbers so digits sit tight.
- Units shrink into the number: `<small>` at 13–16px, weight 500, muted colour, normal tracking.

## Space and shape

- Spacing steps: `3 4 6 7 8 10 12 14 16 20 48` px. Work in 8s for grid gaps (`8px`) and panel padding (`12px`); `4px` for strip gaps; `20px 16px 48px` page padding.
- Radii: `4px` on small controls (inputs, buttons, day cells, tooltip); `6px` on panels (tiles, banner, chart box, list). Chart bars `rx` = min(4, half bar height).
- Borders: `1px solid` everywhere, no exceptions — `--color-line` on surfaces, `--color-accent-dim` on the one hero panel, `--color-accent` on the "today" cell.
- Shadows: a single shadow, `0 4px 16px rgba(0,0,0,.5)`, only on the floating tooltip. Surfaces are flat; depth comes from the two-tone surface fill, not shadow.
- Hover: `filter: brightness(1.08)` on the filled button; colour/border swap on ghost delete.

## Layout

- Single column, max-width `980px`, centred, `padding: 20px 16px 48px` — everything visible on one screen, dense by design.
- Header rail: flex baseline row, title left / timestamp right, closed by a `1px` bottom border.
- Streak banner on top: hero number + meta, then a day strip — `display:flex; gap:4px` with cells `flex: 1 0 40px; max-width: 64px`.
- Stat row: `grid; repeat(4, 1fr); gap: 8px` (2 columns under 720px).
- Two-column split for form + list: `grid-template-columns: 5fr 7fr; gap: 8px` (stacks under 720px).
- Table-as-grid: run list rows use `grid-template-columns: 82px 1fr 52px 66px 34px; gap: 8px`, header row shares the same columns; odd rows get `--color-surface-2` zebra; `1px` row borders, none on last.
- Section headings are 10px uppercase labels with a right-aligned detail (`--color-ink-3`, normal case), `margin: 16px 0 8px`.

## Components

- **Streak banner** — hero panel with `--color-accent-dim` border; 64px lime number + 16px `<small>` unit, label + "best" meta beside it, then a labelled day strip. `radius: 6px; padding: 14px 16px 12px`.
- **Stat tile** — surface panel: 10px uppercase label, 30px weight-700 value with 13px `<small>` unit, 11px sub-line (lime when `up`). `radius: 6px; padding: 10px 12px 12px; border: 1px solid --color-line`. Hero variant tints its value lime.
- **Day cell** — strip cell with 9px weekday over 13px date; "today" gets `--color-accent` border + `--color-accent-soft` fill. `radius: 4px; padding: 4px 7px 5px`.
- **Bar chart** — inline SVG `640×220`, 3 hairline gridlines with 10px `--color-ink-3` ticks; bars `--color-accent-mark` (current week `--color-accent`, value labelled above), zero weeks as a 2px baseline tick; transparent full-band hover columns driving a fixed tooltip.
- **Tooltip** — fixed-position panel: 10px tracked label, 13px value with the number in lime. `surface-2, radius 4px, padding 6px 9px, shadow`.
- **Form panel** — 12px padded grid of fields: 10px uppercase label, `surface-2` input with `4px` radius, `padding: 7px 9px`, focus border `--color-accent-dim`; 11px status message slot (`.err` amber, `.ok` lime); lime submit button.
- **Button** — filled lime, `#0b0d10` text, weight 600, `letter-spacing: .08em`, uppercase copy, `padding: 8px 14px; font-size: 12px; radius: 4px`; hover `brightness(1.08)`.
- **Ghost delete button** — 30px wide, `--color-line` border, `--color-ink-3` 10px text; hover turns border and text `--color-warning`.
- **Run list** — the grid table above; date `--color-ink-2`, km weight 600 `--color-ink`, time/pace `--color-ink-2`; empty state is plain 12px `--color-ink-3`.
- **Header / footer** — wordmark `STREAK` + lime `LINE` at 15px/700/`.18em`; footer 10px `--color-ink-3` with `.06em` tracking.

## Do and don't

- **Do** keep one screen dense: every pixel holds a number, a label or a hairline border.
- **Do** render real values in monospace with tight tracking and `<small>` units beside them.
- **Do** mark only one thing per view as hero (lime banner), everything else stays grey-scale.
- **Don't** add white space, light backgrounds, soft gradients or rounded "friendly" cards.
- **Don't** celebrate — no confetti or mascots; success is an 11px lime line, error an 11px amber one.

## Use it with a coding agent

Build this in the style of DESIGN.md: a dense dark single-screen UI on `--color-bg` with 1px `--color-line` borders, `6px` panels and `4px` controls, all type in IBM Plex Mono at a 13px base with 10px uppercase tracked labels and tight-tracked 30–64px numeric heroes, lime `--color-accent` reserved for one hero element and the primary button, amber `--color-warning` for errors and destructive hovers, 8px grid gaps, `repeat(4,1fr)` stat tiles and a 5fr/7fr form-over-list split — flat surfaces, no shadows except a floating tooltip, no celebration moments, and every metric printed as a real number.
