"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import ListView from "./ListView";
import "./listView.css";

export default function Calendar() {
  // Estado para los eventos
  const [events, setEvents] = useState([]);
  // Estado para el evento que se está editando
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    description: "",
    date: "",
  });
  // Estado para el mes actual
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  // Estado para el año actual
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // Estado para mostrar/ocultar modal de evento
  const [showEventModal, setShowEventModal] = useState(false);
  // Estado para mostrar un mensaje de carga
  const [loading, setLoading] = useState(true);
  // Estado para mostrar errores
  const [error, setError] = useState(null);
  // Estado para la vista (mes/semana/día)
  const [view, setView] = useState("month");
  // Estado para la vista en dispositivos móviles
  const [isMobile, setIsMobile] = useState(false);
  // Estado para el día actual seleccionado (para vista diaria)
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  // Estado para la semana actual seleccionada (para vista semanal)
  const [selectedWeek, setSelectedWeek] = useState(
    Math.ceil(new Date().getDate() / 7)
  );
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" o "list"

  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar inicialmente
    checkIfMobile();

    // Agregar event listener para cambios de tamaño
    window.addEventListener("resize", checkIfMobile);

    // Limpiar el event listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Cargar eventos de la API cuando se monta el componente
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error("Error al cargar los eventos");
        }

        const data = await response.json();
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error("Error cargando eventos:", err);
        setError(
          "No se pudieron cargar los eventos. Por favor, intenta de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Obtener nombres de los meses
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Obtener nombres cortos de los días de la semana
  const weekdayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Obtener el número de días en el mes actual
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Obtener el día de la semana del primer día del mes (0 = Domingo, 1 = Lunes, etc.)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Avanzar al mes siguiente
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Retroceder al mes anterior
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent({
      ...currentEvent,
      [name]: value,
    });
  };

  // Abrir modal para crear nuevo evento en la fecha seleccionada
  const openNewEventModal = (date) => {
    setCurrentEvent({
      title: "",
      description: "",
      date: date,
    });
    setShowEventModal(true);
  };

  // Agregar o actualizar un evento
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que se haya ingresado título y fecha
    if (!currentEvent.title || !currentEvent.date) {
      alert("Por favor, ingresa un título y una fecha");
      return;
    }

    try {
      if (currentEvent._id) {
        // Actualizar evento existente
        const response = await fetch(`/api/events/${currentEvent._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentEvent),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el evento");
        }

        const updatedEvent = await response.json();

        // Actualizar el estado local
        setEvents(
          events.map((event) =>
            event._id === updatedEvent._id ? updatedEvent : event
          )
        );
      } else {
        // Crear nuevo evento
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentEvent),
        });

        if (!response.ok) {
          throw new Error("Error al crear el evento");
        }

        const newEvent = await response.json();

        // Actualizar el estado local
        setEvents([...events, newEvent]);
      }

      // Limpiar el formulario y cerrar modal
      setCurrentEvent({ title: "", description: "", date: "" });
      setShowEventModal(false);
    } catch (err) {
      console.error("Error al guardar el evento:", err);
      alert(
        "Hubo un problema al guardar el evento. Por favor, intenta de nuevo."
      );
    }
  };

  // Editar un evento existente
  const editEvent = (date) => {
    const eventToEdit = events.find((event) => event.date === date);
    if (eventToEdit) {
      setCurrentEvent(eventToEdit);
      setShowEventModal(true);
    }
  };

  // Eliminar un evento
  const deleteEvent = async (date, e) => {
    e.stopPropagation();

    const eventToDelete = events.find((event) => event.date === date);

    if (!eventToDelete) {
      return;
    }

    if (confirm("¿Estás seguro de eliminar este evento?")) {
      try {
        const response = await fetch(`/api/events/${eventToDelete._id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Error al eliminar el evento");
        }

        // Actualizar el estado local
        setEvents(events.filter((event) => event._id !== eventToDelete._id));

        // Si estamos editando este evento, cerramos el modal
        if (currentEvent._id === eventToDelete._id) {
          setShowEventModal(false);
          setCurrentEvent({ title: "", description: "", date: "" });
        }
      } catch (err) {
        console.error("Error al eliminar el evento:", err);
        alert(
          "Hubo un problema al eliminar el evento. Por favor, intenta de nuevo."
        );
      }
    }
  };

  // Obtener el color para el evento según el título (para simular categorías)
  const getEventColor = (title) => {
    // Hash simple del título para determinar el color
    const hash = title
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-blue-100 border-blue-400 text-blue-800",
      "bg-green-100 border-green-400 text-green-800",
      "bg-yellow-100 border-yellow-400 text-yellow-800",
      "bg-red-100 border-red-400 text-red-800",
      "bg-purple-100 border-purple-400 text-purple-800",
      "bg-pink-100 border-pink-400 text-pink-800",
      "bg-indigo-100 border-indigo-400 text-indigo-800",
      "bg-teal-100 border-teal-400 text-teal-800",
    ];
    return colors[hash % colors.length];
  };

  // Verificar si la fecha es hoy
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Renderizar el calendario
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Calcular altura de las celdas basado en si es móvil o no
    const cellHeight = isMobile ? "h-20" : "h-28 md:h-32";

    // Agregar celdas vacías para los días anteriores al primer día del mes
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className={`${cellHeight} border border-gray-200 bg-gray-50`}
        ></div>
      );
    }

    // Agregar celdas para cada día del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const eventsForDay = events.filter((e) => e.date === date);
      const isTodayClass = isToday(day) ? "bg-blue-50 border-blue-300" : "";

      days.push(
        <div
          key={day}
          className={`${cellHeight} border border-gray-200 p-1 relative hover:bg-gray-50 cursor-pointer transition-colors ${isTodayClass}`}
          onClick={() => openNewEventModal(date)}
        >
          <div
            className={`flex justify-between items-center mb-1 ${
              isToday(day) ? "font-bold text-blue-600" : ""
            }`}
          >
            <span className="text-sm">{day}</span>
            {isToday(day) && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                Hoy
              </span>
            )}
          </div>

          <div
            className={`overflow-y-auto ${isMobile ? "max-h-14" : "max-h-20"}`}
          >
            {eventsForDay.map((event, index) => (
              <div
                key={index}
                className={`my-1 p-1 border-l-4 text-xs rounded shadow-sm cursor-pointer ${getEventColor(
                  event.title
                )}`}
                onClick={(e) => {
                  e.stopPropagation();
                  editEvent(date);
                }}
              >
                <div className="font-semibold truncate">{event.title}</div>
                {!isMobile &&
                  event.description &&
                  event.description.length > 0 && (
                    <div className="truncate text-xs opacity-75">
                      {event.description.slice(0, 20)}
                      {event.description.length > 20 ? "..." : ""}
                    </div>
                  )}
                <button
                  className="absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs"
                  onClick={(e) => deleteEvent(date, e)}
                >
                  &times;
                </button>
              </div>
            ))}
            {eventsForDay.length > 0 &&
              eventsForDay.length > (isMobile ? 1 : 2) && (
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {eventsForDay.length} evento
                  {eventsForDay.length !== 1 ? "s" : ""}
                </div>
              )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Renderizar vista de semana
  const renderWeekView = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

    // Calcular el día de inicio de la semana seleccionada
    const weekStartDay = (selectedWeek - 1) * 7 + 1;
    const weekEndDay = Math.min(weekStartDay + 6, daysInMonth);

    const days = [];

    // Días de la semana
    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={`weekday-${i}`}
          className="text-center font-medium py-2 border-b border-r last:border-r-0 text-gray-600"
        >
          <span className="hidden md:inline">{weekdayNames[i]}</span>
          <span className="md:hidden">{weekdayNames[i].charAt(0)}</span>
        </div>
      );
    }

    // Para cada día visible en la semana actual
    for (let day = weekStartDay; day <= weekEndDay; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const eventsForDay = events.filter((e) => e.date === date);
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
      const isTodayClass = isToday(day) ? "bg-blue-50 border-blue-300" : "";

      days.push(
        <div
          key={`week-${day}`}
          className={`h-36 md:h-48 border border-gray-200 p-2 relative hover:bg-gray-50 cursor-pointer transition-colors ${isTodayClass}`}
          onClick={() => openNewEventModal(date)}
        >
          <div
            className={`flex justify-between items-center mb-1 ${
              isToday(day) ? "font-bold text-blue-600" : ""
            }`}
          >
            <span className="text-sm">{day}</span>
            {isToday(day) && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                Hoy
              </span>
            )}
          </div>

          <div className="overflow-y-auto max-h-32 md:max-h-40">
            {eventsForDay.map((event, index) => (
              <div
                key={index}
                className={`my-1 p-1 border-l-4 text-xs rounded shadow-sm cursor-pointer ${getEventColor(
                  event.title
                )}`}
                onClick={(e) => {
                  e.stopPropagation();
                  editEvent(date);
                }}
              >
                <div className="font-semibold truncate">{event.title}</div>
                {event.description && event.description.length > 0 && (
                  <div className="truncate text-xs opacity-75">
                    {event.description.slice(0, 20)}
                    {event.description.length > 20 ? "..." : ""}
                  </div>
                )}
                <button
                  className="absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs"
                  onClick={(e) => deleteEvent(date, e)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Relleno para mantener la estructura de la cuadrícula
    const placeholdersNeeded = 7 - (weekEndDay - weekStartDay + 1);
    for (let i = 0; i < placeholdersNeeded; i++) {
      days.push(
        <div
          key={`placeholder-${i}`}
          className="h-36 md:h-48 border border-gray-200 bg-gray-50"
        ></div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              if (selectedWeek > 1) {
                setSelectedWeek(selectedWeek - 1);
              } else if (currentMonth > 0 || currentYear > 0) {
                prevMonth();
                const prevMonthDays = getDaysInMonth(
                  currentMonth === 0 ? 11 : currentMonth - 1,
                  currentMonth === 0 ? currentYear - 1 : currentYear
                );
                setSelectedWeek(Math.ceil(prevMonthDays / 7));
              }
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded p-2 flex items-center justify-center"
          >
            Semana Anterior
          </button>
          <div className="text-lg font-semibold">
            Semana {selectedWeek} de {Math.ceil(daysInMonth / 7)}
          </div>
          <button
            onClick={() => {
              const totalWeeks = Math.ceil(daysInMonth / 7);
              if (selectedWeek < totalWeeks) {
                setSelectedWeek(selectedWeek + 1);
              } else if (currentMonth < 11 || currentYear < 9999) {
                nextMonth();
                setSelectedWeek(1);
              }
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded p-2 flex items-center justify-center"
          >
            Semana Siguiente
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0">{days}</div>
      </>
    );
  };

  // Renderizar vista de día
  const renderDayView = () => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(selectedDay).padStart(2, "0")}`;
    const eventsForDay = events.filter((e) => e.date === date);
    const dayOfWeek = new Date(currentYear, currentMonth, selectedDay).getDay();
    const isTodayClass = isToday(selectedDay) ? "bg-blue-50" : "";

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              if (selectedDay > 1) {
                setSelectedDay(selectedDay - 1);
              } else if (currentMonth > 0 || currentYear > 0) {
                prevMonth();
                setSelectedDay(
                  getDaysInMonth(
                    currentMonth === 0 ? 11 : currentMonth - 1,
                    currentMonth === 0 ? currentYear - 1 : currentYear
                  )
                );
              }
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded p-2 flex items-center justify-center"
          >
            Día Anterior
          </button>
          <div className="text-lg font-semibold">
            {weekdayNames[dayOfWeek]} {selectedDay}
          </div>
          <button
            onClick={() => {
              const daysInCurrentMonth = getDaysInMonth(
                currentMonth,
                currentYear
              );
              if (selectedDay < daysInCurrentMonth) {
                setSelectedDay(selectedDay + 1);
              } else if (currentMonth < 11 || currentYear < 9999) {
                nextMonth();
                setSelectedDay(1);
              }
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded p-2 flex items-center justify-center"
          >
            Día Siguiente
          </button>
        </div>
        <div
          className={`rounded-lg shadow overflow-hidden ${isTodayClass} border border-gray-200 p-4`}
        >
          <div className="text-xl font-bold mb-4">
            {selectedDay} de {monthNames[currentMonth]} de {currentYear}
            {isToday(selectedDay) && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                Hoy
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-200">
            {eventsForDay.length > 0 ? (
              eventsForDay.map((event, index) => (
                <div
                  key={index}
                  className={`py-3 cursor-pointer hover:bg-gray-50`}
                  onClick={() => editEvent(date)}
                >
                  <div className={`flex items-start`}>
                    <div
                      className={`w-2 h-full rounded-full mr-3 ${
                        getEventColor(event.title).split(" ")[1]
                      }`}
                    ></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-700 mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex justify-end mt-2">
                        <button
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(date, e);
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                No hay eventos programados para este día.
                <div className="mt-4">
                  <button
                    onClick={() => openNewEventModal(date)}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    + Agregar Evento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <Link
            href="/"
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 w-full md:w-auto text-center"
          >
            Volver a Inicio
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-center text-purple-800 order-first md:order-none">
            Calendario de Actividades
          </h1>
          <button
            onClick={() => {
              setCurrentEvent({
                title: "",
                description: "",
                date: new Date().toISOString().split("T")[0],
              });
              setShowEventModal(true);
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center w-full md:w-auto"
          >
            <span className="mr-1">+</span> Nuevo Evento
          </button>
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg ${
                view === "month" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setView("month")}
            >
              Mes
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                view === "week" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setView("week")}
            >
              Semana
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                view === "day" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setView("day")}
            >
              Día
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={prevMonth}
              className="text-gray-600 hover:text-gray-800"
            >
              &lt;
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={nextMonth}
              className="text-gray-600 hover:text-gray-800"
            >
              &gt;
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Cargando eventos...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded text-red-700 mb-4">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === "calendar" ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  {view === "month" && (
                    <>
                      {/* Días de la semana */}
                      <div className="grid grid-cols-7 gap-0">
                        {weekdayNames.map((day, index) => (
                          <div
                            key={index}
                            className="text-center font-medium py-2 border-b border-r last:border-r-0 text-gray-600"
                          >
                            <span className="hidden md:inline">{day}</span>
                            <span className="md:hidden">{day.charAt(0)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Grid del calendario */}
                      <div className="grid grid-cols-7 gap-0">
                        {renderCalendar()}
                      </div>
                    </>
                  )}

                  {view === "week" && renderWeekView()}
                  {view === "day" && renderDayView()}
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ListView events={events} />
              </motion.div>
            )}
          </div>
        )}

        {/* Botón de cambio de vista */}
        <motion.button
          className="view-toggle"
          onClick={() =>
            setViewMode(viewMode === "calendar" ? "list" : "calendar")
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {viewMode === "calendar" ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              Ver Lista
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Ver Calendario
            </>
          )}
        </motion.button>

        {/* Información de eventos del día actual - solo visible en móvil */}
        {isMobile && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Eventos de hoy</h3>
            {events
              .filter(
                (event) => event.date === new Date().toISOString().split("T")[0]
              )
              .map((event, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 border-l-4 rounded shadow-sm ${getEventColor(
                    event.title
                  )}`}
                  onClick={() => editEvent(event.date)}
                >
                  <div className="font-semibold">{event.title}</div>
                  {event.description && (
                    <div className="text-sm opacity-75">
                      {event.description}
                    </div>
                  )}
                </div>
              ))}
            {events.filter(
              (event) => event.date === new Date().toISOString().split("T")[0]
            ).length === 0 && (
              <p className="text-gray-500 text-sm">No hay eventos para hoy</p>
            )}
          </div>
        )}
      </div>

      {/* Modal para eventos - responsive */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {currentEvent.title ? "Editar Evento" : "Nuevo Evento"}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="date"
                >
                  Fecha:
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={currentEvent.date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="title"
                >
                  Título:
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentEvent.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="description"
                >
                  Descripción:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentEvent.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto"
                >
                  {currentEvent._id ? "Actualizar" : "Agregar"}
                </button>
                {currentEvent._id && (
                  <button
                    type="button"
                    onClick={(e) => deleteEvent(currentEvent.date, e)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
