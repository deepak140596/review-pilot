import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, QueryDocumentSnapshot, DocumentData, Timestamp, onSnapshot, FirestoreError, query, Query, QueryConstraint } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyA-xIPfXGXpodGyGcFHh4VbHnantzh9AhY",
    authDomain: "pr-review-bot.firebaseapp.com",
    databaseURL: "https://pr-review-bot.firebaseio.com",
    projectId: "pr-review-bot",
    storageBucket: "pr-review-bot.appspot.com",
    messagingSenderId: "735766966982",
    appId: "1:735766966982:web:8ee3f68e26652516a41dc7",
    measurementId: "G-GV0GQKV03S"
  };

const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
export const auth = getAuth(firebaseApp);
const firestoreDB = getFirestore(firebaseApp);

function docToData<T>(doc: QueryDocumentSnapshot<DocumentData>): T {
  const data = doc.data() as DocumentData;
  // Iterate over each field to convert Timestamps to Dates
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      data[key] = value.toDate();
    } else if (typeof value === 'object' && value !== null) {
      // Recursive call for nested objects
      data[key] = convertTimestamps(value);
    }
  }
  return { id: doc.id, ...data } as T;
}

// Helper function to recursively convert Timestamps to Dates in nested objects
function convertTimestamps(obj: any): any {
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Timestamp) {
      obj[key] = value.toDate();
    } else if (typeof value === 'object' && value !== null) {
      obj[key] = convertTimestamps(value);
    }
  }
  return obj;
}

  export class FirestoreService {
    static async getDocument<T>(collectionPath: string, docId: string): Promise<T> {
     try {
        const docRef = doc(firestoreDB, collectionPath, docId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          return docToData<T>(docSnap);
        } else {
          throw new Error('Document does not exist!');
        }
      } catch (error) {
        throw error;
      }
    }

    static listenToDocument<T>(
      documentPath: string,
      onDocumentReceived: (document: T) => void,
      onError?: (error: FirestoreError) => void
    ): () => void  {
      const docRef = doc(firestoreDB, documentPath);
      const unsubscribe = onSnapshot(docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            onDocumentReceived(docToData<T>(docSnap));
          } else {
            console.error('Document does not exist!');
          }
        }, 
        (error) => {
          if (onError) {
            onError(error);
          } else {
            console.error("Error listening to document:", error);
          }
        }
      );
    
      // Return the unsubscribe function so the caller can stop listening when needed
      return unsubscribe;
    }
  
    static async getAllDocuments<T>(collectionPath: string): Promise<T[]> {
      try {
        console.log('collectionPath', collectionPath);
        const querySnapshot = await getDocs(collection(firestoreDB, collectionPath));
        let documents: T[] = [];
        querySnapshot.forEach((doc) => {
          documents.push(docToData<T>(doc));
        });
        return documents;
      } catch (error) {
        throw error;
      }
    }

    static listenToAllDocuments<T>(
      collectionPath: string,
      onDocumentsReceived: (documents: T[]) => void,
      onError?: (error: FirestoreError) => void
    ): () => void {
      const unsubscribe = onSnapshot(collection(firestoreDB, collectionPath),
        (querySnapshot) => {
          let documents: T[] = [];
          querySnapshot.forEach((doc) => {
            documents.push(docToData<T>(doc));
          });
          onDocumentsReceived(documents);
        }, 
        (error) => {
          if (onError) {
            onError(error);
          } else {
            console.error("Error listening to documents:", error);
          }
        }
      );
    
      // Return the unsubscribe function so the caller can stop listening when needed
      return unsubscribe;
    }

    // Get query snapshot listener for a collection
    static listenToQueryCollection<T>(
      collectionPath: string,
      onCollectionUpdate: (documents: T[]) => void,
      onError?: (error: FirestoreError) => void,
      ...queryConstraints: QueryConstraint[]
    ): () => void {
      const queryCollection = query(collection(firestoreDB, collectionPath), ...queryConstraints);
      const unsubscribe = onSnapshot(queryCollection,
        (querySnapshot) => {
          let documents: T[] = [];
          querySnapshot.forEach((doc) => {
            documents.push(docToData<T>(doc));
          });
          onCollectionUpdate(documents);
        }, 
        (error) => {
          if (onError) {
            onError(error);
          } else {
            console.error("Error listening to collection:", error);
          }
        }
      );
    
      // Return the unsubscribe function so the caller can stop listening when needed
      return unsubscribe;
    }
  
    // Write a new document to a collection and return the document as the specified type
    static async addDocument<T extends { [x: string]: any; }>(collectionPath: string, data: T): Promise<T> {
      try {
        const docRef = await addDoc(collection(firestoreDB, collectionPath), data);
        return { id: docRef.id, ...data };
      } catch (error) {
        throw error;
      }
    }
  
    // Update an existing document and return the updated document as the specified type
    static async updateDocument(collectionPath: string, docId: string, fieldsToUpdate: Record<string, any>): Promise<void> {
      try {
        console.log('collectionPath', collectionPath);
        console.log('docId', docId);
        const docRef = doc(firestoreDB, `${collectionPath}/${docId}`);
        await setDoc(docRef, fieldsToUpdate, { merge: true });
      } catch (error) {
        throw error;
      }
    }
  
    // Delete a document (Note: This operation doesn't need to be generic as it doesn't return the document data)
    static async deleteDocument(collectionPath: string, docId: string): Promise<void> {
      try {
        const docRef = doc(firestoreDB, collectionPath, docId);
        await deleteDoc(docRef);
      } catch (error) {
        throw error;
      }
    }
  }
