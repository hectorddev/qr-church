"use client";

import html2canvas from "html2canvas";
import Image from "next/image";
import { useState } from "react";
import "../semanaSanta.css";

export default function SemanaSanta() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureAndShare = async () => {
    try {
      setIsCapturing(true);

      // Capturamos el contenido principal
      const contentElement = document.querySelector(".semana-santa-container");
      const canvas = await html2canvas(contentElement, {
        scale: 2, // Mayor calidad
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Convertimos el canvas a blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      // Creamos un objeto File
      const file = new File([blob], "semana-santa.png", { type: "image/png" });

      // Intentamos compartir usando la Web Share API
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "La Historia de la Semana Santa",
          text: "Descubre el verdadero significado de la Semana Santa",
        });
      } else {
        // Si no está disponible Web Share API, descargamos la imagen
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "semana-santa.png";
        link.click();
      }
    } catch (error) {
      console.error("Error al compartir:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="semana-santa-container">
      <h1 className="semana-santa-title">La Historia de la Semana Santa</h1>

      <div className="comic-panel">
        <Image
          src="/1.jpg"
          alt="Entrada triunfal de Jesús en Jerusalén"
          width={800}
          height={400}
          className="comic-image"
        />
        <p className="semana-santa-text">
          Jesús entró triunfalmente en Jerusalén montado en un burro, mientras
          la gente lo recibía con palmas y gritos de &quot;¡Hosanna!&quot;. Este
          día se conoce como el <b>Domingo de Ramos</b>.
        </p>
      </div>

      <div className="comic-panel">
        <Image
          src="/2.jpg"
          alt="La Última Cena"
          width={800}
          height={400}
          className="comic-image"
        />
        <p className="semana-santa-text">
          En el Jueves Santo, Jesús celebró la Última Cena con sus discípulos,
          instituyendo la Santa Cena.{" "}
          <span className="semana-santa-highlight">
            &quot;Este es mi cuerpo... esta es mi sangre&quot;
          </span>
          , dijo, estableciendo el nuevo pacto.
        </p>
      </div>

      <div className="comic-panel semana-santa-panel-special">
        <Image
          src="/3.jpg"
          alt="Jesús en el Huerto de Getsemaní"
          width={800}
          height={400}
          className="comic-image"
        />
        <p className="semana-santa-text">
          En el Huerto de Getsemaní, Jesús oró intensamente antes de su arresto.{" "}
          <span className="semana-santa-highlight">
            &quot;Padre, si es posible, que pase de mí esta copa&quot;
          </span>
          , demostrando su humanidad mientras se sometía a la voluntad del
          Padre.
        </p>
      </div>

      <div className="comic-panel">
        <Image
          src="/4.jpg"
          alt="Jesús en la cruz"
          width={800}
          height={400}
          className="comic-image"
        />
        <p className="semana-santa-text">
          El Viernes Santo, Jesús fue crucificado. Sus últimas palabras fueron:{" "}
          <span className="semana-santa-highlight">
            &quot;Todo está consumado&quot;
          </span>
          . Este día recordamos su sacrificio por nuestros pecados.
        </p>
      </div>

      <div className="comic-panel semana-santa-panel-blue">
        <Image
          src="/5.jpg"
          alt="La Resurrección de Jesús"
          width={800}
          height={400}
          className="comic-image"
        />
        <p className="semana-santa-text">
          El Domingo de Resurrección, Jesús resucitó de entre los muertos,
          cumpliendo las profecías y demostrando su victoria sobre la muerte.{" "}
          <span className="semana-santa-text-blue">
            ¡Cristo ha resucitado! ¡Aleluya!
          </span>
        </p>
      </div>

      <p className="semana-santa-text-center">
        Esta es la historia que celebramos cada Semana Santa
      </p>

      <div className="mensaje-evangelistico">
        <h2 className="mensaje-titulo">¿Y esto qué tiene que ver contigo?</h2>

        <div className="mensaje-contenido">
          <p>
            Mientras lees esta historia, tal vez piensas que es solo algo que
            sucedió hace mucho tiempo. Pero hay algo asombroso que necesitas
            saber:
            <span className="mensaje-enfasis">
              {" "}
              cada momento de esta historia fue por ti
            </span>
            .
          </p>

          <div className="mensaje-dialogo">
            <p className="pregunta">¿En verdad todo esto fue por mí?</p>
            <p className="respuesta">
              Sí. Cada paso del camino fue pensando en ti.
            </p>
          </div>

          <p>
            Cuando Jesús extendió sus brazos en la cruz, pronunció tu nombre.
            Cuando derramó su sangre, pensaba en tu libertad. Cuando soportó el
            dolor, lo hizo para que tus heridas fueran sanadas. Y cuando la
            muerte parecía tener la última palabra,
            <b className="mensaje-enfasis-especial">¡RESUCITÓ!</b> abriendo un
            camino de esperanza para ti.
          </p>

          <p>
            Hoy, esta historia puede convertirse en tu historia. No es solo un
            relato del pasado, es una invitación personal a una nueva vida.
            Cristo vive, y quiere vivir en ti.
          </p>
        </div>
      </div>

      <button
        onClick={captureAndShare}
        disabled={isCapturing}
        className="share-button"
        aria-label="Compartir"
      >
        {isCapturing ? (
          <span className="loading-icon">⏳</span>
        ) : (
          <>
            <span className="share-icon">📤</span>
            <span className="share-text">Compartir</span>
          </>
        )}
      </button>

      <footer className="iglesia-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Image
              src="/logo.png"
              alt="Logo I.E.L. El Pan de Vida"
              width={120}
              height={120}
              className="logo-image"
            />
          </div>

          <div className="footer-info">
            <h3 className="footer-title">
              I.E.L. &ldquo;El Pan de Vida&rdquo;
            </h3>
            <div className="footer-details">
              <p className="location">
                <span className="icon">📍</span>
                El Abejal de Palmira
                <br />
                <span className="sub-location">
                  Vereda 6, 100mt más arriba de la Escuela
                </span>
              </p>
              <p className="contact">
                <span className="icon">📞</span>
                <a href="https://wa.me/584247218061" className="phone-link">
                  0424-7218061
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
