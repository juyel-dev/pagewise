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
("L ink on canvas","#0F172A","#F8FAFC",4.5),("L ink on surface","#0F172A","#FFFFFF",4.5),("L ink-2 on canvas","#334155","#F8FAFC",4.5),("L ink-2 on surface-2","#334155","#F1F5F9",4.5),("L muted on canvas","#5D6B80","#F8FAFC",4.5),("L muted on surface","#5D6B80","#FFFFFF",4.5),("L muted on surface-2","#5D6B80","#F1F5F9",4.5),("L white on brand",W,"#2563EB",4.5),("L white on brand-hover",W,"#1D4ED8",4.5),("L brand-text on canvas","#1D4ED8","#F8FAFC",4.5),("L brand-text on brand-soft","#1D4ED8","#E8EFFD",4.5),("L good on good-soft","#15803D","#DCFCE7",4.5),("L bad on bad-soft","#B91C1C","#FEE2E2",4.5),("L good on surface","#15803D","#FFFFFF",4.5),("L bad on surface","#B91C1C","#FFFFFF",4.5),("L accent icon on canvas","#D97706","#F8FAFC",3.0),("L accent-text on accent-soft","#9A4A07","#FEF3C7",4.5),("L muted on field","#5D6B80","#EEF2F7",4.5),("L brand-ring on canvas","#3B82F6","#F8FAFC",3.0),("L brand-ring on surface","#3B82F6","#FFFFFF",3.0),
("D ink on canvas","#E8EEF9","#0B1120",4.5),("D ink on surface","#E8EEF9","#101A2C",4.5),("D ink-2 on canvas","#B7C4D6","#0B1120",4.5),("D ink-2 on surface-2","#B7C4D6","#16233B",4.5),("D muted on canvas","#8595A9","#0B1120",4.5),("D muted on surface","#8595A9","#101A2C",4.5),("D muted on surface-2","#8595A9","#16233B",4.5),("D white on brand",W,"#2563EB",4.5),("D white on brand-hover",W,"#1D4ED8",4.5),("D brand-text on canvas","#93C5FD","#0B1120",4.5),("D brand-text on surface","#93C5FD","#101A2C",4.5),("D brand-text on brand-soft","#93C5FD","#14233F",4.5),("D good on good-soft","#4ADE80","#10281A",4.5),("D bad on bad-soft","#F87171","#2D1414",4.5),("D accent icon on canvas","#F59E0B","#0B1120",3.0),("D accent-text on accent-soft","#F59E0B","#2A2008",4.5),("D muted on field","#8595A9","#1B2942",4.5),("D brand-ring on canvas","#60A5FA","#0B1120",3.0),("D brand-ring on surface","#60A5FA","#101A2C",3.0),
]
failed = 0
for label, fg, bg, target in PAIRS:
    r = ratio(fg, bg)
    ok = r >= target
    failed += not ok
    print(f"{'PASS' if ok else 'FAIL'}  {r:5.2f}  (target {target})  {label}  {fg} on {bg}")
print(f"\n{len(PAIRS) - failed}/{len(PAIRS)} pairs pass")
sys.exit(1 if failed else 0)
