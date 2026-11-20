import io
import math
from PIL import Image, ImageFilter, ImageChops

def remove_signature_background(image_bytes: bytes) -> bytes:
    """
    State-of-the-art signature background removal:
    - Eliminates harsh shadows, smartphone shadows, room lighting gradients, and paper texture.
    - Uses dual-confirmation filtering: Division Illumination Normalization + Multi-Scale Black Top-Hat.
    - Soft polynomial antialiasing preserves natural pen stroke taper and fluidity.
    - Automatically detects and enriches Blue vs. Black ink for crisp executive appearance.
    - Removes dust speckles, paper grain, and photographic outer border artifacts.
    - Crops tightly to ink bounding box with balanced padding.
    - Returns optimized transparent PNG bytes.
    - Uses pure Pillow and Python standard library (no scipy/numpy external dependencies required).
    """
    if not image_bytes:
        raise ValueError("Empty image bytes provided.")

    try:
        orig_img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError(f"Could not open image: {e}")

    # 1. Normalize input image into RGB by compositing over pure white canvas.
    # This ensures that photos with shadows, scans with gray/cloudy backgrounds,
    # or images with partial transparency borders have all paper background cleanly detected and removed.
    if orig_img.mode in ("RGBA", "LA") or (orig_img.mode == "P" and "transparency" in orig_img.info):
        rgba = orig_img.convert("RGBA")
        white_bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        img = Image.alpha_composite(white_bg, rgba).convert("RGB")
    else:
        img = orig_img.convert("RGB")

    # 2. Normalize resolution for fast, consistent processing
    w, h = img.size
    max_dim = 1400
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        w = max(10, int(w * scale))
        h = max(10, int(h * scale))
        img = img.resize((w, h), Image.Resampling.LANCZOS)
    else:
        w, h = img.size

    lum = img.convert("L")

    # 3. Illumination Normalization (Flatten lighting gradients & shadows)
    k_bg = max(15, int(min(w, h) * 0.10))
    if k_bg % 2 == 0:
        k_bg += 1
    bg = lum.filter(ImageFilter.MaxFilter(k_bg)).filter(ImageFilter.GaussianBlur(max(2.0, k_bg / 4.0)))

    # 4. Multi-Scale Black Top-Hat Transform
    # Fine scale for thin pen strokes
    r_fine = max(5, int(min(w, h) * 0.018))
    if r_fine % 2 == 0:
        r_fine += 1
    th_fine = ImageChops.subtract(lum.filter(ImageFilter.MaxFilter(r_fine)).filter(ImageFilter.MinFilter(r_fine)), lum)

    # Medium scale for thicker markers / pens
    r_med = max(13, int(min(w, h) * 0.045))
    if r_med % 2 == 0:
        r_med += 1
    th_med = ImageChops.subtract(lum.filter(ImageFilter.MaxFilter(r_med)).filter(ImageFilter.MinFilter(r_med)), lum)

    tophat = ImageChops.lighter(th_fine, th_med)

    # 5. Fast dual-signal calculation & color analysis
    lum_bytes = lum.tobytes()
    bg_bytes = bg.tobytes()
    th_bytes = tophat.tobytes()
    rgb_bytes = img.tobytes()

    alpha = bytearray(w * h)
    blue_count = 0
    ink_count = 0

    for i in range(w * h):
        th = th_bytes[i]
        if th <= 2:
            continue

        l = lum_bytes[i]
        b = bg_bytes[i]
        norm = (l / max(b, 1)) * 255.0
        direct = max(0.0, 230.0 - norm)
        sig = math.sqrt(th * direct)

        if sig < 12.0:
            continue
        elif sig >= 38.0:
            a = 255
        else:
            t = (sig - 12.0) / 26.0
            a = int(255.0 * (t ** 1.15))

        alpha[i] = a

        if a > 75:
            ink_count += 1
            idx3 = i * 3
            r_val = rgb_bytes[idx3]
            g_val = rgb_bytes[idx3 + 1]
            b_val = rgb_bytes[idx3 + 2]
            if b_val > r_val + 12 and b_val > g_val + 12:
                blue_count += 1

    is_blue = (blue_count > ink_count * 0.40) if ink_count > 0 else False

    # 6. Suppress large border artifacts (shadow edges touching outer photographic frame)
    visited = bytearray(w * h)
    for y in (0, h - 1):
        for x in range(w):
            idx = y * w + x
            if alpha[idx] > 20 and not visited[idx]:
                q = [idx]
                visited[idx] = 1
                comp = [idx]
                min_x = max_x = x
                min_y = max_y = y
                while q:
                    curr = q.pop()
                    cy, cx = divmod(curr, w)
                    for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                        if 0 <= ny < h and 0 <= nx < w:
                            nidx = ny * w + nx
                            if alpha[nidx] > 20 and not visited[nidx]:
                                visited[nidx] = 1
                                q.append(nidx)
                                comp.append(nidx)
                                if nx < min_x: min_x = nx
                                if nx > max_x: max_x = nx
                                if ny < min_y: min_y = ny
                                if ny > max_y: max_y = ny
                span_w = (max_x - min_x) / w
                span_h = (max_y - min_y) / h
                if len(comp) > (w * h * 0.05) or span_w > 0.45 or span_h > 0.45:
                    for c_idx in comp:
                        alpha[c_idx] = 0

    for x in (0, w - 1):
        for y in range(h):
            idx = y * w + x
            if alpha[idx] > 20 and not visited[idx]:
                q = [idx]
                visited[idx] = 1
                comp = [idx]
                min_x = max_x = x
                min_y = max_y = y
                while q:
                    curr = q.pop()
                    cy, cx = divmod(curr, w)
                    for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                        if 0 <= ny < h and 0 <= nx < w:
                            nidx = ny * w + nx
                            if alpha[nidx] > 20 and not visited[nidx]:
                                visited[nidx] = 1
                                q.append(nidx)
                                comp.append(nidx)
                                if nx < min_x: min_x = nx
                                if nx > max_x: max_x = nx
                                if ny < min_y: min_y = ny
                                if ny > max_y: max_y = ny
                span_w = (max_x - min_x) / w
                span_h = (max_y - min_y) / h
                if len(comp) > (w * h * 0.05) or span_w > 0.45 or span_h > 0.45:
                    for c_idx in comp:
                        alpha[c_idx] = 0

    # 7. Build RGBA output with executive color enrichment
    out_rgba = bytearray(w * h * 4)
    for i in range(w * h):
        a = alpha[i]
        if a == 0:
            continue
        idx4 = i * 4
        idx3 = i * 3
        r_val = rgb_bytes[idx3]
        g_val = rgb_bytes[idx3 + 1]
        b_val = rgb_bytes[idx3 + 2]
        if is_blue:
            out_rgba[idx4] = min(35, max(12, int(r_val * 0.25)))
            out_rgba[idx4 + 1] = min(60, max(25, int(g_val * 0.35)))
            out_rgba[idx4 + 2] = min(190, max(100, int(b_val * 0.85 + 35)))
        else:
            out_rgba[idx4] = min(24, max(10, int(r_val * 0.18)))
            out_rgba[idx4 + 1] = min(24, max(10, int(g_val * 0.18)))
            out_rgba[idx4 + 2] = min(32, max(14, int(b_val * 0.22)))
        out_rgba[idx4 + 3] = a

    res_img = Image.frombytes("RGBA", (w, h), bytes(out_rgba))

    # 8. Auto-crop tightly
    bbox = res_img.getbbox()
    if bbox:
        pad = 10
        crop_box = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(w, bbox[2] + pad),
            min(h, bbox[3] + pad)
        )
        res_img = res_img.crop(crop_box)

    out = io.BytesIO()
    res_img.save(out, format="PNG", optimize=True)
    return out.getvalue()
