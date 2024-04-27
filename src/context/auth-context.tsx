import { GithubAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../api/services/firestore/firestore-service";
import { setGithubTokenToDB } from "../api/services/firestore/firestore-setter";

interface AuthProviderProps {
    children: React.ReactNode;
}

interface AuthContextType {
    currentUser: User | null;
    githubToken: string | undefined;
    loginWithGitHub: () => Promise<User | void>;
    logout: () => Promise<void>;
}
  
const defaultAuthContextValue: AuthContextType = {
    currentUser: null,
    githubToken: undefined,
    loginWithGitHub: () => Promise.reject("Not implemented"),
    logout: () => Promise.reject("Not implemented"),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export const useAuth = () => useContext(AuthContext);
export const uid = (): string => auth.currentUser?.uid ?? '__unknown';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log('User state changed:', JSON.stringify(user));
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  const loginWithGitHub = (): Promise<User | void> => {
    return new Promise((resolve, reject) => {
      const provider = new GithubAuthProvider();
      provider.addScope('repo');
      provider.setCustomParameters({
        allow_signup: 'false'
      });

      signInWithPopup(auth, provider)
        .then((result) => {
          const credential = GithubAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          const user = result.user;
          if (user && token) {
            setGithubToken(token);
            setCurrentUser(user);
            setGithubTokenToDB(user, token);
            resolve(user);
          }
        }).catch((error) => {
          console.error('Login Error:', error);
          reject(error);
        });
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setGithubToken(undefined);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const value = {
    currentUser,
    githubToken,
    loginWithGitHub,
    logout
  };

  return <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>;
};
