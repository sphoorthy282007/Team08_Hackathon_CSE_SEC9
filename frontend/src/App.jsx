import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('STUDENT');
  const [selectedStudent, setSelectedStudent] = useState('Sphoorthy');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Pre-loaded tasks with your exact real GitHub repository links
  const [tasks, setTasks] = useState([
    { 
      id: 101, 
      title: 'Hackathon Core Platform & UI Layout', 
      owner: 'Sphoorthy', 
      status: 'COMPLETED', 
      link: 'https://github.com/sphoorthy282007/Team08_Hackathon_CSE_SEC9.git' 
    },
    { 
      id: 102, 
      title: 'Gitflow Lab & Components', 
      owner: 'Kavya', 
      status: 'COMPLETED', 
      link: 'https://github.com/Kavya20060702/gitflow-lab' 
    },
    { 
      id: 103, 
      title: 'Smart Item Recovery & AI Matching System', 
      owner: 'Pooji', 
      status: 'IN_PROGRESS', 
      link: 'https://github.com/DamaPoojitha/KLH-CSE-SOA-26-27-S9-T08--Smart-Item-Recovery-Ai-Driven-Matching-Management-System' 
    }
  ]);

  // Dynamic disputes state
  const [disputes, setDisputes] = useState([
    {
      id: 201,
      team: 'Team trio',
      raisedBy: 'Sphoorthy',
      title: 'Workload Distribution in Smart Item Recovery Module',
      description: 'Requesting review and verification of contribution weight across microservice repositories.',
      status: 'OPEN',
      evidence: [
        'https://github.com/sphoorthy282007/Team08_Hackathon_CSE_SEC9.git',
        'https://github.com/Kavya20060702/gitflow-lab'
      ]
    }
  ]);

  // Notifications state for students
  const [notifications, setNotifications] = useState([
    { id: 1, recipient: 'Sphoorthy', message: 'Welcome to TeamFair! Workspace synced with repository links.', read: false, time: 'Just now' },
    { id: 2, recipient: 'Kavya', message: 'Welcome to TeamFair! Workspace synced with repository links.', read: false, time: 'Just now' },
    { id: 3, recipient: 'Pooji', message: 'Welcome to TeamFair! Workspace synced with repository links.', read: false, time: 'Just now' }
  ]);

  const [newTask, setNewTask] = useState({ title: '', owner: 'Sphoorthy', status: 'IN_PROGRESS', link: '' });
  
  // Custom dispute form state
  const [newDisputeTitle, setNewDisputeTitle] = useState('');
  const [newDisputeDescription, setNewDisputeDescription] = useState('');
  const [newDisputeUrl, setNewDisputeUrl] = useState('');
  
  const [facultyRemarks, setFacultyRemarks] = useState({});

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.link) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), owner: selectedStudent }]);
    setNewTask({ title: '', owner: selectedStudent, status: 'IN_PROGRESS', link: '' });
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleRaiseDispute = (e) => {
    e.preventDefault();
    if (!newDisputeTitle || !newDisputeDescription || !newDisputeUrl) return;
    setDisputes([
      ...disputes,
      {
        id: Date.now(),
        team: 'Team trio',
        raisedBy: selectedStudent,
        title: newDisputeTitle,
        description: newDisputeDescription,
        status: 'OPEN',
        evidence: [newDisputeUrl]
      }
    ]);
    setNewDisputeTitle('');
    setNewDisputeDescription('');
    setNewDisputeUrl('');
  };

  const handleResolveDispute = (id, newStatus) => {
    const targetDispute = disputes.find(d => d.id === id);
    setDisputes(
      disputes.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );

    if (targetDispute) {
      const remarkText = facultyRemarks[id] ? ` Remarks: "${facultyRemarks[id]}"` : '';
      const newNotif = {
        id: Date.now(),
        recipient: targetDispute.raisedBy,
        message: `Your dispute "${targetDispute.title}" was marked as ${newStatus} by Faculty.${remarkText}`,
        read: false,
        time: 'Just now'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleExportAuditLog = () => {
    let csvContent = "data:text/csv;charset=utf-8,Dispute ID,Team,Raised By,Title,Status,Faculty Remarks\n";
    disputes.forEach(d => {
      const remark = facultyRemarks[d.id] ? `"${facultyRemarks[d.id].replace(/"/g, '""')}"` : '""';
      csvContent += `${d.id},"${d.team}","${d.raisedBy}","${d.title.replace(/"/g, '""')}","${d.status}",${remark}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "TeamFair_Faculty_Audit_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const studentNotifications = notifications.filter(n => n.recipient === selectedStudent);
  const unreadCount = studentNotifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => n.recipient === selectedStudent ? { ...n, read: true } : n));
  };

  return (
    <div className="min-vh-100 bg-light position-relative">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
        <a className="navbar-brand fw-bold text-primary fs-4" href="#">
          🛡️ TeamFair <span className="fs-6 text-light fw-normal">| Contribution Tracking & Dispute Portal</span>
        </a>
        <div className="ms-auto d-flex align-items-center gap-3">
          {activeTab === 'STUDENT' && (
            <button 
              className="btn btn-outline-light btn-sm position-relative" 
              onClick={() => setShowNotificationsModal(!showNotificationsModal)}
            >
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <span className="text-light small">Active Portal View:</span>
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${activeTab === 'STUDENT' ? 'btn-primary' : 'btn-outline-light'}`}
              onClick={() => { setActiveTab('STUDENT'); setShowNotificationsModal(false); }}
            >
              Student Workspace
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'FACULTY' ? 'btn-warning' : 'btn-outline-light'}`}
              onClick={() => { setActiveTab('FACULTY'); setShowNotificationsModal(false); }}
            >
              Faculty Evaluation Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Notifications Popover */}
      {showNotificationsModal && activeTab === 'STUDENT' && (
        <div 
          className="position-absolute bg-white shadow-lg rounded border p-3" 
          style={{ top: '65px', right: '220px', width: '350px', zIndex: 1050 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold m-0 text-dark">Alerts for {selectedStudent}</h6>
            {unreadCount > 0 && (
              <button className="btn btn-link btn-sm p-0 text-decoration-none small" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          <hr className="my-2" />
          {studentNotifications.length === 0 ? (
            <p className="text-muted small my-2 text-center">No notifications available.</p>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {studentNotifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-2 mb-2 rounded border-start border-3 ${
                    n.read ? 'bg-light text-muted border-secondary' : 'bg-primary bg-opacity-10 text-dark border-primary'
                  }`}
                >
                  <p className="mb-1 small fw-semibold">{n.message}</p>
                  <span className="text-muted" style={{ fontSize: '11px' }}>{n.time}</span>
                </div>
              ))}
            </div>
          )}
          <button 
            className="btn btn-secondary btn-sm w-100 mt-2" 
            onClick={() => setShowNotificationsModal(false)}
          >
            Close
          </button>
        </div>
      )}

      <div className="container py-4">
        {activeTab === 'STUDENT' ? (
          <div>
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card border-0 shadow-sm p-4 bg-white d-flex flex-row justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-dark">Welcome back, {selectedStudent} (Team trio)</h4>
                    <p className="text-muted mb-0">Track your assigned contributions, submit work verification evidence, and manage peer reviews or disputes transparently.</p>
                  </div>
                  <div>
                    <label className="form-label small fw-bold text-muted me-2">Switch Student:</label>
                    <select 
                      className="form-select form-select-sm d-inline-block w-auto"
                      value={selectedStudent}
                      onChange={(e) => {
                        setSelectedStudent(e.target.value);
                        setShowNotificationsModal(false);
                      }}
                    >
                      <option value="Sphoorthy">Sphoorthy</option>
                      <option value="Kavya">Kavya</option>
                      <option value="Pooji">Pooji</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="alert alert-warning alert-dismissible fade show shadow-sm mb-4 d-flex justify-content-between align-items-center" role="alert">
                <div>
                  <strong>🔔 New Faculty Update!</strong> You have {unreadCount} unread resolution update(s).
                </div>
                <button 
                  className="btn btn-sm btn-outline-dark" 
                  onClick={() => setShowNotificationsModal(true)}
                >
                  View Alerts
                </button>
              </div>
            )}

            <div className="row g-4">
              {/* Task Evidence Submission */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white py-3 border-0">
                    <h5 className="card-title fw-bold m-0 text-primary">📌 Team Tasks & Work Evidence</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddTask} className="mb-4 p-3 bg-light rounded">
                      <h6 className="fw-bold mb-3">Add Work Record for {selectedStudent}</h6>
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Task Title..."
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          placeholder="Paste your GitHub URL..."
                          value={newTask.link}
                          onChange={(e) => setNewTask({ ...newTask, link: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-bold text-muted mb-1">Status Option:</label>
                        <select
                          className="form-select form-select-sm"
                          value={newTask.status}
                          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                        >
                          <option value="TO_DO">TO_DO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm w-100">Record Task Contribution</button>
                    </form>

                    <h6 className="fw-bold">Current Team Tasks & Repositories</h6>
                    <ul className="list-group list-group-flush">
                      {tasks.map((t) => (
                        <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                          <div>
                            <span className="fw-semibold">{t.title}</span> <br />
                            <small className="text-muted">Owner: <strong>{t.owner}</strong> | </small>
                            {t.link && (
                              <a href={t.link} target="_blank" rel="noreferrer" className="small text-decoration-underline fw-bold text-primary">
                                View GitHub Repo
                              </a>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <select
                              className={`form-select form-select-sm fw-bold text-white ${
                                t.status === 'COMPLETED' ? 'bg-success' : t.status === 'IN_PROGRESS' ? 'bg-warning text-dark' : 'bg-secondary'
                              }`}
                              style={{ width: '135px' }}
                              value={t.status}
                              onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                            >
                              <option value="TO_DO" className="bg-white text-dark">TO_DO</option>
                              <option value="IN_PROGRESS" className="bg-white text-dark">IN_PROGRESS</option>
                              <option value="COMPLETED" className="bg-white text-dark">COMPLETED</option>
                            </select>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Raise Custom Dispute Form */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white py-3 border-0">
                    <h5 className="card-title fw-bold m-0 text-danger">⚠️ Raise Contribution Dispute</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleRaiseDispute}>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Dispute Name / Subject</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Type custom dispute name..."
                          value={newDisputeTitle}
                          onChange={(e) => setNewDisputeTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Dispute Description</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="3"
                          placeholder="Type description regarding workload..."
                          value={newDisputeDescription}
                          onChange={(e) => setNewDisputeDescription(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Your GitHub / Proof URL</label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          placeholder="https://github.com/..."
                          value={newDisputeUrl}
                          onChange={(e) => setNewDisputeUrl(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-danger btn-sm w-100">Submit Dispute for Faculty Review</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Faculty View */}
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card border-0 shadow-sm p-4 bg-white border-start border-warning border-4 d-flex flex-row justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-dark">Faculty Evaluation Portal</h4>
                    <p className="text-muted mb-0">Review submitted student workload disputes, inspect verified repository evidence, and record binding outcomes with audit remarks.</p>
                  </div>
                  <div>
                    <button 
                      className="btn btn-dark btn-sm fw-bold px-3 py-2"
                      onClick={handleExportAuditLog}
                    >
                      📥 Export Faculty Audit Log (CSV)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <h5 className="fw-bold mb-3">Pending Case Disputes</h5>
                {disputes.map((d) => (
                  <div key={d.id} className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <span className="badge bg-secondary mb-2">{d.team}</span>
                          <h5 className="fw-bold text-dark m-0">{d.title}</h5>
                          <small className="text-muted">Raised by: <strong>{d.raisedBy}</strong></small>
                        </div>
                        <span className={`badge fs-6 ${
                          d.status === 'OPEN' ? 'bg-danger' : d.status === 'RESOLVED' ? 'bg-success' : 'bg-secondary'
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      <p className="bg-light p-3 rounded text-secondary">{d.description}</p>

                      <div className="mb-3">
                        <h6 className="fw-bold small text-uppercase text-muted">Submitted GitHub / Evidence Proofs:</h6>
                        <ul className="mb-0 ps-3">
                          {d.evidence.map((link, idx) => (
                            <li key={idx}>
                              <a href={link} target="_blank" rel="noreferrer" className="small text-decoration-underline fw-bold">{link}</a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <hr />

                      <div className="bg-light p-3 rounded">
                        <h6 className="fw-bold mb-2">Record Official Faculty Decision & Audit Remark</h6>
                        <textarea
                          className="form-control form-control-sm mb-3"
                          rows="2"
                          placeholder="Enter justification for grade adjustments or dispute outcome..."
                          value={facultyRemarks[d.id] || ''}
                          onChange={(e) => setFacultyRemarks({ ...facultyRemarks, [d.id]: e.target.value })}
                        ></textarea>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleResolveDispute(d.id, 'RESOLVED')}
                          >
                            Mark as RESOLVED & Notify Student
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleResolveDispute(d.id, 'REJECTED')}
                          >
                            Reject Dispute & Notify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}