import io
from PIL import Image

def remove_signature_background(image_bytes: bytes) -> bytes:
    """
    Automatically removes paper/background from a handwritten signature image,
    converts it to a clean transparent PNG, sharpens the ink, and auto-crops margins.
    Uses Pillow's in-place PixelAccess with type-safe tuple unpacking.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    if pixels is None:
        raise ValueError("Could not access image pixel data.")

    # Sample pixels to determine adaptive paper background luminance
    step = max(1, int(((w * h) // 1500) ** 0.5))
    samples: list[int] = []
    for y in range(0, h, step):
        for x in range(0, w, step):
            px = pixels[x, y]
            if isinstance(px, tuple) and len(px) >= 4:
                r, g, b, a = px[0], px[1], px[2], px[3]
                if a > 0:
                    samples.append(int(0.299 * r + 0.587 * g + 0.114 * b))

    samples.sort()
    # 90th percentile represents dominant paper background
    paper_lum = max(samples[int(len(samples) * 0.90)] if samples else 220, 180)
    # Ink luminance: below this is guaranteed pure ink
    ink_lum = max(40, int(paper_lum * 0.55))

    for y in range(h):
        for x in range(w):
            px = pixels[x, y]
            if not isinstance(px, tuple) or len(px) < 4:
                continue

            r, g, b, a = px[0], px[1], px[2], px[3]
            if a == 0:
                continue

            lum = int(0.299 * r + 0.587 * g + 0.114 * b)
            if lum >= paper_lum:
                # Background paper: pure transparent
                pixels[x, y] = (255, 255, 255, 0)
            elif lum <= ink_lum:
                # Deep ink: fully opaque, preserve blue/black tone and sharpen
                is_blue = (b > r + 15) and (b > g + 15)
                if is_blue:
                    pixels[x, y] = (min(r, 30), min(g, 40), max(b, 100), 255)
                else:
                    pixels[x, y] = (min(r, 25), min(g, 25), min(b, 30), 255)
            else:
                # Smooth antialiased gradient for natural ink stroke edges
                ratio = (paper_lum - lum) / (paper_lum - ink_lum)
                alpha = int(255 * (ratio ** 1.3))
                is_blue = (b > r + 15) and (b > g + 15)
                if is_blue:
                    pixels[x, y] = (
                        int(r * (1 - 0.7 * ratio)),
                        int(g * (1 - 0.7 * ratio)),
                        max(int(b * (1 - 0.3 * ratio)), 80),
                        alpha
                    )
                else:
                    pixels[x, y] = (
                        int(r * (1 - 0.75 * ratio)),
                        int(g * (1 - 0.75 * ratio)),
                        int(b * (1 - 0.75 * ratio)),
                        alpha
                    )

    # Auto-crop bounding box around the ink with padding
    bbox = img.getbbox()
    if bbox:
        pad = 8
        crop_box = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(w, bbox[2] + pad),
            min(h, bbox[3] + pad)
        )
        img = img.crop(crop_box)

    out = io.BytesIO()
    img.save(out, format="PNG", optimize=True)
    return out.getvalue()
