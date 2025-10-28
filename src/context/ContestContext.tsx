"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ContestStatus = "upcoming" | "live" | "completed";

export interface Contest {
  id: string;
  name: string;
  description?: string;
  status: ContestStatus;
  start_time: string;
  end_time: string;
  entry_fee?: number;
  prize_pool?: number;
  max_participants?: number;
  rules?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface ContestContextType {
  contests: Contest[];
  loading: boolean;
  error: string | null;
  fetchContests: () => Promise<void>;
  getContest: (id: string) => Promise<Contest | null>;
  createContest: (contest: Omit<Contest, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<Contest>;
  updateContest: (id: string, updates: Partial<Contest>) => Promise<Contest>;
  deleteContest: (id: string) => Promise<void>;
  refreshContests: () => Promise<void>;
}

const ContestContext = createContext<ContestContextType | undefined>(undefined);

export const ContestProvider = ({ children }: { children: React.ReactNode }) => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("contests")
        .select("*")
        .order("start_time", { ascending: false });

      if (error) throw error;
      setContests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contests');
      console.error("Error fetching contests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getContest = useCallback(async (id: string): Promise<Contest | null> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("contests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contest');
      console.error("Error fetching contest:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createContest = useCallback(async (contestData: Omit<Contest, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine status based on start and end times
      const now = new Date();
      const startTime = new Date(contestData.start_time);
      const endTime = new Date(contestData.end_time);
      
      let status: ContestStatus = 'upcoming';
      if (now >= startTime && now <= endTime) {
        status = 'live';
      } else if (now > endTime) {
        status = 'completed';
      }

      const { data, error } = await supabase
        .from("contests")
        .insert([{ ...contestData, status }])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setContests(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create contest';
      setError(errorMessage);
      console.error("Error creating contest:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContest = useCallback(async (id: string, updates: Partial<Contest>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update status if start_time or end_time is being updated
      if (updates.start_time || updates.end_time) {
        const contest = contests.find(c => c.id === id);
        if (contest) {
          const now = new Date();
          const startTime = new Date(updates.start_time || contest.start_time);
          const endTime = new Date(updates.end_time || contest.end_time);
          
          if (now >= startTime && now <= endTime) {
            updates.status = 'live';
          } else if (now > endTime) {
            updates.status = 'completed';
          } else {
            updates.status = 'upcoming';
          }
        }
      }

      const { data, error } = await supabase
        .from("contests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setContests(prev => prev.map(contest => 
        contest.id === id ? { ...contest, ...data } : contest
      ));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contest';
      setError(errorMessage);
      console.error("Error updating contest:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contests]);

  const deleteContest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from("contests")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Update local state
      setContests(prev => prev.filter(contest => contest.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contest');
      console.error("Error deleting contest:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('contests-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'contests' 
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setContests(prev => [payload.new as Contest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setContests(prev => 
              prev.map(contest => 
                contest.id === payload.new.id ? { ...contest, ...payload.new } as Contest : contest
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setContests(prev => prev.filter(contest => contest.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value = {
    contests,
    loading,
    error,
    fetchContests,
    getContest,
    createContest,
    updateContest,
    deleteContest,
    refreshContests: fetchContests,
  };

  return (
    <ContestContext.Provider value={value}>
      {children}
    </ContestContext.Provider>
  );
};

export const useContests = (): ContestContextType => {
  const context = useContext(ContestContext);
  if (context === undefined) {
    throw new Error("useContests must be used within a ContestProvider");
  }
  return context;
};
