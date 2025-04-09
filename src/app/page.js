"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">
        <div className="church-info">
          <div className="church-logo">
            <Image
              src="/logo.png"
              alt="Logo I.E.L. El Pan de Vida"
              width={200}
              height={200}
              className="logo-main"
              priority
            />
          </div>

          <h1 className="church-name">I.E.L. &ldquo;El Pan de Vida&rdquo;</h1>

          <div className="contact-info">
            <div className="info-card location-card">
              <div className="card-icon">📍</div>
              <div className="card-content">
                <h2>Ubicación</h2>
                <p className="main-text">El Abejal de Palmira</p>
                <p className="sub-text">
                  Vereda 6, 100mt más arriba de la Escuela
                </p>
              </div>
            </div>

            <div className="info-card contact-card">
              <div className="card-icon">📞</div>
              <div className="card-content">
                <h2>Contáctanos</h2>
                <a
                  href="https://wa.me/584247218061"
                  className="contact-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  0424-7218061
                  <span className="whatsapp-text">Envíanos un mensaje</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
