import { USERS } from '../data/users';

const SESSION_KEY = 'flowops_user_session';

export const login = (username, password, rememberMe) => {
  const user = USERS.find(u => u.username === username && u.password === password);

  if (user) {
    const sessionData = {
      username: user.username,
      name: user.name,
      role: user.role
    };

    // Store in localStorage if rememberMe is true, else sessionStorage
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }

    return { success: true, user: sessionData };
  }

  return { success: false, error: 'Invalid username or password.' };
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = () => {
  const sessionData = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (sessionData) {
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }
  return null;
};
