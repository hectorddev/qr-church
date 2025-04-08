"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="container-wrapper">
      <div className="verse-container">
        <div className="space-y-8">
          <p className="verse-text-1 text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 leading-tight">
            &ldquo;Porque de tal manera amó Dios al mundo...&rdquo;
          </p>

          <div className="heart text-6xl md:text-7xl lg:text-8xl flex justify-center">
            ❤️
          </div>

          <p className="verse-text-2 text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed">
            &ldquo;que dio a su Hijo unigénito, para que todo aquel que cree en
            Él, no se pierda, sino que tenga vida eterna.&rdquo;
          </p>

          <p className="verse-reference text-lg md:text-xl lg:text-2xl font-semibold">
            Juan 3:16
          </p>

          <div className="mt-6">
            <Link
              href="/calendar"
              className="bg-white bg-opacity-50 hover:bg-opacity-75 text-purple-800 py-2 px-4 rounded-full shadow-md transition-all duration-300 hover:shadow-lg"
            >
              Ver Calendario de Actividades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
