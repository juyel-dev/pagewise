#!/usr/bin/env python3
"""WCAG contrast checker for shipped light/dark design-token combinations."""
import sys


def lin(channel: int) -> float:
    channel /= 255
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def lum(color: str) -> float:
    value = color.lstrip("#")
    red, green, blue = (int(value[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(red) + 0.7152 * lin(green) + 0.0722 * lin(blue)


def ratio(foreground: str, background: str) -> float:
    first, second = lum(foreground), lum(background)
    lighter, darker = max(first, second), min(first, second)
    return (lighter + 0.05) / (darker + 0.05)


WHITE = "#FFFFFF"
PAIRS = [
    # Light theme
    ("L ink on canvas", "#0F172A", "#F8FAFC", 4.5),
    ("L ink on surface", "#0F172A", "#FFFFFF", 4.5),
    ("L ink-2 on canvas", "#334155", "#F8FAFC", 4.5),
    ("L ink-2 on surface-2", "#334155", "#F1F5F9", 4.5),
    ("L muted on canvas", "#5D6B80", "#F8FAFC", 4.5),
    ("L muted on surface", "#5D6B80", "#FFFFFF", 4.5),
    ("L muted on surface-2", "#5D6B80", "#F1F5F9", 4.5),
    ("L white on brand", WHITE, "#2563EB", 4.5),
    ("L white on brand-hover", WHITE, "#1D4ED8", 4.5),
    ("L brand-text on canvas", "#1D4ED8", "#F8FAFC", 4.5),
    ("L brand-text on brand-soft", "#1D4ED8", "#E8EFFD", 4.5),
    ("L good on good-soft", "#15803D", "#DCFCE7", 4.5),
    ("L bad on bad-soft", "#B91C1C", "#FEE2E2", 4.5),
    ("L good on surface", "#15803D", "#FFFFFF", 4.5),
    ("L bad on surface", "#B91C1C", "#FFFFFF", 4.5),
    ("L accent icon on canvas", "#D97706", "#F8FAFC", 3.0),
    ("L accent-text on accent-soft", "#9A4A07", "#FEF3C7", 4.5),
    ("L muted on field", "#5D6B80", "#EEF2F7", 4.5),
    ("L ink on field", "#0F172A", "#EEF2F7", 4.5),
    ("L brand-ring on canvas", "#3B82F6", "#F8FAFC", 3.0),
    ("L brand-ring on surface", "#3B82F6", "#FFFFFF", 3.0),
    ("L control border on field", "#64748B", "#EEF2F7", 3.0),
    ("L control border on surface", "#64748B", "#FFFFFF", 3.0),
    # Dark theme
    ("D ink on canvas", "#E8EEF9", "#0B1120", 4.5),
    ("D ink on surface", "#E8EEF9", "#101A2C", 4.5),
    ("D ink-2 on canvas", "#B7C4D6", "#0B1120", 4.5),
    ("D ink-2 on surface-2", "#B7C4D6", "#16233B", 4.5),
    ("D muted on canvas", "#8595A9", "#0B1120", 4.5),
    ("D muted on surface", "#8595A9", "#101A2C", 4.5),
    ("D muted on surface-2", "#8595A9", "#16233B", 4.5),
    ("D white on brand", WHITE, "#2563EB", 4.5),
    ("D white on brand-hover", WHITE, "#1D4ED8", 4.5),
    ("D brand-text on canvas", "#93C5FD", "#0B1120", 4.5),
    ("D brand-text on surface", "#93C5FD", "#101A2C", 4.5),
    ("D brand-text on brand-soft", "#93C5FD", "#14233F", 4.5),
    ("D good on good-soft", "#4ADE80", "#10281A", 4.5),
    ("D bad on bad-soft", "#F87171", "#2D1414", 4.5),
    ("D accent icon on canvas", "#F59E0B", "#0B1120", 3.0),
    ("D accent-text on accent-soft", "#F59E0B", "#2A2008", 4.5),
    ("D muted on field", "#8595A9", "#1B2942", 4.5),
    ("D ink on field", "#E8EEF9", "#1B2942", 4.5),
    ("D good on surface", "#4ADE80", "#101A2C", 4.5),
    ("D bad on surface", "#F87171", "#101A2C", 4.5),
    ("D good on canvas", "#4ADE80", "#0B1120", 4.5),
    ("D bad on canvas", "#F87171", "#0B1120", 4.5),
    ("D control border on field", "#64748B", "#1B2942", 3.0),
    ("D control border on surface", "#64748B", "#101A2C", 3.0),
    ("D brand-ring on canvas", "#60A5FA", "#0B1120", 3.0),
    ("D brand-ring on surface", "#60A5FA", "#101A2C", 3.0),
]

failed = 0
for label, foreground, background, target in PAIRS:
    actual = ratio(foreground, background)
    passed = actual >= target
    failed += not passed
    print(f"{'PASS' if passed else 'FAIL'}  {actual:5.2f}  (target {target})  {label}  {foreground} on {background}")

print(f"\n{len(PAIRS) - failed}/{len(PAIRS)} pairs pass")
sys.exit(1 if failed else 0)
