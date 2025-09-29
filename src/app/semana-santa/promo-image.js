"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

export default function PromoImage() {
  const qrRef = useRef(null);

  const handleExport = async () => {
    if (!qrRef.current) return;

    try {
      // Crear un canvas temporal solo para el QR
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 3200;
      tempCanvas.height = 3200;
      const ctx = tempCanvas.getContext("2d");

      // Dibujar el QR en el canvas temporal
      const qrCanvas = qrRef.current.querySelector("canvas");
      ctx.drawImage(qrCanvas, 0, 0, 3200, 3200);

      const dataUrl = tempCanvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = "qr-semana-santa-hd.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al exportar:", error);
    }
  };

  return (
    <>
      <div className="promo-container">
        <div className="promo-content">
          <div className="promo-header">
            <img
              src="/logo.png"
              alt="Logo I.E.L. El Pan de Vida"
              width="200"
              height="200"
              className="promo-logo"
              crossOrigin="anonymous"
            />
          </div>

          <div className="promo-message">
            <h1 className="promo-title">Semana Santa</h1>
            <h1 className="promo-title highlight">¿Realmente tan</h1>
            <h1 className="promo-title special">importante para mí?</h1>
            <p className="promo-subtitle">
              Descubre la historia más impactante de todos los tiempos.
              <br />
              Una semana que cambió el mundo para siempre.
            </p>
          </div>

          <div className="promo-qr" ref={qrRef}>
            <QRCodeCanvas
              value="https://www.ielpandevida.lat/semana-santa"
              size={800}
              level="H"
              includeMargin={true}
              className="qr-code"
            />
          </div>

          <div className="promo-footer">
            <p>I.E.L. &ldquo;El Pan de Vida&rdquo;</p>
          </div>
        </div>
      </div>
      <button onClick={handleExport} className="export-button">
        Exportar QR como PNG
      </button>
    </>
  );
}
