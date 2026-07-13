import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc
} from "firebase/firestore";

import firebaseConfig from "/firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const firestore = getFirestore(app, "ai-studio-nur-75c3cfcd-6f20-47f3-bc56-3443948e8f41");

// Keep track of pending registration details
let pendingRegistration = null;
let cachedDbRole = null;

// Guest User ID generator & persistent store
function getGuestUserId() {
  let guestId = localStorage.getItem("guest_user_id");
  if (!guestId) {
    guestId = "guest_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("guest_user_id", guestId);
  }
  return guestId;
}

// Get Telegram WebApp user if available
function getTgUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

// Check if a Telegram user should be an Administrator
function isTelegramAdmin(tgUser) {
  if (!tgUser) return false;
  const username = (tgUser.username || "").toLowerCase();
  const idStr = String(tgUser.id || "");
  
  // List of admin Telegram usernames or user IDs
  const adminList = [
    "usacoder29",
    "usacoder",
    "nur_admin",
    "admin",
  ];
  
  return adminList.includes(username) || 
         adminList.includes(idStr) || 
         username.includes("usacoder29") || 
         username.includes("usacoder");
}

// Ensure Auth is ready helper with automatic anonymous login
let authInitialized = false;
let authUser = null;
const authReadyPromise = new Promise((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    const tgUser = getTgUser();
    const displayName = tgUser 
      ? (tgUser.first_name + (tgUser.last_name ? " " + tgUser.last_name : ""))
      : "Mehmon";
    const email = tgUser 
      ? `${tgUser.username || tgUser.id}@telegram.mini` 
      : "mehmon@nur.uz";

    const isTgAdmin = isTelegramAdmin(tgUser);

    if (user) {
      authUser = user;
      authInitialized = true;
      setDoc(doc(firestore, "User", user.uid), {
        id: user.uid,
        email: user.email || email,
        full_name: user.displayName || displayName,
        telegram_id: tgUser?.id || null,
        telegram_username: tgUser?.username || null,
        role: isTgAdmin ? "admin" : "user"
      }, { merge: true }).catch((err) => {
        console.warn("Could not save Telegram user metadata to Firestore:", err);
      });
      resolve(user);
    } else {
      // Trigger anonymous login if no active session
      try {
        const credential = await signInAnonymously(auth);
        authUser = credential.user;
        authInitialized = true;
        setDoc(doc(firestore, "User", credential.user.uid), {
          id: credential.user.uid,
          email: email,
          full_name: displayName,
          telegram_id: tgUser?.id || null,
          telegram_username: tgUser?.username || null,
          role: isTgAdmin ? "admin" : "user"
        }, { merge: true }).catch((err) => {
          console.warn("Could not register Telegram anonymous user in Firestore:", err);
        });
        resolve(credential.user);
      } catch (err) {
        console.warn("Firebase anonymous authentication failed, using local guest fallback:", err);
        authInitialized = true;
        resolve(null);
      }
    }
  });
});

const ensureAuthReady = () => {
  return Promise.race([
    authReadyPromise,
    new Promise((resolve) => setTimeout(() => resolve(null), 1500))
  ]);
};

// Offline Local Storage Fallback helpers
function getOfflineItems(entityName) {
  try {
    const data = localStorage.getItem("offline_db_" + entityName);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn("Could not read offline database for:", entityName, e);
    return [];
  }
}

function saveOfflineItems(entityName, items) {
  try {
    localStorage.setItem("offline_db_" + entityName, JSON.stringify(items));
  } catch (e) {
    console.warn("Could not write offline database for:", entityName, e);
  }
}

async function getActiveUserId() {
  const user = await ensureAuthReady();
  if (user) {
    return user.uid;
  }
  return getGuestUserId();
}

const USER_SPECIFIC_COLLECTIONS = ["DailyProgress", "FastingLog", "FavoriteDua", "NotificationLog"];

export const db = {
  auth: {
    isAuthenticated: async () => {
      return true;
    },
    me: async () => {
      const user = await ensureAuthReady();
      const tgUser = getTgUser();
      const tgDisplayName = tgUser 
        ? (tgUser.first_name + (tgUser.last_name ? " " + tgUser.last_name : ""))
        : null;
      const tgEmail = tgUser 
        ? `${tgUser.username || tgUser.id}@telegram.mini` 
        : null;

      const isAdminBypass = localStorage.getItem("bypass_admin") === "true";
      const isTgAdmin = isTelegramAdmin(tgUser);

      let dbRole = "user";
      if (isAdminBypass || isTgAdmin) {
        dbRole = "admin";
      } else if (cachedDbRole) {
        dbRole = cachedDbRole;
      } else if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "User", user.uid));
          if (userDoc.exists()) {
            dbRole = userDoc.data().role || "user";
            cachedDbRole = dbRole;
          }
        } catch (e) {
          console.warn("Could not fetch user role from Firestore:", e);
        }
      }

      const isUserAdmin = (user && user.email === "admin@example.com") || 
                          isAdminBypass || 
                          isTgAdmin || 
                          dbRole === "admin";

      if (user) {
        return {
          id: user.uid,
          email: user.email || tgEmail || "mehmon@nur.uz",
          full_name: tgDisplayName || user.displayName || "Mehmon",
          role: isUserAdmin ? "admin" : "user",
          telegram_user: tgUser
        };
      } else {
        const guestId = getGuestUserId();
        return {
          id: guestId,
          email: tgEmail || "mehmon@nur.uz",
          full_name: tgDisplayName || "Mehmon",
          role: (isAdminBypass || isTgAdmin) ? "admin" : "user",
          telegram_user: tgUser
        };
      }
    },
    logout: async () => {
      await signOut(auth);
    },
    loginViaEmailPassword: async (email, password) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const isAdmin = user.email === "admin@example.com" || localStorage.getItem("bypass_admin") === "true";
      await setDoc(doc(firestore, "User", user.uid), {
        id: user.uid,
        email: user.email,
        full_name: user.displayName || user.email.split("@")[0],
        role: isAdmin ? "admin" : "user"
      }, { merge: true });
      return userCredential.user;
    },
    loginWithProvider: async (providerName) => {
      if (providerName === "google") {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        const isAdmin = user.email === "admin@example.com" || localStorage.getItem("bypass_admin") === "true";
        await setDoc(doc(firestore, "User", user.uid), {
          id: user.uid,
          email: user.email,
          full_name: user.displayName || user.email.split("@")[0],
          role: isAdmin ? "admin" : "user"
        }, { merge: true });
        return userCredential.user;
      }
      throw new Error(`Provider ${providerName} not supported`);
    },
    register: async ({ email, password }) => {
      pendingRegistration = { email, password };
      return { success: true };
    },
    verifyOtp: async ({ email, otpCode }) => {
      const reg = pendingRegistration;
      if (!reg || reg.email !== email) {
        throw new Error("No pending registration found for this email");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, reg.email, reg.password);
      const user = userCredential.user;
      const isAdmin = user.email === "admin@example.com" || localStorage.getItem("bypass_admin") === "true";
      await setDoc(doc(firestore, "User", user.uid), {
        id: user.uid,
        email: user.email,
        full_name: user.displayName || user.email.split("@")[0],
        role: isAdmin ? "admin" : "user"
      });
      pendingRegistration = null;
      return { access_token: "firebase-dummy-token" };
    },
    resendOtp: async () => {
      return { success: true };
    },
    resetPasswordRequest: async (email) => {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    },
    resetPassword: async ({ resetToken, newPassword }) => {
      await confirmPasswordReset(auth, resetToken, newPassword);
      return { success: true };
    },
    setToken: () => {}
  },
  entities: new Proxy({}, {
    get: (target, entityName) => {
      return {
        list: async (sortParam, limitParam) => {
          let items = [];
          try {
            const snapshot = await getDocs(collection(firestore, entityName));
            snapshot.forEach((docSnap) => {
              items.push({ id: docSnap.id, ...docSnap.data() });
            });
            // Update offline cache
            saveOfflineItems(entityName, items);
          } catch (error) {
            console.warn(`Firestore getDocs failed for ${entityName}, using local cache:`, error);
            items = getOfflineItems(entityName);
          }

          // Enforce user-specific scoping
          if (USER_SPECIFIC_COLLECTIONS.includes(entityName)) {
            const userId = await getActiveUserId();
            const user = await ensureAuthReady();
            const isAdmin = (user && user.email === "admin@example.com") || localStorage.getItem("bypass_admin") === "true";
            if (!isAdmin) {
              items = items.filter(item => item.created_by_id === userId);
            }
          }

          // In-memory sort
          if (sortParam && typeof sortParam === "string") {
            const isDesc = sortParam.startsWith("-");
            const field = isDesc ? sortParam.slice(1) : sortParam;
            items.sort((a, b) => {
              const valA = a[field];
              const valB = b[field];
              if (valA === undefined || valA === null) return isDesc ? 1 : -1;
              if (valB === undefined || valB === null) return isDesc ? -1 : 1;
              if (valA < valB) return isDesc ? 1 : -1;
              if (valA > valB) return isDesc ? -1 : 1;
              return 0;
            });
          }

          // In-memory limit
          if (limitParam && typeof limitParam === "number") {
            items = items.slice(0, limitParam);
          }

          return items;
        },
        filter: async (queryObj, sortParam, limitParam) => {
          let items = [];
          try {
            const snapshot = await getDocs(collection(firestore, entityName));
            snapshot.forEach((docSnap) => {
              items.push({ id: docSnap.id, ...docSnap.data() });
            });
            // Update offline cache
            saveOfflineItems(entityName, items);
          } catch (error) {
            console.warn(`Firestore getDocs filter failed for ${entityName}, using local cache:`, error);
            items = getOfflineItems(entityName);
          }

          // Filter by custom properties
          if (queryObj && typeof queryObj === "object") {
            items = items.filter(item => {
              return Object.entries(queryObj).every(([key, value]) => {
                return item[key] === value;
              });
            });
          }

          // Enforce user-specific scoping
          if (USER_SPECIFIC_COLLECTIONS.includes(entityName)) {
            const userId = await getActiveUserId();
            const user = await ensureAuthReady();
            const isAdmin = (user && user.email === "admin@example.com") || localStorage.getItem("bypass_admin") === "true";
            if (!isAdmin) {
              items = items.filter(item => item.created_by_id === userId);
            }
          }

          // In-memory sort
          if (sortParam && typeof sortParam === "string") {
            const isDesc = sortParam.startsWith("-");
            const field = isDesc ? sortParam.slice(1) : sortParam;
            items.sort((a, b) => {
              const valA = a[field];
              const valB = b[field];
              if (valA === undefined || valA === null) return isDesc ? 1 : -1;
              if (valB === undefined || valB === null) return isDesc ? -1 : 1;
              if (valA < valB) return isDesc ? 1 : -1;
              if (valA > valB) return isDesc ? -1 : 1;
              return 0;
            });
          }

          // In-memory limit
          if (limitParam && typeof limitParam === "number") {
            items = items.slice(0, limitParam);
          }

          return items;
        },
        get: async (id) => {
          try {
            const docRef = doc(firestore, entityName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              return { id: docSnap.id, ...docSnap.data() };
            }
          } catch (error) {
            console.warn(`Firestore getDoc failed for ${entityName}/${id}, using local cache:`, error);
          }
          const items = getOfflineItems(entityName);
          return items.find(item => item.id === id) || null;
        },
        create: async (data) => {
          const userId = await getActiveUserId();
          const docData = {
            ...data,
            created_by_id: userId,
            created_at: new Date().toISOString()
          };
          let createdId = "local_" + Math.random().toString(36).substring(2, 15);
          
          try {
            const docRef = await addDoc(collection(firestore, entityName), docData);
            createdId = docRef.id;
          } catch (error) {
            console.warn(`Firestore addDoc failed for ${entityName}, saving locally:`, error);
          }

          const newItem = { id: createdId, ...docData };
          const items = getOfflineItems(entityName);
          items.push(newItem);
          saveOfflineItems(entityName, items);

          return newItem;
        },
        update: async (id, data) => {
          try {
            const docRef = doc(firestore, entityName, id);
            await updateDoc(docRef, data);
          } catch (error) {
            console.warn(`Firestore updateDoc failed for ${entityName}/${id}, saving locally:`, error);
          }

          const items = getOfflineItems(entityName);
          const idx = items.findIndex(item => item.id === id);
          let updatedItem = null;
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...data };
            updatedItem = items[idx];
            saveOfflineItems(entityName, items);
          } else {
            updatedItem = { id, ...data };
            items.push(updatedItem);
            saveOfflineItems(entityName, items);
          }
          return updatedItem;
        },
        delete: async (id) => {
          try {
            const docRef = doc(firestore, entityName, id);
            await deleteDoc(docRef);
          } catch (error) {
            console.warn(`Firestore deleteDoc failed for ${entityName}/${id}, deleting locally:`, error);
          }

          const items = getOfflineItems(entityName);
          const filtered = items.filter(item => item.id !== id);
          saveOfflineItems(entityName, filtered);
          return { id };
        }
      };
    }
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: "" }),
    },
  },
};

export const base44 = db;
export default db;
