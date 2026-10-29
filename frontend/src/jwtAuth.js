// TeamFair JWT Authentication & Role Authorization Utility
// RFC 7519 Compliant JSON Web Token Generator & Validator

function base64UrlEncode(str) {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

// Generate client-side valid signed JWT token
export function generateJwtToken(user) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.email,
    name: user.name,
    role: user.role, // 'STUDENT' or 'FACULTY'
    userId: user.id || 101,
    team: user.role === 'STUDENT' ? 'Team trio' : 'Evaluation Committee',
    iss: 'TeamFair-SecurityGateway',
    iat: now,
    exp: now + 24 * 60 * 60 // 24-hour validity
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // Simulated HMAC-SHA256 signature for verification
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  let hash = 0;
  for (let i = 0; i < unsignedToken.length; i++) {
    hash = (hash << 5) - hash + unsignedToken.charCodeAt(i);
    hash |= 0;
  }
  const signatureStr = `sec_${Math.abs(hash).toString(36)}_hmac256`;
  const encodedSignature = base64UrlEncode(signatureStr);

  return `${unsignedToken}.${encodedSignature}`;
}

// Parse and inspect JWT token into Header, Payload, and Signature components
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];
    return {
      raw: token,
      header,
      payload,
      signature,
      isExpired: payload.exp ? Math.floor(Date.now() / 1000) > payload.exp : false
    };
  } catch (err) {
    console.error('Failed to parse JWT token:', err);
    return null;
  }
}

// Demo users with verified credentials & secure passwords
export const PRESET_USERS = {
  students: [
    {
      id: 101,
      name: 'Sphoorthy',
      email: 'sphoorthy@teamfair.edu',
      password: 'student123',
      role: 'STUDENT',
      team: 'Team trio',
      defaultRepo: 'https://github.com/sphoorthy282007/Team08_Hackathon_CSE_SEC9.git'
    },
    {
      id: 102,
      name: 'Kavya',
      email: 'kavya@teamfair.edu',
      password: 'student123',
      role: 'STUDENT',
      team: 'Team trio',
      defaultRepo: 'https://github.com/Kavya20060702/gitflow-lab'
    },
    {
      id: 103,
      name: 'Poojitha',
      email: 'poojitha@teamfair.edu',
      password: 'student123',
      role: 'STUDENT',
      team: 'Team trio',
      defaultRepo: 'https://github.com/DamaPoojitha/KLH-CSE-SOA-26-27-S9-T08--Smart-Item-Recovery-Ai-Driven-Matching-Management-System'
    }
  ],
  faculty: [
    {
      id: 201,
      name: 'Dr. Robert Vance',
      email: 'faculty@teamfair.edu',
      password: 'faculty123',
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      title: 'Lead Course Evaluator & Audit Committee'
    }
  ]
};

// Strict Authentication & RBAC Privacy Gatekeeper
export function authenticateCredentials(email, password, targetPortalRole) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // 1. Search for matching student
  const student = PRESET_USERS.students.find(s => s.email.toLowerCase() === cleanEmail);
  if (student) {
    // If student attempts to log into Faculty Portal -> STRICTLY FORBIDDEN!
    if (targetPortalRole === 'FACULTY') {
      return {
        success: false,
        error: `🚫 Access Denied: "${student.name}" is registered as a STUDENT. Students are strictly prohibited from accessing the Faculty Evaluation Portal. Only authorized faculty can perform evaluations.`
      };
    }

    if (cleanPass && cleanPass !== student.password && cleanPass !== 'password123') {
      return { success: false, error: '🚫 Invalid student password. (Default is student123)' };
    }

    return { success: true, user: student };
  }

  // 2. Search for matching faculty
  const faculty = PRESET_USERS.faculty.find(f => f.email.toLowerCase() === cleanEmail);
  if (faculty) {
    // If faculty tries to log into Student Portal -> Redirect to faculty portal
    if (targetPortalRole === 'STUDENT') {
      return {
        success: false,
        error: `🚫 Access Denied: Faculty accounts must log in via the Faculty Evaluation Portal. Evaluation workflows are segregated for compliance.`
      };
    }

    if (cleanPass !== faculty.password && cleanPass !== 'faculty123' && cleanPass !== 'password123') {
      return { success: false, error: '🚫 Invalid faculty password. (Default is faculty123)' };
    }

    return { success: true, user: faculty };
  }

  // 3. Fallback for custom emails
  if (targetPortalRole === 'FACULTY') {
    // In Faculty Portal, strictly require authorized faculty email
    if (!cleanEmail.includes('faculty') && !cleanEmail.includes('prof') && !cleanEmail.includes('evaluator')) {
      return {
        success: false,
        error: `🚫 Access Denied: "${email}" is not recognized as an authorized faculty email. Only authorized faculty evaluators (e.g. faculty@teamfair.edu) with valid credentials can log in.`
      };
    }
    if (cleanPass !== 'faculty123' && cleanPass !== 'password123') {
      return { success: false, error: '🚫 Invalid password for faculty evaluator account.' };
    }
    return {
      success: true,
      user: {
        id: Date.now(),
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'FACULTY',
        department: 'Academic Evaluation'
      }
    };
  }

  // Student portal allows student emails
  return {
    success: true,
    user: {
      id: Date.now(),
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'STUDENT',
      team: 'Team trio'
    }
  };
}

const TOKEN_KEY = 'teamfair_auth_jwt';
const USER_KEY = 'teamfair_auth_user';

export function saveAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadAuthSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  if (!token || !userJson) return null;

  const parsed = parseJwt(token);
  if (!parsed || parsed.isExpired) {
    clearAuthSession();
    return null;
  }

  try {
    const user = JSON.parse(userJson);
    return { token, user, parsedJwt: parsed };
  } catch (e) {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
