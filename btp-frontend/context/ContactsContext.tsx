import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Type definitions
export interface Contact {
  name: string;
  phone: string;
  relation: string;
  // Since contacts are in an array in MongoDB, they'll have index positions
  // We'll track this on the client side
  _id?: string; // MongoDB adds this to subdocuments too
}

interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  fetchContacts: (userId: string) => Promise<void>;
  addContact: (userId: string, contact: Omit<Contact, '_id'>) => Promise<void>;
  deleteContact: (userId: string, contactId: string) => Promise<void>;
}

const API_BASE_URL = 'http://localhost:5000/api';

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/contacts/${userId}`);
      // The API returns an array of contacts
      setContacts(response.data || []);
    } catch (err: any) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (userId: string, contact: Omit<Contact, '_id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/contacts/${userId}`, contact);
      
      // After adding, we'll fetch the updated list since we don't get IDs directly
      await fetchContacts(userId);
      
      return response.data;
    } catch (err: any) {
      setError('Failed to add contact');
      console.error('Error adding contact:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (userId: string, contactId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`${API_BASE_URL}/contacts/${userId}/${contactId}`);
      
      // After deleting, fetch the updated list
      await fetchContacts(userId);
    } catch (err: any) {
      setError('Failed to delete contact');
      console.error('Error deleting contact:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContactsContext.Provider 
      value={{ 
        contacts, 
        loading, 
        error, 
        fetchContacts, 
        addContact,
        deleteContact 
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
};