import zipfile
import re
import xml.etree.ElementTree as ET

with zipfile.ZipFile('ProofStack ppt.pptx', 'r') as z:
    for idx in range(1, 6):
        xml = z.read(f'ppt/slides/slide{idx}.xml').decode('utf-8', errors='ignore')
        colors = set(re.findall(r'srgbClr val="([0-9A-Fa-f]{6})"', xml))
        fonts = set(re.findall(r'typeface="([^"]+)"', xml))
        print(f"Slide {idx}:")
        print(f"  Colors: {list(colors)[:8]}")
        print(f"  Fonts: {list(fonts)[:5]}")
