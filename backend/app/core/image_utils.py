import io
from PIL import Image

def remove_signature_background(image_bytes: bytes) -> bytes:
    """
    Automatically removes paper/background from a handwritten signature image,
    converts it to a clean transparent PNG, sharpens the ink, and auto-crops margins.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    
    # Get RGBA pixel data
    datas = img.getdata()
    
    # Calculate luminance for each pixel
    # Standard ITU-R BT.601 formula: Y = 0.299 R + 0.587 G + 0.114 B
    luminances = [int(0.299 * r + 0.587 * g + 0.114 * b) for r, g, b, a in datas]
    
    # Sample pixels to determine adaptive background threshold
    step = max(1, len(luminances) // 2000)
    subsample = sorted(luminances[::step])
    # 90th percentile represents the dominant paper background color
    paper_lum = subsample[int(len(subsample) * 0.90)] if subsample else 220
    paper_lum = max(paper_lum, 180)  # Never allow threshold to drop below 180
    
    # Ink luminance: below this is guaranteed 100% ink
    ink_lum = max(40, int(paper_lum * 0.55))
    
    new_data = []
    for (r, g, b, a), lum in zip(datas, luminances):
        if a == 0:
            # Already transparent
            new_data.append((255, 255, 255, 0))
        elif lum >= paper_lum:
            # Background paper: completely transparent
            new_data.append((255, 255, 255, 0))
        elif lum <= ink_lum:
            # Deep ink: fully opaque, enhanced for clean printing
            # Preserve blueish or blackish tone
            is_blue = (b > r + 15) and (b > g + 15)
            if is_blue:
                dark_r = min(r, 30)
                dark_g = min(g, 40)
                dark_b = max(b, 100)
            else:
                dark_r = min(r, 25)
                dark_g = min(g, 25)
                dark_b = min(b, 30)
            new_data.append((dark_r, dark_g, dark_b, 255))
        else:
            # Transition gradient for smooth antialiased edges
            ratio = (paper_lum - lum) / (paper_lum - ink_lum)
            alpha = int(255 * (ratio ** 1.3))
            
            is_blue = (b > r + 15) and (b > g + 15)
            if is_blue:
                dark_r = int(r * (1 - 0.7 * ratio))
                dark_g = int(g * (1 - 0.7 * ratio))
                dark_b = max(int(b * (1 - 0.3 * ratio)), 80)
            else:
                dark_r = int(r * (1 - 0.75 * ratio))
                dark_g = int(g * (1 - 0.75 * ratio))
                dark_b = int(b * (1 - 0.75 * ratio))
            new_data.append((dark_r, dark_g, dark_b, alpha))
            
    img.putdata(new_data)
    
    # Auto-crop bounding box around the ink with padding
    bbox = img.getbbox()
    if bbox:
        w, h = img.size
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
