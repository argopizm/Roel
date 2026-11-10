"""Kaynak afişten varsayılan site görsellerini kırpar (tek seferlik)."""
import sys
from PIL import Image

src = sys.argv[1]
im = Image.open(src).convert("RGB")
crops = {
    "diyafon": (26, 528, 278, 776),
    "kamera": (302, 528, 540, 776),
    "uydu": (562, 528, 800, 776),
    "elektrik": (822, 528, 1062, 776),
    "ev": (622, 196, 1087, 515),
}
for name, box in crops.items():
    c = im.crop(box)
    if name in ("diyafon", "kamera", "uydu", "elektrik"):
        c = c.resize((480, 480), Image.LANCZOS)
    c.save(f"public/img/{name}.jpg", quality=86)
    print(name, c.size)
