import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Person, Appointment, Notification } from "../types";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

/* ------------------------------------------------------------------ */
/*  TIPOS                                                               */
/* ------------------------------------------------------------------ */

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl: string | null;
  replyTo: string | null;
  location: { lat: number; lng: number; label: string } | null;
  status: "sending" | "sent" | "delivered" | "read" | "error";
  deletedFor: string[];
  deletedForEveryone: boolean;
  timestamp: string;
}

export interface Chat {
  id: string;
  participantId: string;
  lastMessage?: Message;
  unreadCount: number;
}

interface AppContextType {
  people: Person[];
  appointments: Appointment[];
  notifications: Notification[];
  messages: Message[];
  chats: Chat[];
  currentUserId: string;
  currentUserProfile: Person | null;
  loading: boolean;

  addAppointment: (appointment: Omit<Appointment, "id" | "createdAt" | "status">) => void;
  cancelAppointment: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  sendMessage: (
    receiverId: string,
    data: {
      content?: string;
      imageUrl?: string | null;
      replyTo?: string | null;
      location?: { lat: number; lng: number; label: string } | null;
    }
  ) => Promise<void>;
  deleteMessage: (messageId: string, type: "me" | "all") => Promise<void>;
  getMessagesForChat: (participantId: string) => Message[];
  markMessagesAsRead: (participantId: string) => Promise<void>;
  startChat: (personId: string) => void;
  getChatForPerson: (personId: string) => Chat | undefined;
}

/* ------------------------------------------------------------------ */
/*  HELPER: fila de Supabase → Message                                 */
/* ------------------------------------------------------------------ */

function rowToMessage(row: any): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content ?? "",
    imageUrl: row.image_url ?? null,
    replyTo: row.reply_to ?? null,
    location: row.location ?? null,
    status: row.status ?? "sent",
    deletedFor: row.deleted_for ?? [],
    deletedForEveryone: row.deleted_for_everyone ?? false,
    timestamp: row.created_at,
  };
}

/* ------------------------------------------------------------------ */
/*  CONTEXT                                                             */
/* ------------------------------------------------------------------ */

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserProfile, setCurrentUserProfile] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- auth + carga inicial ---------- */
  useEffect(() => {
    async function init() {
      setLoading(true);

      // 1. Sesión real
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? "";
      setCurrentUserId(userId);

      // 2. Perfiles
      const { data: profiles } = await supabase.from("profiles").select("*");
      if (profiles) {
        const mapInterest = (val: string) => {
          if (val === 'hetero') return 'hombres';
          if (val === 'gay') return 'mujeres';
          if (val === 'bi') return 'ambos';
          return val;
        };

        const allPeople: Person[] = profiles
          .map((p) => ({
            id: p.id,
            name: p.full_name || "Usuario",
            age: p.birthday
              ? new Date().getFullYear() - new Date(p.birthday).getFullYear()
              : 0,
            photo: p.avatar_url || "https://via.placeholder.com/400",
            bio: p.bio || "",
            interests: p.interests || [],
            contactPreference: p.contact_preference || "whatsapp",
            contact: p.contact || "",
            location: p.location_name || (p.lat ? "Cerca de ti" : "Ubicación privada"),
            lookingFor: p.looking_for || "",
            estatura: p.estatura,
            complexion: p.complexion,
            gender: p.gender,
            sexual_orientation: mapInterest(p.sexual_orientation),
          }));
        
        const me = allPeople.find((p) => p.id === userId) || null;
        setCurrentUserProfile(me);

        setPeople(allPeople.filter((p) => p.id !== userId));
      }

      // 3. Mensajes desde Supabase
      if (userId) await loadMessages(userId);

      setLoading(false);
    }

    init();

    // Escuchar cambios de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? "";
      setCurrentUserId(userId);
      if (userId) loadMessages(userId);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------- cargar mensajes ---------- */
  async function loadMessages(userId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error cargando mensajes:", error);
      return;
    }

    const mapped = (data ?? []).map(rowToMessage);
    setMessages(mapped);
    rebuildChats(mapped, userId);
  }

  /* ---------- realtime ---------- */
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => loadMessages(currentUserId)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  /* ---------- reconstruir lista de chats ---------- */
  function rebuildChats(msgs: Message[], userId: string) {
    const map = new Map<string, Chat>();

    msgs.forEach((msg) => {
      const participantId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const existing = map.get(participantId);
      const isUnread = msg.senderId !== userId && msg.status !== "read" ? 1 : 0;

      if (!existing) {
        map.set(participantId, {
          id: participantId,
          participantId,
          lastMessage: msg,
          unreadCount: isUnread,
        });
      } else {
        map.set(participantId, {
          ...existing,
          lastMessage: msg,
          unreadCount: existing.unreadCount + isUnread,
        });
      }
    });

    setChats(Array.from(map.values()));
  }

  /* ------------------------------------------------------------------ */
  /*  ENVIAR MENSAJE                                                      */
  /* ------------------------------------------------------------------ */
  const sendMessage = async (
    receiverId: string,
    data: {
      content?: string;
      imageUrl?: string | null;
      replyTo?: string | null;
      location?: { lat: number; lng: number; label: string } | null;
    }
  ) => {
    if (!currentUserId) return;

    // Optimista
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      senderId: currentUserId,
      receiverId,
      content: data.content ?? "",
      imageUrl: data.imageUrl ?? null,
      replyTo: data.replyTo ?? null,
      location: data.location ?? null,
      status: "sending",
      deletedFor: [],
      deletedForEveryone: false,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    // Subir imagen a Supabase Storage si viene en base64
    let imageUrl = data.imageUrl ?? null;
    if (imageUrl && imageUrl.startsWith("data:")) {
      const base64 = imageUrl.split(",")[1];
      const ext = imageUrl.split(";")[0].split("/")[1];
      const fileName = `${currentUserId}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, decode(base64), { contentType: `image/${ext}` });

      if (uploadError) {
        toast.error("Error subiendo imagen");
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: "error" } : m));
        return;
      }

      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insertar en Supabase
    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: data.content ?? "",
        image_url: imageUrl,
        reply_to: data.replyTo ?? null,
        location: data.location ?? null,
        status: "sent",
      })
      .select()
      .single();

    if (error) {
      toast.error("Error al enviar el mensaje");
      setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: "error" } : m));
      return;
    }

    // Reemplazar optimista con el real
    setMessages((prev) => prev.map((m) => m.id === tempId ? rowToMessage(inserted) : m));
  };

  /* ------------------------------------------------------------------ */
  /*  ELIMINAR MENSAJE                                                    */
  /* ------------------------------------------------------------------ */
  const deleteMessage = async (messageId: string, type: "me" | "all") => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    if (type === "all") {
      if (msg.senderId !== currentUserId) return;
      await supabase
        .from("messages")
        .update({ deleted_for_everyone: true, content: "", image_url: null })
        .eq("id", messageId);
    } else {
      const newDeletedFor = [...new Set([...(msg.deletedFor ?? []), currentUserId])];
      await supabase
        .from("messages")
        .update({ deleted_for: newDeletedFor })
        .eq("id", messageId);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  OBTENER MENSAJES PARA UN CHAT                                       */
  /* ------------------------------------------------------------------ */
  const getMessagesForChat = useCallback(
    (participantId: string) => {
      return messages
        .filter(
          (msg) =>
            (msg.senderId === currentUserId && msg.receiverId === participantId) ||
            (msg.senderId === participantId && msg.receiverId === currentUserId)
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },
    [messages, currentUserId]
  );

  /* ------------------------------------------------------------------ */
  /*  MARCAR LEÍDOS                                                       */
  /* ------------------------------------------------------------------ */
  const markMessagesAsRead = async (participantId: string) => {
    await supabase
      .from("messages")
      .update({ status: "read" })
      .eq("sender_id", participantId)
      .eq("receiver_id", currentUserId)
      .neq("status", "read");

    setMessages((prev) =>
      prev.map((msg) =>
        msg.senderId === participantId && msg.receiverId === currentUserId
          ? { ...msg, status: "read" }
          : msg
      )
    );

    setChats((prev) =>
      prev.map((chat) =>
        chat.participantId === participantId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  /* ------------------------------------------------------------------ */
  /*  CHATS                                                               */
  /* ------------------------------------------------------------------ */
  const startChat = (personId: string) => {
    if (!chats.find((c) => c.participantId === personId)) {
      setChats((prev) => [...prev, { id: personId, participantId: personId, unreadCount: 0 }]);
    }
  };

  const getChatForPerson = (personId: string) =>
    chats.find((c) => c.participantId === personId);

  /* ------------------------------------------------------------------ */
  /*  PROVIDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <AppContext.Provider
      value={{
        people,
        appointments,
        notifications,
        messages,
        chats,
        currentUserId,
        currentUserProfile,
        loading,
        addAppointment: () => { },
        cancelAppointment: () => { },
        markNotificationAsRead: () => { },
        sendMessage,
        deleteMessage,
        getMessagesForChat,
        markMessagesAsRead,
        startChat,
        getChatForPerson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

/* ------------------------------------------------------------------ */
/*  HELPER: base64 → Uint8Array para subir a Storage                   */
/* ------------------------------------------------------------------ */
function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}