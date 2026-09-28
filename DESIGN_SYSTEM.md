# Madrid, Remembered — Design System

## Fonts

Display + headings:
Ysabeau Infant

Body + UI:
Ysabeau

Do not introduce additional fonts.

## Core colors

Cream:
#FFFBF4

Yellow:
#F7D488

Red:
#720E07

Do not introduce additional brand colors.

## Neighborhood Mode

Background:
Red

Primary text + illustrations:
Cream

Accent / active states:
Yellow

Neighborhood illustrations must use transparent backgrounds.

## Styling Rules

- Always use CSS variables from `src/styles/tokens.css`.
- Do not hardcode colors in components.
- Do not invent new font sizes when an existing typography token works.
- Use the spacing scale instead of arbitrary pixel values.
- Use Ysabeau Infant only for headings/display typography.
- Use Ysabeau for body copy, buttons, labels, metadata, and UI.
- Preserve the hand-drawn illustrations as a core visual element.
- Do not add gradients unless explicitly requested.
- Do not add new colors unless explicitly requested.
- Do not change the design system without explicit approval.
