#!/usr/bin/env python3
"""WCAG contrast checker for design tokens; exits 1 if any target is missed."""
import sys

def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def lum(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def ratio(a, b):
    la, lb = lum(a), lum(b)
    if la < lb: la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)

W = "#FFFFFF"
PAIRS = [
("L ink on canvas","#12201A","#FAFAF7",4.5),("L ink on surface","#12201A","#FFFFFF",4.5),("L ink-2 on canvas","#3B4A43","#FAFAF7",4.5),("L ink-2 on surface-2","#3B4A43","#F2F4EE",4.5),("L muted on canvas","#62736A","#FAFAF7",4.5),("L muted on surface","#62736A","#FFFFFF",4.5),("L muted on surface-2","#62736A","#F2F4EE",4.5),("L white on brand",W,"#148062",4.5),("L white on brand-hover",W,"#116750",4.5),("L brand-text on canvas","#116750","#FAFAF7",4.5),("L brand-text on brand-soft","#116750","#E6F5EE",4.5),("L good on good-soft","#15803D","#DCFCE7",4.5),("L bad on bad-soft","#B91C1C","#FEE2E2",4.5),("L good on surface","#15803D","#FFFFFF",4.5),("L bad on surface","#B91C1C","#FFFFFF",4.5),("L accent icon on canvas","#D97706","#FAFAF7",3.0),("L accent-text on accent-soft","#9A4A07","#FEF3C7",4.5),("L field border on surface","#78877F","#FFFFFF",3.0),("L field border on canvas","#78877F","#FAFAF7",3.0),("L brand-ring on canvas","#1F9C77","#FAFAF7",3.0),("L brand-ring on surface","#1F9C77","#FFFFFF",3.0),
("D ink on canvas","#E8EFEB","#0C1210",4.5),("D ink on surface","#E8EFEB","#121A17",4.5),("D ink-2 on canvas","#B9C8C0","#0C1210",4.5),("D ink-2 on surface-2","#B9C8C0","#17211D",4.5),("D muted on canvas","#8DA198","#0C1210",4.5),("D muted on surface","#8DA198","#121A17",4.5),("D muted on surface-2","#8DA198","#17211D",4.5),("D white on brand",W,"#148062",4.5),("D white on brand-hover",W,"#117155",4.5),("D brand-text on canvas","#6BCBA9","#0C1210",4.5),("D brand-text on surface","#6BCBA9","#121A17",4.5),("D brand-text on brand-soft","#6BCBA9","#12261F",4.5),("D good on good-soft","#4ADE80","#10281A",4.5),("D bad on bad-soft","#F87171","#2D1414",4.5),("D accent icon on canvas","#F59E0B","#0C1210",3.0),("D accent-text on accent-soft","#F59E0B","#2A2008",4.5),("D field border on surface","#62786E","#121A17",3.0),("D field border on canvas","#62786E","#0C1210",3.0),("D brand-ring on canvas","#3DB48D","#0C1210",3.0),("D brand-ring on surface","#3DB48D","#121A17",3.0),
]
failed = 0
for label, fg, bg, target in PAIRS:
    r = ratio(fg, bg)
    ok = r >= target
    failed += not ok
    print(f"{'PASS' if ok else 'FAIL'}  {r:5.2f}  (target {target})  {label}  {fg} on {bg}")
print(f"\n{len(PAIRS) - failed}/{len(PAIRS)} pairs pass")
sys.exit(1 if failed else 0)
