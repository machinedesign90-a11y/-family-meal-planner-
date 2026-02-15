// Supabase Client Configuration
// This file handles all authentication and API calls to Supabase

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
// Replace these with your actual values from Vercel env vars
const SUPABASE_URL = 'https://fgjspmhzeegdtzqpddhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnanNwbW56ZWVnZHR6cXBkZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyOTIsImV4cCI6MjA4Njc0MDI5Mn0.c-XNp93VDeJwtCNON_NjRwDmn-W7McGnkZSRDe8161w'; // You'll replace this

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication helpers
export const authHelpers = {
  // Sign up new user
  async signUp(email, password, profile) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: profile.name, profile })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Get current user
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
};

// API helpers for backend calls
export const api = {
  // Get authorization header
  async getAuthHeader() {
    const session = await authHelpers.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
  },

  // Profile
  async getProfile() {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/profile', {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  async updateProfile(updates) {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    return response.json();
  },

  // Recipes
  async getRecipes() {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/recipes', {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  async createRecipe(recipe) {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe })
    });
    return response.json();
  },

  async deleteRecipe(id) {
    const headers = await this.getAuthHeader();
    const response = await fetch(`/api/recipes?id=${id}`, {
      method: 'DELETE',
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // Inventory
  async getInventory() {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/inventory', {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  async addInventoryItem(item) {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item })
    });
    return response.json();
  },

  async updateInventoryItem(id, updates) {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/inventory', {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates })
    });
    return response.json();
  },

  async deleteInventoryItem(id) {
    const headers = await this.getAuthHeader();
    const response = await fetch(`/api/inventory?id=${id}`, {
      method: 'DELETE',
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // AI Recipe Generation
  async generateRecipes(profile, inventory) {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, inventory })
    });
    return response.json();
  },

  // Meal Plans
  async getMealPlans() {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/meal-plans', {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  async saveMealPlan(plan) {
    const headers = await this.getAuthHeader();
    const response = await fetch('/api/meal-plans', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    return response.json();
  }
};
