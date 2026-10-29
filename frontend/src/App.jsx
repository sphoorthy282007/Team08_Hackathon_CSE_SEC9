import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  generateJwtToken,
  parseJwt,
  PRESET_USERS,
  authenticateCredentials,
  saveAuthSession,
  loadAuthSession,
  clearAuthSession
} from './jwtAuth';

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [parsedJwt, setParsedJwt] = useState(null);

  // Login Form & Role Toggle State
  const [loginRoleToggle, setLoginRoleToggle] = useState('STUDENT'); // 'STUDENT' or 'FACULTY'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Modals
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showJwtModal, setShowJwtModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Active student identity for student workspace
  const [selectedStudent, setSelectedStudent] = useState('Sphoorthy');

  // Pre-loaded tasks with real GitHub repository links from Team trio poster
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
      owner: 'Poojitha', 
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
    { id: 3, recipient: 'Poojitha', message: 'Welcome to TeamFair! Workspace synced with repository links.', read: false, time: 'Just now' }
  ]);

  // Task & Dispute form inputs
  const [newTask, setNewTask] = useState({ title: '', status: 'IN_PROGRESS', link: '' });
  const [newDisputeTitle, setNewDisputeTitle] = useState('');
  const [newDisputeDescription, setNewDisputeDescription] = useState('');
  const [newDisputeUrl, setNewDisputeUrl] = useState('');
  const [facultyRemarks, setFacultyRemarks] = useState({});

  // Restore authenticated session on mount
  useEffect(() => {
    const session = loadAuthSession();
    if (session) {
      setCurrentUser(session.user);
      setJwtToken(session.token);
      setParsedJwt(session.parsedJwt);
      if (session.user.role === 'STUDENT') {
        setSelectedStudent(session.user.name);
      }
    }
  }, []);

  // Sync selectedStudent repo link when switching
  useEffect(() => {
    const studentUser = PRESET_USERS.students.find(s => s.name === selectedStudent);
    if (studentUser) {
      setNewTask(prev => ({
        ...prev,
        link: prev.link || studentUser.defaultRepo
      }));
    }
  }, [selectedStudent]);

  // Perform JWT Authentication Login
  const handleLogin = (userToLogin, enforceRole) => {
    setAuthError('');

    // Strict Role Enforcement Guard
    if (enforceRole && userToLogin.role !== enforceRole) {
      if (enforceRole === 'FACULTY') {
        setAuthError(`🚫 Access Denied: "${userToLogin.name}" is registered as a STUDENT. Students are strictly prohibited from accessing the Faculty Evaluation Portal.`);
      } else {
        setAuthError(`🚫 Access Denied: "${userToLogin.name}" is FACULTY and must authenticate via the Faculty Evaluation Portal.`);
      }
      return;
    }

    // Generate authenticated JWT Token
    const token = generateJwtToken(userToLogin);
    const parsed = parseJwt(token);

    saveAuthSession(token, userToLogin);
    setCurrentUser(userToLogin);
    setJwtToken(token);
    setParsedJwt(parsed);

    if (userToLogin.role === 'STUDENT') {
      setSelectedStudent(userToLogin.name);
    }
    setShowNotificationsModal(false);
  };

  // Form submit for custom credentials login
  const handleCustomLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    const result = authenticateCredentials(loginEmail, loginPassword, loginRoleToggle);
    if (!result.success) {
      setAuthError(result.error);
      return;
    }

    handleLogin(result.user, loginRoleToggle);
  };

  // Logout & destroy JWT session
  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setJwtToken(null);
    setParsedJwt(null);
    setShowNotificationsModal(false);
    setShowJwtModal(false);
    setAuthError('');
    setLoginEmail('');
    setLoginPassword('');
  };

  // Task creation handler
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.link) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), owner: selectedStudent }]);
    const currentStudentUser = PRESET_USERS.students.find(s => s.name === selectedStudent);
    setNewTask({ 
      title: '', 
      status: 'IN_PROGRESS', 
      link: currentStudentUser ? currentStudentUser.defaultRepo : '' 
    });
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  // Dispute creation handler
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

  // Faculty resolution handler
  const handleResolveDispute = (id, newStatus) => {
    const targetDispute = disputes.find(d => d.id === id);
    setDisputes(disputes.map(d => d.id === id ? { ...d, status: newStatus } : d));

    if (targetDispute) {
      const remarkText = facultyRemarks[id] ? ` Remarks: "${facultyRemarks[id]}"` : '';
      const newNotif = {
        id: Date.now(),
        recipient: targetDispute.raisedBy,
        message: `Your dispute "${targetDispute.title}" was evaluated as ${newStatus} by Faculty.${remarkText}`,
        read: false,
        time: 'Just now'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // Export CSV Audit Log
  const handleExportAuditLog = () => {
    let csvContent = "data:text/csv;charset=utf-8,Dispute ID,Team,Raised By,Title,Status,Faculty Remarks\n";
    disputes.forEach(d => {
      const remark = facultyRemarks[d.id] ? `"${facultyRemarks[d.id].replace(/"/g, '""')}"` : '""';
      csvContent += `${d.id},"${d.team}","${d.raisedBy}","${d.title.replace(/"/g, '""')}","${d.status}",${remark}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "TeamFair_Official_Faculty_Audit_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Notifications filtering for active student
  const studentNotifications = notifications.filter(n => n.recipient === selectedStudent);
  const unreadCount = studentNotifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => n.recipient === selectedStudent ? { ...n, read: true } : n));
  };

  // Copy JWT to clipboard
  const handleCopyJwt = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(jwtToken);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // =========================================================================
  // VIEW 1: UNAUTHENTICATED LOGIN & ROLE PORTAL SELECTION
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column justify-content-between">
        {/* Header */}
        <nav className="navbar navbar-dark bg-dark px-4 py-3 shadow-sm">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <span className="navbar-brand fw-bold fs-4 text-primary mb-0">
              🛡️ TeamFair <span className="fs-6 text-light fw-normal">| Role-Based Privacy & JWT Authentication</span>
            </span>
            <span className="badge bg-secondary p-2">Team trio • Sphoorthy, Kavya, Poojitha</span>
          </div>
        </nav>

        {/* Login Container */}
        <div className="container my-auto py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="card border-0 shadow-lg overflow-hidden">
                <div className="card-header bg-dark text-white p-4 text-center">
                  <h3 className="fw-bold mb-1">🛡️ TeamFair Portal Login</h3>
                  <p className="text-light text-opacity-75 small mb-0">
                    Role-Restricted Workspaces • Strict Privacy Enforcement
                  </p>
                </div>

                <div className="card-body p-4 p-md-5">
                  {/* ROLE TOGGLE SELECTOR */}
                  <div className="text-center mb-4">
                    <label className="form-label fw-bold text-muted small text-uppercase d-block mb-2">
                      Choose Portal to Access:
                    </label>
                    <div className="btn-group w-100 shadow-sm" role="group">
                      <button
                        type="button"
                        className={`btn py-3 fw-bold fs-6 ${
                          loginRoleToggle === 'STUDENT'
                            ? 'btn-primary shadow'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => {
                          setLoginRoleToggle('STUDENT');
                          setAuthError('');
                          setLoginEmail('');
                          setLoginPassword('');
                        }}
                      >
                        🎓 Student Portal Login
                      </button>
                      <button
                        type="button"
                        className={`btn py-3 fw-bold fs-6 ${
                          loginRoleToggle === 'FACULTY'
                            ? 'btn-warning text-dark shadow'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => {
                          setLoginRoleToggle('FACULTY');
                          setAuthError('');
                          setLoginEmail('');
                          setLoginPassword('');
                        }}
                      >
                        🔒 Faculty Evaluation Portal Login
                      </button>
                    </div>
                  </div>

                  {/* Auth Error Alert */}
                  {authError && (
                    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
                      <span className="me-2 fs-4">🚫</span>
                      <div>
                        <strong>Authentication Blocked:</strong> {authError}
                      </div>
                    </div>
                  )}

                  {/* Role Privacy Notice */}
                  <div className={`alert ${loginRoleToggle === 'STUDENT' ? 'alert-info' : 'alert-warning'} border-0 mb-4`}>
                    <div className="d-flex align-items-center">
                      <span className="fs-3 me-3">{loginRoleToggle === 'STUDENT' ? '🎓' : '🔐'}</span>
                      <div>
                        <strong>{loginRoleToggle === 'STUDENT' ? 'Student Workspace Security:' : 'Confidential Faculty Evaluation Security:'}</strong>
                        <div className="small">
                          {loginRoleToggle === 'STUDENT'
                            ? 'Students can only enter the Student Workspace. Faculty evaluations, confidential remarks, and CSV audit logs are completely blocked and hidden from students.'
                            : 'STRICT FACULTY ACCESS ONLY: Students are barred from this portal. Only authorized faculty credentials and passwords can access the evaluation dashboard.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QUICK 1-CLICK AUTHENTICATION SECTION */}
                  <div className="mb-4 p-3 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-dark m-0">
                        ⚡ Authorized Accounts for {loginRoleToggle} Portal:
                      </h6>
                      <span className="badge bg-secondary">Verified Role Match</span>
                    </div>

                    {loginRoleToggle === 'STUDENT' ? (
                      <div>
                        <p className="text-muted small mb-2">
                          Click to authenticate as an authorized student in <strong>Team trio</strong>:
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {PRESET_USERS.students.map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              className="btn btn-outline-primary btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                              onClick={() => {
                                setLoginEmail(student.email);
                                setLoginPassword(student.password);
                                handleLogin(student, 'STUDENT');
                              }}
                            >
                              <span>👩‍💻</span>
                              <span><strong>{student.name}</strong></span>
                              <span className="badge bg-primary text-white">Student Role</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted small mb-2">
                          Official faculty evaluator credentials (students cannot use this):
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {PRESET_USERS.faculty.map((fac) => (
                            <button
                              key={fac.id}
                              type="button"
                              className="btn btn-warning text-dark btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                              onClick={() => {
                                setLoginEmail(fac.email);
                                setLoginPassword(fac.password);
                                handleLogin(fac, 'FACULTY');
                              }}
                            >
                              <span>👨‍🏫</span>
                              <span>Authorize as <strong>{fac.name}</strong></span>
                              <span className="badge bg-dark text-white">Faculty Clearance</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Credentials Form */}
                  <form onSubmit={handleCustomLogin} className="mt-4">
                    <h6 className="fw-bold text-muted small text-uppercase mb-3">
                      Or Log In with Registered {loginRoleToggle} Credentials:
                    </h6>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        {loginRoleToggle === 'STUDENT' ? 'Student Email' : 'Faculty Official Email'}
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder={loginRoleToggle === 'STUDENT' ? 'e.g. sphoorthy@teamfair.edu' : 'e.g. faculty@teamfair.edu'}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <label className="form-label small fw-semibold">
                          {loginRoleToggle === 'STUDENT' ? 'Student Password' : 'Faculty Password'}
                        </label>
                        <span className="text-muted small">
                          Default: <code>{loginRoleToggle === 'STUDENT' ? 'student123' : 'faculty123'}</code>
                        </span>
                      </div>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className={`btn w-100 py-2 fw-bold shadow-sm ${
                        loginRoleToggle === 'STUDENT' ? 'btn-primary' : 'btn-warning text-dark'
                      }`}
                    >
                      Authenticate & Access {loginRoleToggle === 'STUDENT' ? 'Student Workspace' : 'Faculty Portal'}
                    </button>
                  </form>
                </div>

                <div className="card-footer bg-light p-3 text-center text-muted small">
                  🔒 Cryptographically Enforced via RFC 7519 JWT Tokens • Students strictly prevented from accessing faculty evaluation data
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-dark text-white text-center py-3">
          <small className="text-muted">
            TeamFair © 2026 • Group Contribution & Dispute Management System • Team trio
          </small>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED PORTALS (STRICT RBAC & PRIVACY SEPARATION)
  // =========================================================================
  const isStudent = currentUser.role === 'STUDENT';
  const isFaculty = currentUser.role === 'FACULTY';

  return (
    <div className="min-vh-100 bg-light position-relative">
      {/* Navbar with Role Badges, JWT Inspector, & Logout */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm sticky-top">
        <a className="navbar-brand fw-bold text-primary fs-4" href="#">
          🛡️ TeamFair <span className="fs-6 text-light fw-normal">| {isStudent ? 'Student Workspace' : 'Faculty Evaluation Portal'}</span>
        </a>

        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Active Role Badge */}
          <span className={`badge ${isStudent ? 'bg-primary' : 'bg-warning text-dark'} px-3 py-2 fw-bold`}>
            {isStudent ? '🎓 ROLE: STUDENT' : '👨‍🏫 ROLE: FACULTY'}
          </span>

          {/* User Name Badge */}
          <span className="text-light fw-semibold small d-none d-md-inline">
            Logged in: <strong>{currentUser.name}</strong>
          </span>

          {/* JWT Token Inspector Button */}
          <button
            type="button"
            className="btn btn-outline-info btn-sm fw-bold d-flex align-items-center gap-1"
            onClick={() => setShowJwtModal(true)}
            title="Inspect RFC 7519 JSON Web Token & Claims"
          >
            <span>🔐</span>
            <span>JWT Verified</span>
          </button>

          {/* Notifications Modal (Only for Students) */}
          {isStudent && (
            <button 
              className="btn btn-outline-light btn-sm position-relative" 
              onClick={() => setShowNotificationsModal(!showNotificationsModal)}
            >
              🔔 Alerts
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Secure Logout Button */}
          <button
            type="button"
            className="btn btn-outline-danger btn-sm fw-bold"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Notifications Popover (Student Only) */}
      {showNotificationsModal && isStudent && (
        <div 
          className="position-absolute bg-white shadow-lg rounded border p-3" 
          style={{ top: '65px', right: '120px', width: '360px', zIndex: 1050 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold m-0 text-dark">🔔 Dispute Alerts for {selectedStudent}</h6>
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
            Close Alerts
          </button>
        </div>
      )}

      {/* JWT TOKEN INSPECTOR MODAL */}
      {showJwtModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">🔐 RFC 7519 JSON Web Token (JWT) Inspector</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowJwtModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-success d-flex align-items-center mb-3">
                  <span className="fs-4 me-2">🛡️</span>
                  <div>
                    <strong>JWT Cryptographically Verified:</strong> Role claim <code>role: "{currentUser.role}"</code> restricts access strictly to this portal. Cross-role tampering is blocked.
                  </div>
                </div>

                <h6 className="fw-bold text-muted small text-uppercase mb-2">Raw JWT Token (Bearer Token):</h6>
                <div className="bg-light p-3 rounded font-monospace small text-break mb-3 border">
                  {jwtToken}
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleCopyJwt}>
                    {copySuccess ? '✓ Copied to Clipboard!' : '📋 Copy Token'}
                  </button>
                  <span className="text-muted small">Payload Algorithm: HMAC-SHA256 (HS256)</span>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card h-100 border">
                      <div className="card-header bg-secondary text-white py-1 small fw-bold">
                        1. Decoded JWT Header
                      </div>
                      <div className="card-body p-2">
                        <pre className="mb-0 bg-light p-2 rounded small">
                          {JSON.stringify(parsedJwt?.header || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border">
                      <div className="card-header bg-primary text-white py-1 small fw-bold">
                        2. Decoded JWT Payload & Role Claims
                      </div>
                      <div className="card-body p-2">
                        <pre className="mb-0 bg-light p-2 rounded small">
                          {JSON.stringify(parsedJwt?.payload || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-dark btn-sm" onClick={() => setShowJwtModal(false)}>
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="container py-4">
        {/* ================================================================= */}
        {/* STUDENT PORTAL VIEW (Rendered ONLY if role === 'STUDENT')          */}
        {/* ================================================================= */}
        {isStudent && (
          <div>
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card border-0 shadow-sm p-4 bg-white d-flex flex-row justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-dark">Welcome back, {selectedStudent} (Team trio)</h4>
                    <p className="text-muted mb-0">
                      Track your assigned contributions, submit work verification evidence, and manage peer reviews or disputes transparently.
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label className="form-label small fw-bold text-muted mb-0">Switch Teammate View:</label>
                    <select 
                      className="form-select form-select-sm w-auto"
                      value={selectedStudent}
                      onChange={(e) => {
                        setSelectedStudent(e.target.value);
                        setShowNotificationsModal(false);
                      }}
                    >
                      <option value="Sphoorthy">Sphoorthy</option>
                      <option value="Kavya">Kavya</option>
                      <option value="Poojitha">Poojitha</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="alert alert-warning alert-dismissible fade show shadow-sm mb-4 d-flex justify-content-between align-items-center" role="alert">
                <div>
                  <strong>🔔 New Faculty Update!</strong> You have {unreadCount} unread dispute resolution update(s).
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
                      <button type="submit" className="btn btn-primary btn-sm w-100 fw-semibold">
                        Record Task Contribution
                      </button>
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
                          placeholder="Type description regarding workload distribution..."
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
                      <button type="submit" className="btn btn-danger btn-sm w-100 fw-semibold">
                        Submit Dispute for Faculty Review
                      </button>
                    </form>

                    <div className="alert alert-secondary mt-4 mb-0 small">
                      🔒 <strong>Student Privacy Guard:</strong> This portal is completely isolated. Faculty evaluations, confidential remarks, and CSV audit logs are segregated and can only be accessed by authorized faculty evaluators.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* FACULTY PORTAL VIEW (Rendered ONLY if role === 'FACULTY')          */}
        {/* ================================================================= */}
        {isFaculty && (
          <div>
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card border-0 shadow-sm p-4 bg-white border-start border-warning border-4 d-flex flex-row justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-dark">👨‍🏫 Faculty Evaluation Portal (Confidential)</h4>
                    <p className="text-muted mb-0">
                      Review submitted student workload disputes, inspect verified repository evidence, and record binding outcomes with audit remarks.
                    </p>
                  </div>
                  <div>
                    <button 
                      className="btn btn-dark btn-sm fw-bold px-3 py-2 shadow-sm"
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
                <h5 className="fw-bold mb-3">Pending Student Case Disputes</h5>
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
                            className="btn btn-success btn-sm fw-semibold"
                            onClick={() => handleResolveDispute(d.id, 'RESOLVED')}
                          >
                            ✅ Mark as RESOLVED & Notify Student
                          </button>
                          <button
                            className="btn btn-secondary btn-sm fw-semibold"
                            onClick={() => handleResolveDispute(d.id, 'REJECTED')}
                          >
                            ❌ Reject Dispute & Notify
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

        {/* Access Denied Guard if token has unexpected role */}
        {!isStudent && !isFaculty && (
          <div className="card border-danger shadow-sm p-4 text-center my-5">
            <h4 className="text-danger fw-bold">🚫 403 Forbidden: Invalid Portal Role</h4>
            <p className="text-muted">Your authenticated JWT token does not have authorized clearance for this portal.</p>
            <div>
              <button className="btn btn-outline-danger" onClick={handleLogout}>Return to Login</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
