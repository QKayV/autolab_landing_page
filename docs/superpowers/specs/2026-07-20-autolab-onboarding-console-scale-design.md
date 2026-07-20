# Autolab Onboarding Console Scale

## Goal

Make the right-hand onboarding console feel more important and easier to read without disturbing the section's existing visual language or mobile containment.

## Approved direction

Use the balanced enlargement:

- Increase the console's desktop allocation from roughly 630px to roughly 740px at a 1440px viewport.
- Increase command text from 11px to 13px on desktop.
- Preserve the existing dark instrument styling, tabs, copy, interaction, and section rhythm.
- Keep the mobile console full-width within its current page padding, with a smaller type size that does not force page-level horizontal overflow.

## Implementation boundary

Change only the onboarding section's grid proportion and console typography/padding if needed for the larger type. Do not alter the hero terminal, animation system, onboarding commands, navigation, SEO files, or breakpoint structure.

## Responsive behavior

- Desktop: the console becomes the clear visual anchor on the right while the copy remains readable on the left.
- Tablet and mobile: the existing single-column layout remains; long commands may scroll inside the code block, but the page itself must not overflow horizontally.

## Verification

- A static contract test captures the intended desktop grid allocation and 13px command text.
- The complete existing test suite passes.
- Browser inspection at desktop and mobile confirms the console is larger, readable, and contained.
