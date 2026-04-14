# By Manthan Vinzuda 

from flask import Flask, request, jsonify, render_template
from PIL import Image, ImageEnhance
import numpy as np
import io

app = Flask(__name__)

ASCII_RAMPS = {
    "simple":  "@%#*+=-:. ",
    "detailed":"$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
    "blocks":  "█▓▒░ ",
    "dots":    "●◉◎○◌ ",
}

def convert(image_bytes, width=80, ramp="simple", invert=False, contrast=1.0, color=False):
    img = Image.open(io.BytesIO(image_bytes))
    img_rgb  = img.convert("RGB")
    img_gray = img.convert("L")

    img_gray = ImageEnhance.Contrast(img_gray).enhance(contrast)
    img_rgb  = ImageEnhance.Contrast(img_rgb).enhance(contrast)

    h = max(1, int(width * (img.height / img.width) * 0.45))
    img_gray = img_gray.resize((width, h), Image.LANCZOS)
    img_rgb  = img_rgb.resize((width, h), Image.LANCZOS)

    chars  = ASCII_RAMPS.get(ramp, ASCII_RAMPS["simple"])
    pixels = np.array(img_gray)
    if invert:
        pixels = 255 - pixels

    idx = (pixels / 255.0 * (len(chars) - 1)).astype(int)

    if color:
        rgb = np.array(img_rgb)
        rows = []
        for r in range(h):
            row = ""
            for c in range(width):
                rv, gv, bv = rgb[r, c]
                ch = chars[idx[r, c]]
                row += f'<span style="color:rgb({rv},{gv},{bv})">{ch}</span>'
            rows.append(row)
        return "\n".join(rows), True
    else:
        lines = ["".join(chars[idx[r, c]] for c in range(width)) for r in range(h)]
        return "\n".join(lines), False

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/convert", methods=["POST"])
def do_convert():
    f = request.files.get("image")
    if not f:
        return jsonify(error="No image"), 400
    data = f.read()
    if len(data) > 5 * 1024 * 1024:
        return jsonify(error="File too large (max 5MB)"), 400
    try:
        width    = int(request.form.get("width", 80))
        ramp     = request.form.get("ramp", "simple")
        invert   = request.form.get("invert", "false") == "true"
        contrast = float(request.form.get("contrast", 1.0))
        color    = request.form.get("color", "false") == "true"
        result, is_html = convert(data, width, ramp, invert, contrast, color)
        img = Image.open(io.BytesIO(data))
        h = max(1, int(width * (img.height / img.width) * 0.45))
        return jsonify(output=result, is_html=is_html, w=width, h=h)
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == "__main__":
    print("\n  ✨ ASCII Art Converter is running!")
    print("  👉 Open http://localhost:5050 in your browser\n")
    app.run(host="0.0.0.0", port=5050, debug=False)
