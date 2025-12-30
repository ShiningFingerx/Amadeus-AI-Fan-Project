
import type { UserProfile } from '../types';

// Hardcoded Admin/Creator Credentials
const ADMIN_USER = 'ferris';
const ADMIN_PASS = 'kgıqwcn92137gfjtıwerv7cx12306n';

const getUsersFromStorage = (): Record<string, any> => {
    try {
        return JSON.parse(localStorage.getItem('amadeus-users') || '{}');
    } catch {
        return {};
    }
};

const saveUsersToStorage = (users: Record<string, any>): void => {
    localStorage.setItem('amadeus-users', JSON.stringify(users));
};

const generateAvatarSvg = (letter: string): string => {
    const charCode = letter.toUpperCase().charCodeAt(0) - 65;
    const colors = ['#06b6d4', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
    const color = colors[charCode % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#233a38"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="60" fill="${color}">${letter.toUpperCase()}</text></svg>`;
    const base64Svg = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64Svg}`;
};

export const login = (username: string, password: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check for Creator/Admin Backdoor
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                return resolve({
                    name: ADMIN_USER,
                    email: 'creator@amadeus.project',
                    picture: generateAvatarSvg('F'),
                });
            }

            const allUsers = getUsersFromStorage();
            const userData = allUsers[username];

            if (!userData || !userData.password) {
                return reject(new Error("Geçersiz kullanıcı adı veya şifre."));
            }

            if (userData.password === password) {
                resolve({
                    name: username,
                    email: `${username.toLowerCase()}@fg.lab`,
                    picture: userData.picture,
                });
            } else {
                reject(new Error("Geçersiz kullanıcı adı veya şifre."));
            }
        }, 1000);
    });
};

export const register = (username: string, password: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (username === ADMIN_USER) {
                return reject(new Error("Bu kullanıcı adı sistem tarafından ayrılmıştır."));
            }

            const allUsers = getUsersFromStorage();
            if (allUsers[username]) {
                return reject(new Error("Bu kullanıcı adı zaten alınmış."));
            }

            const picture = generateAvatarSvg(username[0] || '?');
            allUsers[username] = { password: password, picture };
            saveUsersToStorage(allUsers);
            
            resolve({
                name: username,
                email: `${username.toLowerCase()}@fg.lab`,
                picture: picture,
            });
        }, 1500);
    });
};
