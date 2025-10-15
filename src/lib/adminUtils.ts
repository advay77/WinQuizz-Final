import { supabase } from "@/integrations/supabase/client";

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return (profile as any)?.role === 'admin';
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const getCurrentUserRole = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 'guest';

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return 'user';
    }

    return (profile as any).role || 'user';
  } catch (error) {
    console.error("Error getting user role:", error);
    return 'user';
  }
};

export const promoteUserToAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: 'admin' })
      .eq("id", userId);

    if (error) {
      console.error("Error promoting user to admin:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return false;
  }
};
