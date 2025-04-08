import { motion } from "framer-motion";

const ListView = ({ events }) => {
  // Ordenar eventos por fecha
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // Agrupar eventos por mes
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    // Asegurarse de que la fecha sea válida
    const date = new Date(event.date);
    if (isNaN(date.getTime())) {
      return groups;
    }

    const monthYear = date.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });

    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }

    groups[monthYear].push({
      ...event,
      formattedDate: date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    });
    return groups;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="list-view-container"
    >
      {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
        <div key={monthYear} className="month-group">
          <h2 className="month-title">{monthYear}</h2>
          <div className="events-list">
            {monthEvents.map((event) => {
              const date = new Date(event.date);

              return (
                <motion.div
                  key={event.id || event._id}
                  whileHover={{ scale: 1.02 }}
                  className="event-item"
                >
                  <div className="event-date">
                    <span className="event-day">{date.getDate()}</span>
                    <span className="event-weekday">
                      {date.toLocaleString("es-ES", { weekday: "short" })}
                    </span>
                  </div>
                  <div className="event-details">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-time">{event.formattedDate}</p>
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(groupedEvents).length === 0 && (
        <div className="no-events">
          <p>No hay eventos programados</p>
        </div>
      )}
    </motion.div>
  );
};

export default ListView;
