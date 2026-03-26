# Design System Strategy: Weightless Clarity

## 1. Overview & Creative North Star: "The Atmospheric Ethereal"
This design system is built to transcend the rigid, boxy constraints of traditional web interfaces. Our Creative North Star is **The Atmospheric Ethereal**—a digital environment that feels less like a software interface and more like looking through a clear sky.

By moving away from "container-based" design toward "layered-atmosphere" design, we achieve a premium, academic-yet-approachable feel. We break the template look by utilizing **intentional asymmetry** (e.g., placing a `display-md` headline off-center against a wide `surface-container-low` hero) and **tonal depth**. The goal is a "weightless" aesthetic where elements float in a calibrated hierarchy of blues and light, rather than being anchored by heavy borders or dark shadows.

---

## 2. Color & Surface Philosophy
The palette is a sophisticated study in sky and baby blues. We use blue not just as an accent, but as a light source.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** To define boundaries, use shifts in background tokens. 
*   *Example:* A sidebar using `surface-container` sitting against a `background` main content area. 
*   *Why:* Solid lines create visual "noise" and friction. Tonal transitions create "flow."

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted glass. Use the `surface-container` tiers to create depth:
1.  **Base Layer:** `surface` (#eff7ff) – The vast sky.
2.  **Structural Zones:** `surface-container-low` (#e3f3ff) – Large layout sections.
3.  **Interactive Components:** `surface-container-highest` (#b8e3ff) – Cards or elements that need to pop.
4.  **The "Glass & Gradient" Rule:** For primary CTAs or high-impact headers, use a subtle linear gradient from `primary` (#056380) to `primary-container` (#8fd5f7) at a 135° angle. This adds "soul" and a sense of movement that flat fills lack.

---

## 3. Typography: Editorial Authority
We utilize **Plus Jakarta Sans** for its geometric clarity and modern, open counters, which reinforce the "weightless" theme.

*   **Display Scale (`display-lg` to `sm`):** Reserved for moments of inspiration. Use `on-surface` (#003348) with `-0.02em` letter spacing to feel tight and custom.
*   **Headline & Title:** Use `headline-md` for section starts. Pair with generous `16` (5.5rem) top spacing to allow the typography to "breathe."
*   **Body Text:** `body-lg` is your workhorse. Use `on-surface-variant` (#356079) for long-form reading to reduce eye strain against the blue-tinted background.
*   **Labels:** Use `label-md` in all-caps with `0.05em` letter spacing for a "metadata" look that feels academic and precise.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too heavy for this system. We use **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** To lift a card, place a `surface-container-lowest` (#ffffff) element on a `surface-container-low` (#e3f3ff) background. The contrast is enough to signify elevation without a single pixel of shadow.
*   **Ambient Shadows:** If an element must float (like a Modal or Dropdown), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 51, 72, 0.06);`. Notice the shadow is a tint of our `on-surface` blue, not black.
*   **Glassmorphism:** For floating navigation or tooltips, use:
    *   Background: `surface` at 70% opacity.
    *   Backdrop-blur: `20px`.
    *   **The Ghost Border:** A 1px stroke using `outline-variant` (#88b3ce) at **15% opacity**. This provides a "shimmer" edge typical of high-end glass.

---

## 5. Components & Primitive Styling

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`), `full` roundedness, `on-primary` text. No shadow.
*   **Secondary:** `surface-container-highest` background with `primary` text.
*   **States:** On hover, increase the brightness of the gradient. On press, scale the button to 0.98.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines to separate list items. Use the **Spacing Scale** `4` (1.4rem) to create clear "islands" of content, or use alternating `surface-container-low` and `surface-container-lowest` backgrounds.
*   **Corner Radii:** Use `lg` (2rem) for large containers and `DEFAULT` (1rem) for smaller nested elements to create a "nested organic" feel.

### Input Fields
*   **Style:** `surface-container-lowest` fill with a `sm` (0.5rem) corner radius. 
*   **Focus State:** Instead of a thick border, use a 2px "Ghost Border" of `primary` at 40% opacity and a soft outer glow of the same color.

### Signature Component: The "Aura Archive" Card
A specialized card for displaying academic or resource content. 
*   **Specs:** `xl` (3rem) rounded corners, `surface-variant` background, and a `display-sm` numeral in the top right corner at 10% opacity for an editorial, numbered-list feel.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical white space. Leave one side of a layout significantly more open than the other.
*   **Do** use `primary-fixed-dim` (#81c7e8) for subtle icons and decorative elements.
*   **Do** ensure all "glass" elements have sufficient backdrop-blur to maintain readability over busy backgrounds.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#003348) to maintain the blue-tonal harmony.
*   **Don't** use the `none` roundedness setting. This system must feel soft and approachable; sharp corners break the "weightless" illusion.
*   **Don't** use standard Material Design ripples. Use soft "fade-in" transitions (200ms ease-out) for hover and active states.

---

## 7. Spacing & Rhythm
The system relies on the **"Oxygen Principle."** When in doubt, increase the padding.
*   Use `12` (4rem) or `16` (5.5rem) for vertical section gaps.
*   Use `3` (1rem) for internal component padding.
*   Layouts should never feel "packed." Every element should feel like it has room to float.