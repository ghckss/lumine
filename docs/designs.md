---
name: Moonlight Sanctuary
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e1'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3fb'
  surface-container: '#eeedf5'
  surface-container-high: '#e8e7ef'
  surface-container-highest: '#e2e2e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#49454f'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f8'
  outline: '#7a757f'
  outline-variant: '#cbc4d0'
  surface-tint: '#67558c'
  primary: '#67558c'
  on-primary: '#ffffff'
  primary-container: '#b19cd9'
  on-primary-container: '#443267'
  inverse-primary: '#d2bcfb'
  secondary: '#5c5d6e'
  on-secondary: '#ffffff'
  secondary-container: '#e1e1f5'
  on-secondary-container: '#626374'
  tertiary: '#625b70'
  on-tertiary: '#ffffff'
  tertiary-container: '#aba2b9'
  on-tertiary-container: '#3e384c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebddff'
  primary-fixed-dim: '#d2bcfb'
  on-primary-fixed: '#220f44'
  on-primary-fixed-variant: '#4f3d73'
  secondary-fixed: '#e1e1f5'
  secondary-fixed-dim: '#c5c5d8'
  on-secondary-fixed: '#191b29'
  on-secondary-fixed-variant: '#444655'
  tertiary-fixed: '#e8def7'
  tertiary-fixed-dim: '#ccc2db'
  on-tertiary-fixed: '#1e192a'
  on-tertiary-fixed-variant: '#4a4457'
  background: '#faf8ff'
  on-background: '#1a1b21'
  surface-variant: '#e2e2e9'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-xs: 4px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
  stack-xl: 80px
---

## Brand & Style

The design system is anchored in a sense of celestial tranquility and ethereal support. It targets users seeking a refuge from high-friction, high-contrast digital environments, providing a "night veil" aesthetic that is calming rather than dark. The brand personality is magical, nurturing, and luminous.

The visual style is a refined hybrid of **Glassmorphism** and **Minimalism**. It utilizes translucent layers, subtle iridescent gradients, and soft-focus glows to create a sense of depth without weight. Interface elements should feel like they are floating in a gentle, atmospheric space, utilizing light-refraction principles to maintain an airy, dream-like quality.

## Colors

The palette avoids harsh blacks and grays, opting instead for a "night veil" spectrum of tinted whites and desaturated purples. 

- **Primary & Secondary:** Soft lavender and iridescent purples form the core of the interactive elements and decorative gradients.
- **Backgrounds:** Use the neutral color as a base, layered with extremely subtle radial gradients of the secondary color to simulate a soft moonlight glow.
- **Text:** High-contrast black is replaced with a deep, muted plum-gray to maintain legibility while preserving the soft atmosphere.
- **Iridescence:** When using gradients, blend from `Primary` to `Accent Glow` with a 45-degree angle to simulate shimmering light.

## Typography

This design system utilizes **Plus Jakarta Sans** for all levels to leverage its modern, rounded, and welcoming character. 

- **Headlines:** Use a slightly tighter letter-spacing and medium-to-semibold weights to ground the airy layout.
- **Body:** Generous line heights are required to ensure the text feels "breathable" against the semi-transparent backgrounds.
- **Labels:** Use increased letter-spacing for smaller labels to maintain clarity and a sophisticated, editorial feel.
- **Hierarchy:** Use color (Text Soft) rather than just size to distinguish secondary information, maintaining a delicate visual weight.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with expansive margins to emphasize the airy "night veil" theme. 

- **Rhythm:** An 8px linear scale governs all padding and margin decisions. 
- **White Space:** Information density should be kept low. Use `stack-lg` and `stack-xl` to separate major content sections, allowing the background glows to permeate the layout.
- **Alignment:** Content should be centered or use asymmetrical offsets to create a more organic, less "engineered" feel.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Ambient Shadows** rather than standard drop shadows.

- **Surfaces:** All containers should use a semi-transparent white or light lavender fill (opacity between 40% and 70%) with a `backdrop-filter: blur(12px)`.
- **Shadows:** Use extremely soft, wide-spread shadows tinted with the primary purple color (`rgba(177, 156, 217, 0.15)`) instead of gray.
- **Borders:** Define edges with a 1px "inner glow" border—a semi-transparent white stroke that mimics the way light catches the edge of glass.
- **Layering:** Higher elevation levels should increase in background opacity and blur strength, appearing closer to the light source.

## Shapes

The shape language is consistently **Rounded**, avoiding sharp corners to maintain the supportive and calming tone. 

- **Standard Radius:** 0.5rem (8px) for small components like inputs.
- **Large Radius:** 1.5rem (24px) for cards and main containers to create a soft, pillowed appearance.
- **Interaction:** On hover, shapes may subtly expand or increase their corner radius to suggest a "squishy" or responsive tactile nature.

## Components

- **Buttons:** Primary buttons use an iridescent gradient background with a soft outer glow. Secondary buttons use a "ghost" style with a 1px glass border.
- **Cards:** These are the primary expression of the system's glassmorphism. They must feature a backdrop blur and a subtle 1px top-down white-to-transparent gradient border.
- **Input Fields:** Soft lavender backgrounds with 20% opacity. Upon focus, the background opacity increases, and the outer "glow" accentuates the border.
- **Chips & Tags:** Fully pill-shaped with high transparency. Use subtle text colors to indicate categories without cluttering the visual field.
- **Checkboxes & Radios:** Should feel organic; use soft-check icons and circular radio buttons that "breathe" (pulsate) when selected.
- **Modals:** Use a full-screen backdrop blur (`blur(20px)`) with a desaturated purple tint to isolate the user in a focused, tranquil space.
- **Additional Elements:** Incorporate "Glow Orbs"—large, low-opacity blurred circles positioned behind content to act as focal points or to guide the eye.