import SideBar from "./SideBar";


const data = [
  {
    health_issue: "Type 2 Diabetes",
    related_problem: "Frequent urination, increased thirst, and fatigue",
    from: "2021-03-15",
    to: "Present"
  },
  {
    health_issue: "High Blood Pressure",
    related_problem: "Headaches, dizziness, and blurred vision",
    from: "2020-08-10",
    to: "Present"
  },
  {
    health_issue: "Cholesterol Imbalance",
    related_problem: "Mild chest discomfort and occasional shortness of breath",
    from: "2019-11-05",
    to: "2022-12-20"
  },
  {
    health_issue: "Vitamin D Deficiency",
    related_problem: "Joint pain and tiredness",
    from: "2023-06-01",
    to: "2023-12-10"
  }
];

const HealthRecord = () => {
  return (
    <div className="hr-container">
      <SideBar id="healthrecord" />

      <main className="main-container">
        <header className="header">
          <div>
            <h1>Health Record</h1>
            <p>All systems operational. Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="new-record">New Record</div>
        </header>

        <section>
          {data.map((item, key) => (
            <div key={key} className="record-card">
              <div>
                <strong>{item.health_issue}</strong>
                <p>{item.related_problem}</p>
              </div>
              <div className="date-card">
                <p><strong>Duration:</strong> <span>{item.from}</span> - <span>{item.to}</span></p>
              </div>
            </div>
          ))}
        </section>

      </main>
    </div >
  );
}

export default HealthRecord;