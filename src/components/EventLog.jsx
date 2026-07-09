export default function EventLog({ events }) {
  return (
    <section className="panel event-panel">
      <div className="panel-header">
        <h2>Event Log</h2>
        <span className="badge muted-badge">Last 10</span>
      </div>
      <ul className="event-list">
        {events.length === 0 ? (
          <li className="muted">No events yet.</li>
        ) : (
          events.map((e) => (
            <li key={e.id}>
              <span className="event-turn">T{e.turn}</span>
              <span className="event-msg">{e.message}</span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
