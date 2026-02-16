# Leaning Steamlit And Qrcode Liybrery 

import streamlit as st
import qrcode
from PIL import Image
import io

# --- Page Configuration ---
st.set_page_config(
    page_title="QR Studio | Python",
    page_icon="🎯",
    layout="wide"
)

# --- Custom Styling ---
st.markdown("""
    <style>
    .main {
        background-color: #f8fafc;
    }
    .stTextArea textarea {
        border-radius: 15px;
    }
    .stButton button {
        width: 100%;
        border-radius: 12px;
        height: 3em;
        background-color: #0f172a;
        color: white;
        font-weight: bold;
    }
    .stButton button:hover {
        background-color: #1e293b;
        border: none;
    }
    </style>
    """, unsafe_allow_html=True)

def generate_qr(text, fill_color, back_color, error_level):
    """Generates a QR code image based on parameters."""
    # Map error correction levels
    ecc_map = {
        "L (Low)": qrcode.constants.ERROR_CORRECT_L,
        "M (Medium)": qrcode.constants.ERROR_CORRECT_M,
        "Q (Quartile)": qrcode.constants.ERROR_CORRECT_Q,
        "H (High)": qrcode.constants.ERROR_CORRECT_H,
    }
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=ecc_map[error_level],
        box_size=10,
        border=4,
    )
    qr.add_data(text if text else " ")
    qr.make(fit=True)

    img = qr.make_image(fill_color=fill_color, back_color=back_color)
    return img

def main():
    st.title("QR 🎯 Studio")
    st.caption("Create high-quality QR codes in real-time using Python.")

    # Layout: Two columns
    col1, col2 = st.columns([1.5, 1], gap="large")

    with col1:
        st.subheader("📝 Content")
        data = st.text_area(
            "Enter URL or Text",
            value="https://google.com",
            placeholder="Type here...",
            help="The QR code will update instantly as you type.",
            height=150
        )

        st.subheader("🎨 Customization")
        c1, c2 = st.columns(2)
        
        with c1:
            fg_color = st.color_picker("Foreground Color", "#000000")
            error_level = st.select_slider(
                "Error Correction",
                options=["L (Low)", "M (Medium)", "Q (Quartile)", "H (High)"],
                value="L (Low)"
            )

        with c2:
            bg_color = st.color_picker("Background Color", "#FFFFFF")
            img_format = st.selectbox("Export Format", ["PNG", "JPEG"])

    with col2:
        st.subheader("🖼️ Preview")
        
        # Generate the QR Code
        qr_img = generate_qr(data, fg_color, bg_color, error_level)
        
        # Convert PIL image to bytes for display and download
        buf = io.BytesIO()
        qr_img.save(buf, format=img_format)
        byte_im = buf.getvalue()

        # Display the image - Updated to use width='stretch' per your terminal warning
        st.image(byte_im, width='stretch')
        
        # Download Button
        st.download_button(
            label=f"Download {img_format}",
            data=byte_im,
            file_name=f"qr_code.{img_format.lower()}",
            mime=f"image/{img_format.lower()}"
        )
        
        st.info("💡 **Pro Tip**: Use 'High' error correction if you plan to print the QR code on uneven surfaces.")

if __name__ == "__main__":
    main()
