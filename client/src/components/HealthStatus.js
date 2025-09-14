const HealthStatus = () => {
  return (
    <div className="health-status">
      <h2>Health Status</h2>
      <p>All systems operational.</p>
      <p>Last updated: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default HealthStatus;