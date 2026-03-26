# Design System Specification: Aura Midnight Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Celestial Architect"**
This design system moves beyond the standard dark mode by treating the interface not as a flat screen, but as a deep, expansive void. We are moving away from "Material" constraints toward a high-end editorial experience that feels ethereal, boundless, and intentional. 

By leveraging **Electric Cerulean (#007FFF)** against a deep obsidian backdrop, we create a high-contrast, energetic pulse. The system breaks the "template" look by using extreme roundedness (9999px), generous whitespace (Scale 8 to 16), and layered tonal depths that mimic the layering of nebulae rather than the stacking of plastic cards.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the transition from absolute darkness to vibrant, glowing energy.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` section should sit directly on a `surface` background to define its territory.

### Surface Hierarchy & Nesting
Instead of a flat grid, treat the UI as a series of physical layers.
*   **Deep Background:** `surface` (#0a0f15)
*   **Sunken Elements:** `surface-container-lowest` (#000000) for deep inset areas.
*   **Standard Containers:** `surface-container` (#141a21) or `surface-container-high` (#1a2028).
*   **Raised Focus:** `surface-bright` (#252d36) for active or hovered states.

### The "Glass & Glow" Rule
To achieve the "Aura Midnight" aesthetic, floating elements (modals, dropdowns) must use **Glassmorphism**. 
*   **Formula:** `surface-variant` at 60% opacity + `backdrop-blur: 24px`.
*   **Signature Textures:** Apply a linear gradient (45deg) from `primary` (#81aeff) to `secondary` (#8fd5f7) for primary CTAs to create a "glowing" energy source that feels alive.

---

## 3. Typography: The Editorial Voice
**Plus Jakarta Sans** is used exclusively to maintain a modern, geometric clarity.

*   **Display Scale (`display-lg` at 3.5rem):** Used for "hero" moments. Use `-0.04em` letter spacing to create a compact, high-fashion impact.
*   **The Narrative Lead:** Pair `headline-lg` (2rem) with `body-lg` (1rem). Ensure a line height of at least 1.6 for body text to allow the "ethereal" theme to breathe.
*   **Hierarchy as Identity:** Use `label-md` in all-caps with `0.1em` tracking for category headers. This provides an authoritative, curated feel that balances the softness of the rounded shapes.

---

## 4. Elevation & Depth
Depth in this system is a result of light and shadow, not lines and boxes.

### The Layering Principle
Achieve "lift" by stacking tiers. Place a `surface-container-high` card on a `surface-container-low` section. This creates a soft, natural transition that mimics ambient starlight.

### Ambient Shadows
Shadows must be extra-diffused to represent a celestial glow.
*   **Floating Shadow:** `0px 20px 40px rgba(0, 0, 0, 0.4)` mixed with a subtle outer glow using the `primary_dim` color at 5% opacity. 
*   **Forbid:** High-contrast, tight, or grey "drop shadows."

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use a **Ghost Border**:
*   **Stroke:** 1.5px
*   **Color:** `outline-variant` at 15% opacity. This suggests a boundary without interrupting the visual flow.

---

## 5. Components

### Buttons (Shape: Full / 9999px)
*   **Primary:** A vibrant gradient of `primary` to `primary_container`. Text color: `on_primary_fixed`. Use a `0px 0px 15px` outer glow on hover.
*   **Secondary:** Ghost style. Transparent fill with a `Ghost Border`. Text color: `primary`.
*   **Tertiary:** No background, no border. Text color: `secondary`.

### Input Fields
*   **Style:** `surface-container-highest` background, full rounded corners.
*   **Active State:** No border change. Instead, use a subtle 1px inner glow using `primary` at 30% opacity.

### Cards & Lists
*   **Constraint:** Zero divider lines. 
*   **Separation:** Use `Spacing Scale 4` (1.4rem) between list items. For cards, use a slight background shift from `surface-container` to `surface-container-high`.

### Celestial Chips
*   **Style:** `surface-variant` background with `secondary` text. 
*   **Interaction:** On selection, the chip should transition to `primary` with a "glowing" text effect (`text-shadow: 0 0 8px primary`).

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Let elements overlap slightly to create depth.
*   **Do** use the `24` spacing token (8.5rem) for major section breathing room.
*   **Do** use "Baby Blue" (`secondary` / `tertiary` tokens) as accent highlights for success states or subtle icons.

### Don’t:
*   **Don’t** use sharp corners. Every container, button, and input must be `Round Full`.
*   **Don’t** use 100% white (#FFFFFF) for text. Use `on_surface` (#e1e5ee) to prevent "retina burn" against the dark background.
*   **Don’t** use traditional grid gutters. Use "Negative Space" as a structural element to guide the eye toward the "Electric Cerulean" focal points.