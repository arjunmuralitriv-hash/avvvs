# DIRECTION SHEET — The place carries it
seed 1753979869 · drawn 2026-11-04 · sector health · tone luxury
Brief: Ayurveda pharmacy and clinic in Kozhikode, Kerala, since 1921: 165 classical and proprietary medicines, a cinematic painterly scroll film from forest to parchment to bottle, then a quiet modern store and consultation booking

| | |
| --- | --- |
| Direction | The place carries it |
| Hero | Menu column, sticky photograph |
| Type | Boska |
| Colour | Green-black and bone |
| Sections | intro (Headline crossing onto a photograph) → showcase (Band of unequal panels) → list (Statement, table pushed right) → about (Wide photo, colour tile, facts) → contact (Visit card on a photograph) → footer (Contact as the headline) |
| Motion | Slow crossfade |
| Photographs | the "Forest" set, as atmosphere |

This is the direction for this build. Adopt it. Do not blend it with the layout you would have made anyway,
and do not redraw because it is unfamiliar: unfamiliar is the point. Redraw a slot only when it conflicts
with a stated brand constraint or needs an asset that does not exist, and say why in your report.

The parts of this sheet were written separately and will disagree in small ways. Settle every disagreement in this order:
**house rules** (including type no smaller than 13px and body text of 16px or more) → **the direction** (the idea, the composition habits, where the
one accent goes) → **the type system and the palette** (which face does which job, the five size steps, which colour is the ground and where the
accent goes) → **the hero blueprint** → **the section blueprints**. Under each blueprint below, "Adjusted for this page" lists where it disagrees.
In practice: take geometry from blueprints (columns, proportions, what sits where) and take everything else from above them. Map every size a
blueprint names onto one of your five type steps instead of adding a sixth. Use one button shape, one corner radius and one pair of page margins on
the whole page, whatever individual blueprints say. If a blueprint names a kind of typeface (a light serif, a heavy grotesk), use the dealt face.

## 1. The idea
For a place, the photograph is the argument. One full-bleed image of where you would be standing fills the first screen, and the design steps back: the name sits along the bottom edge like a film title, or small in a corner, and nothing else interrupts the view. The page that follows keeps that restraint: few words, large pictures, long pauses. The designer's work here is editing: choosing the one frame that makes someone want to be there, and then not covering it.

Before anything else, write one sentence in your notes: "On this page, <the subject's own material> becomes <the device>."
Fill the first blank from your inventory of what only this client has (its name and what it means, its street, its numbers, its
constraint), then put the nearest competitor in the sentence: if it still works, the idea is the category's, not the client's.
Then name the one live thing the visitor can do on the page (SKILL.md step 4).

## 2. Composition
First screen: a single photograph at 100vw by 100svh, focal point kept clear of text. The name is set either very large (14–20vw) hugging the bottom edge with 16–24px of margin, or small (20–28px) top-left with a one-line description bottom-left. Navigation is two to four words in the top corners in the same small size. If text sits on the image, a soft neutral scrim under the text area only. Below, sections alternate between a short centred or left-set paragraph in a narrow column (max 52ch) with wide empty margins, and photographs shown large: one full-bleed, then a pair at different sizes, then one portrait offset to the right. Practical information (hours, address, rates, booking) is gathered once near the end in a plain two-column block.

## 3. Type — Boska
A high-contrast serif with pointed serifs and a lively italic, used roman and italic together at one size. Suits perfume, jewellery, lodges, weddings and other occasions for ceremony.
```html
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=boska@400,401,500&display=swap" rel="stylesheet">
```
- Display: **Boska** — weight 400 · tracking -0.02em · leading 0.95 · roman capitals for the main words with lowercase italic for the connecting words at the same size, or sentence case throughout; centred lines work
- Text: **Boska** — 400 for body, 500 for emphasis · leading 1.5 · tracking 0.005em
```css
:root {
  --step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);
  --step-body: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);
  --step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  --step-head: clamp(2rem, 1.3rem + 3.2vw, 4rem);
}
```
A face with some grace for the name; small, calm, well-spaced text everywhere else. Sentence case. Body 17–19px with leading around 1.55.
The direction decides sizes and how many of them; the type system decides how this face is set. Where the two give different tracking or leading, use the values of the type system: they are tuned to this face.
The display size itself comes from the hero blueprint below.

## 4. Colour — Green-black and bone
```css
:root {
  --bg: #161c1a;
  --surface: #1f2725;
  --ink: #e3e2da;
  --muted: #8e948d;
  --accent: #9fc7b8;
  --accent-ink: #161c1a;
}
```
Bone type on green-black from top to bottom, with panels and drawn details barely lighter than the ground so photographs supply the colour. Pale jade is for the booking or contact button alone.
Neutral paper or deep neutral ground chosen to flatter the photographs; text ink drawn from the darkest tone in the imagery. Colour lives in the pictures.

## 5. Imagery
**Use the images that belong to the project in every picture slot.** For slots they cannot fill, real pictures of the subject's world from the open collections come next (start with `node C:/Users/arjun/.agents/skills/design-taste-frontend/scripts/assets.mjs "kozhikode postcard"`, then "kozhikode old map" and "scroll film", then queries from your inventory (its street, its materials, its trade's tools and history); credit them on the page), then the dealt photographs.

The dealt set is the palette. Choose four to six photographs with the same light. The hero image must have a calm area for the name. Full-bleed or large with square corners; never thumbnails, never a carousel of ten.

**Floor (the inspector checks it):** at least four real pictures on the page, usually six to twelve; SVG drawings do not count. One moving picture where an honest clip exists: `node <skill>/scripts/assets.mjs --video "<query>"`, used as a muted loop with a poster frame. Whatever this direction says about pictures, it is carried out with real ones.

Photographs dealt for this build, from the "Forest" set (woodland, paths between trees, moss and filtered light)
Order of preference for imagery: (1) the project's own photographs and product shots; (2) images you generate, if an image tool is
available; (3) real pictures of the subject's world found in the open collections (assets.mjs, downloaded and credited on the page);
(4) drawings of the subject in code; (5) these. They are real photographs (Unsplash licence, served by picsum.photos) of places, light and
texture. They are atmosphere, never a stand-in for a specific product, dish, person or interface. List the ones you use in your report so
they can be replaced.
Treatment: Leave photographs ungraded. If text overlays one, darken only the area behind the text with a neutral scrim.
- `https://picsum.photos/id/924/1600/1000` — Aerial view of autumn forest with orange and dark green treetops · dark tone · burnt orange, dark green · native landscape · photo: Jakub Sejkora
- `https://picsum.photos/id/944/1600/1000` — Wooden footbridge with railings leading into lush green forest · dark tone · deep green, warm brown, grey · native landscape · photo: Tim Swaan
- `https://picsum.photos/id/10/1600/1000` — Dense evergreen forest with a blue lake and distant hills beyond · mid tone · deep green, teal blue · calm area: top · native landscape · photo: Paul Jarvis
- `https://picsum.photos/id/730/1600/1000` — Snow-dusted conifer forest fading into pale winter fog · light tone · frost white, pale grey, slate green · calm area: top · native landscape · photo: Ryan Pohanic
- `https://picsum.photos/id/879/1600/1000` — Aerial view of a narrow path cutting through dense dark forest · dark tone · deep green, dark teal, grey · native landscape · photo: Nick Scheerbart
- `https://picsum.photos/id/919/1600/1000` — Tall straight pine trunks above a bright green forest floor · mid tone · fresh green, red brown, dark brown · native landscape · photo: Jon Ottosson
- `https://picsum.photos/id/600/1600/1000` — Sunbeams streaming through tall conifers in a dark forest · dark tone · dark green, pale gold, black · native landscape · photo: Dustin Scarpitti
- `https://picsum.photos/id/243/1600/1000` — Autumn larch forest on a foggy hillside with a footpath · mid tone · rust brown, pale grey, olive green · calm area: top · native landscape · photo: Orlova Maria
The last two path numbers are width and height: request the exact crop you render (`/1200/1500` for a 4:5 portrait, `/2400/1350` for a hero) and
add `?grayscale` to desaturate. Use three to six of them, not all eight. Always set `width`, `height`, `alt` and `loading="lazy"` (not on the hero image).
Other sets that fit this brief: fog-and-quiet, mountain, water, animals — `node draw.mjs --photos <set>` prints one in full; `--photos list` shows all sets. Taking photographs from another set is your call and is not a redraw; keep them to one light and one treatment.

## 6. Hero — Menu column, sticky photograph
The viewport is two panels of equal width with a 12px gap between them and 12px outer margins, both with a 20px radius. Right panel: one photograph of the place filling it edge to edge (object-fit: cover), set to position: sticky; top: 12px; height: calc(100svh - 24px), so it stays put while the left side scrolls. A solid bar in the paper colour, 56px tall, lies across the photograph's bottom edge inside the panel and carries opening hours on the left and the address on the right at 15px. Left panel: a filled paper-colour sheet set like a menu card, everything centred. Its top row holds the wordmark, about 300px wide, in the centre with one text link either side. Below, at 34% of the height, the headline in a light serif at clamp(40px, 3.6vw, 56px) on two lines in the accent ink, max 18ch per line. Under it one sentence at 17px, max 40ch, then the single action as a solid rectangle in the accent ink. The lower quarter of the sheet is empty before the first section begins.

On a phone: The photograph comes first as a rounded panel 56svh tall on 12px margins, sticky at the top so the paper sheet slides up over its lower part. The hours bar stays on the photograph's bottom edge. The sheet holds the wordmark centred at 46% of the width, the headline at 9vw on two lines, the sentence and a full-width action.
Headline: A warm 3-6 word line in a light serif, at most 34 characters, centred on two lines.

Adjusted for this page:
- It sets text at 12px: use your small step (13px or more) instead.
- It names its own corners: use the one radius of this page (square unless the direction says otherwise) and one button shape.
- It names a kind of typeface: use the dealt faces (display Boska, text Boska) and their settings; capitals only where the type system sets them.

## 7. Sections, in order
Each is a composition to rebuild with this project's content. Keep the geometry; change the subject. Re-order or drop a
section when the argument of the page needs it (see references/copy.md), never to fall back to a card grid.

### 1. intro — Headline crossing onto a photograph (split)
A white or pale ground. A photograph taller than it is wide, 720px wide (columns 7–12), sits flush against the right viewport edge with its top at 46% of the section's first screen and runs below the fold. The heading starts on the 32px left margin across columns 1–8: two lines of light-weight serif capitals at clamp(64px, 5.6vw, 88px), leading 1.04, the first line starting 34% down the screen and the second placed so that its right half runs onto the photograph's upper-left corner. Choose a picture whose upper-left quarter is pale enough for the ink, or set the second line twice, in the ink and in the paper colour, each copy clipped to its side of the photograph's left edge. Under the heading on columns 1–5, one paragraph of up to 25 words at 22px, leading 1.4. At the bottom-left a second, smaller photograph of 360×400px enters, cropped by the screen's lower edge, and on the next screen becomes the left half of a staggered pair with the large one. Nothing else is on the screen.
On a phone: The heading sits at 10vw on two lines on the 20px margin. The photograph becomes 75% of the width, flush right, and starts under the heading's first line so the second line crosses its top-left corner. The paragraph follows at 17px, then the small photograph at 50% of the width on the left margin.

Adjusted for this page:
- It names a kind of typeface: use the dealt faces (display Boska, text Boska) and their settings; capitals only where the type system sets them.
- It names colours (white): map them onto this palette's roles (ground `--bg`, panels `--surface` and the fields, text `--ink`/`--muted`, the accent `--accent` on the primary action only).
- It numbers things 01, 02: drop the numbers unless they are real data (a price, a date, a count).

### 2. showcase — Band of unequal panels (strip)
A modest heading, then one wide band of pictures. The heading, two to four words at 36–44px, starts at column 3, left of centre, with 64px beneath it. The band spans the full viewport width edge to edge and is 68svh tall: four photographs standing side by side with no gaps and deliberately unequal widths, a flex row with flex-grow values of 5, 2, 3 and 2. Each panel is cropped with object-fit: cover to a tall slice, so the band reads as one folded view. The first panel carries a two-line title at 28px in paper colour at its top-left, 24px in, over a neutral scrim that covers only that corner. Hovering a panel raises its flex-grow to 6 over 500ms while the others give way; without hover the widths simply stay. One caption line at 16px sits under the band at the left margin.
On a phone: The heading sits on the margin at 28px. The band becomes a two-by-two block with no gaps, 84svh tall in total: the first row split 64/36 and the second 36/64, so the slices stay unequal. The title stays on the first panel. No hover behaviour.

### 3. list — Statement, table pushed right (table)
A heading of four to six words spans the full width on two lines at clamp(40px, 4.5vw, 68px), left-aligned with its first line indented 3vw and leading 0.98. 96px below, the table is pushed into the right-hand five columns (8–12) and the left stays open. One plain word naming the table (offices, hours, rates) hangs at 14px in column 7, top-aligned with the first row. Each row is a three-part line at 15–16px with 26px between rows: the kind or day in the soft ink at the left of the measure, the place or service at 30%, and the address, time or price right-aligned, with a small arrow where the row links. Rows are separated by space only; every fourth row has 44px above it to form groups. In columns 1–4, bottom-aligned with the last row, one 4:5 photograph 22vw wide may sit alone. Holds 5–14 rows.
On a phone: Heading at 9.5vw without the indent. The table takes the full width at 16px; each row stacks the kind above the place, with the value right-aligned on the first line. The naming word is dropped because the heading already says it. The photograph follows at 60% width on the right margin.

### 4. about — Wide photo, colour tile, facts (mosaic)
Top: a heading of two to four words at clamp(40px, 4vw, 60px) on the left margin, then 24px below it a three-line lead paragraph at 21–22px across columns 1–6. 72px lower, two tiles sit side by side with a 16px gap. The left tile spans columns 1–8: a landscape photograph at 16:10 with one radius (0 or 10px). A short paragraph of up to 35 words at 16px is set in a solid paper-colour block 320px wide with 20px padding, placed over the photograph's top-right corner and flush with both edges. The right tile spans columns 9–12 and is a flat palette colour, 60% of the photograph's height: it holds a simple inline SVG outline of the region or the floor plan as one filled shape, with one solid dot marking the location. Under the colour tile, four label and value pairs at 14px in a two-by-two grid: altitude, distance, season, local time.
On a phone: Heading at 9vw, lead at 18px. The photograph goes full width at 4:3 and its overlaid paragraph moves beneath it as ordinary text. The colour tile follows at full width and 3:2, and the four label and value pairs sit under it in two columns.

Adjusted for this page:
- It sets text at 10px: use your small step (13px or more) instead.

### 5. contact — Visit card on a photograph (full-bleed)
A full-bleed photograph of the place, 100vw by 100svh, carries one solid card and nothing else. The card is a filled panel in the paper colour, fully opaque, 380px wide with 8px corners and 32px padding, placed in the upper-right corner 60px from the top and right edges (or the upper-left: pick the corner where the photograph is calmest). It holds, top to bottom: a two- or three-word title at 28px in a light weight; the address on two lines at 16px; the opening hours as three rows with days at the left and times right-aligned in tabular figures; the phone number; then, flush with the card's bottom edge and spanning its width, a solid booking button 52px tall. The card may be `position: sticky; top: 60px` inside a taller section so it holds while the photograph scrolls beneath it. The photograph's focal point must stay clear of the card. No heading outside the card.
On a phone: The photograph is 100vw by 70svh. The card leaves the corner: it spans the width with 16px margins and overlaps the photograph's bottom edge by 80px, so image and card interlock. The booking button is full width, 56px tall, at the card's bottom.

### 6. footer — Contact as the headline (statement)
A full-bleed field in one saturated palette colour, at least 90svh tall. Top row, 40px from the edge: two or three short notes at 15px in columns 1–7 (address, hours, a one-line description) and a back-to-top text link at the right margin. Then a tall empty gap. In the lower half, the way to get in touch is the display line: the telephone number or the email address itself, set at 8–9vw, flush left, hard against the margin, as one link. An email address may break once, before the @, giving two lines. Size it with `clamp()` so the longest line fills at least 80% of the width. Under it, one row of small text at 14px spread across three positions: links at the left, credits in the centre, city and year at the right. The wordmark appears only small, in the top row.
On a phone: Notes stack at the top at 15px. The contact line sits in the lower half at 12vw; a telephone number stays on one line, an email breaks before the @ and is sized so each half fits the width. The meta row becomes three stacked lines at 13px.

## 8. Motion — Slow crossfade
The principal photograph quietly changes: three or four images of the same framing crossfade over about 1.6 seconds, holding five to six seconds each, or the fixed image changes when its matching section arrives. It should feel like light shifting in a room. Pause when the tab is hidden; under reduced motion show only the first image.
This is the signature move, the one loud moment. Around it the page still needs the rest of the motion layer (SKILL.md step 9): an entrance for the parts of every section, feedback on every control, and one moving picture. The inspector fails a page that barely moves. Recipes: references/motion.md.

## 10. Where the richness comes from
The photographs, at full size, uninterrupted. Empty paper around short text makes the next image land harder.

## 11. How this direction goes wrong
A weak hero photograph cannot be fixed by typography; pick again. Do not stack a headline, a paragraph and two buttons on the image. Do not use a booking bar that covers the bottom of the view; one small action is enough.

## 12. Real references
Studied sites that work this way. Take the principle, never the specifics: no names, copy, images or signature assets of theirs.
- **IZANAMI** (Awwwards Site of the Day, studied score 7) `aww-izanami`
  Idea: Silence as design: one small sentence in fog, then a slow descent from mist into a dark glass pavilion.
  Hero: After a warm-black loader showing only one 18px serif sentence and a small counter, the hero is a full-bleed, desaturated grey-green image of pine forest dissolving into fog. The same sentence stays at 18px in white, left-aligned on a line about 17% from the left edge and exactly at vertical centre; it is the only text in the picture area. A small white seal-style logo sits top-left; a language switch and menu label in tiny tracked capitals sit top-right, each with a dot above. Along the bottom edge: copyright, two live city clocks, and a scroll cue at far right, all near 10px.
  Worth taking: Place a single 18px sentence at vertical centre on an offset left line over full-bleed fog, and let the absence of a headline be the statement.
- **Seasats** (Awwwards Site of the Day, studied score 8.4) `aww-seasats`
  Idea: Calm, dusk-lit seascapes sell autonomous boats as serene instruments, and the navigation is a column of stacked colour swatches taken from that sea-and-sand palette.
  Hero: A 10px white frame surrounds everything. The left 84% is one rounded media panel: a dusk scene of a low, solar-decked vessel centred on mirror-flat water, with two larger hulls cropped by the panel's left and right edges. The headline is centred in the panel's upper third, two lines of white light-weight flared serif at 124px (8.6vw). A wordmark in custom wide techno lettering sits top-left; a white rounded button with mono caps and a dark-green square arrow sits bottom-centre. The right 14% is the menu: a full-height column of stacked flat colour blocks (blush, sage, then four darkening olives), each holding left-aligned 15px links, sub-items numbered 01 to 04.
  Worth taking: Build the menu as a full-height column of stacked flat colour blocks sampled from the imagery, grouping links by block colour instead of by rules or headings.
- **Zara Webb** (One Page Love, studied score 8) `opl-zara-webb`
  Idea: A one-woman newborn-care practice presented like a hand-made keepsake: a mascot rabbit, scalloped and flower-shaped cut-outs, candid film photographs.
  Hero: Split exactly in half. Left, on cream: two-line mono caps nav stacks sit at the column's top-left and top-right with a handwritten script logo centred between them. Centred below, a five-line headline in a condensed serif, each line broken to one to three words so the block forms a ragged lozenge; then a three-line 16px sans paragraph and an outlined pill button in mono caps. A line-drawn rabbit on a skateboard rides a hairline at the column's bottom-right. Right: a candid flash photograph bleeds off the top and right edges and stops at 92% height; a lilac pill button and a round chat icon overlay its top-right corner.
  Worth taking: Mask photographs into soft custom shapes (a four-petal flower, a scalloped egg) and let their container crop them.
Full notes on any of them: `node draw.mjs --site <id>`.

## Always
Headlines two lines or fewer at every width. No eyebrow labels, no monospace, no 01/02/03, no thin rules, no gradients, no shadows at rest,
no cream-and-terracotta, no violet. The frame: one h1 on the first screen that says what this is, equal outer margins, no
section huddled on one side with the other half empty, no blank stretch over half a screen, a heading on every section.
`inspect.mjs` measures all of it.

Saved to C:/Users/arjun/Documents/AVVVS/.taste-skill/direction.json · reprint with `node draw.mjs --show`
