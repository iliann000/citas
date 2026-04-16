import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    ArrowLeft, Send, Image, Smile, Video, MapPin,
    X, CornerUpLeft, CheckCheck, Check, AlertCircle, Clock,
    Hand, Heart, Star, Leaf, UtensilsCrossed, Plane, Dumbbell
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import type { Message } from '../context/AppContext';
import React from 'react';

/* ------------------------------------------------------------------ */
/*  EMOJIS                                                              */
/* ------------------------------------------------------------------ */

const EMOJI_CATEGORIES: Record<string, string[]> = {
    "Recientes": ["😀", "😂", "😍", "👍", "❤️", "🔥", "😎", "🥰", "😭", "🤔"],
    "Caritas": [
        "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "🥰", "😘",
        "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥",
        "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔",
        "😕", "🙃", "🤑", "😲", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩",
        "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "🥴", "😠", "😡", "🤬", "😷", "🤒",
        "🤕", "🤢", "🤮", "🤧", "😇", "🥳", "🥸", "🤠", "🤡", "🥺", "😈", "👿", "💀", "👻", "👽",
    ],
    "Gestos": [
        "👍", "👎", "👏", "🙌", "🤝", "🤜", "🤛", "✊", "👊", "🤚", "✋", "🖐️", "👋", "🤙",
        "💪", "☝️", "👆", "👇", "👈", "👉", "🤞", "✌️", "🤟", "🤘", "🖖", "👌",
        "🤌", "🤏", "👐", "🙏", "🤲", "🫶", "🫱", "🫲", "🫳", "🫴", "🫵",
    ],
    "Corazones": [
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓",
        "💗", "💖", "💘", "💝", "💟", "♥️", "❤️‍🔥", "❤️‍🩹", "💌",
    ],
    "Objetos": [
        "🔥", "💯", "✨", "⭐", "🌟", "💫", "💥", "🎉", "🎊", "🎁", "🎈", "🎀", "🏆", "🥇",
        "🎮", "🎵", "🎶", "📱", "💻", "🖥️", "📸", "📷", "🎥", "📹", "🔑", "🔒", "💡", "🔔",
    ],
    "Naturaleza": [
        "🌸", "🌺", "🌻", "🌹", "🌷", "🌱", "🌿", "🍀", "🍁", "🍂", "🌊", "🌈", "⭐", "🌙",
        "☀️", "⛅", "🌤️", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
    ],
    "Comida": [
        "🍕", "🍔", "🍟", "🌮", "🌯", "🍜", "🍝", "🍣", "🍱", "🍛", "🍲", "🥗", "🥙", "🧆",
        "🥚", "🍳", "🥞", "🧇", "🥓", "🍗", "🍖", "🥩", "🍿", "🧂", "🥫", "🍱", "🍘", "🍙",
        "☕", "🍵", "🧃", "🥤", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🥛", "🍼",
    ],
    "Viajes": [
        "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜",
        "✈️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚢", "🛥️", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥",
        "🗺️", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛺", "🌋", "🏔️", "⛰️",
    ],
    "Actividades": [
        "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🏒", "🥍",
        "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤺", "🏇",
        "⛹️", "🤾", "🏌️", "🏄", "🚣", "🧘", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁",
    ],
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "Recientes": <Clock className="w-4 h-4" />,
    "Caritas": <Smile className="w-4 h-4" />,
    "Gestos": <Hand className="w-4 h-4" />,
    "Corazones": <Heart className="w-4 h-4" />,
    "Objetos": <Star className="w-4 h-4" />,
    "Naturaleza": <Leaf className="w-4 h-4" />,
    "Comida": <UtensilsCrossed className="w-4 h-4" />,
    "Viajes": <Plane className="w-4 h-4" />,
    "Actividades": <Dumbbell className="w-4 h-4" />,
};

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥"];

/* ------------------------------------------------------------------ */
/*  STATUS ICON                                                         */
/* ------------------------------------------------------------------ */

function StatusIcon({ status }: { status: Message["status"] }) {
    if (status === "sending") return <Clock className="w-3 h-3 text-muted-foreground" />;
    if (status === "error") return <AlertCircle className="w-3 h-3 text-destructive" />;
    if (status === "sent") return <Check className="w-3 h-3 text-muted-foreground" />;
    if (status === "delivered") return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    if (status === "read") return <CheckCheck className="w-3 h-3 text-blue-500" />;
    return null;
}

/* ------------------------------------------------------------------ */
/*  COMPONENTE PRINCIPAL                                                */
/* ------------------------------------------------------------------ */

export function ChatWindow() {
    const { id } = useParams<{ id: string }>();

    const {
        people,
        getMessagesForChat,
        sendMessage,
        markMessagesAsRead,
        currentUserId,
        startChat,
        deleteMessage,
    } = useApp();

    const navigate = useNavigate();
    const person = people.find((p) => p.id === id);

    /* ---------- estado ---------- */
    const [newMessage, setNewMessage] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState("Recientes");
    const [emojiSearch, setEmojiSearch] = useState("");
    const [hoveredEmoji, setHoveredEmoji] = useState("");
    const [reactionTarget, setReactionTarget] = useState<Message | null>(null);

    /* ---------- refs ---------- */
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* ---------- efectos ---------- */
    useEffect(() => {
        if (id) {
            startChat(id);
            markMessagesAsRead(id);
        }
    }, [id]);

    const messages = getMessagesForChat(id || '');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setShowEmoji(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------- guard ---------- */
    if (!id) return null;

    /* ---------- emojis filtrados ---------- */
    const filteredEmojis = emojiSearch.trim()
        ? [...new Set(Object.values(EMOJI_CATEGORIES).flat())]
        : EMOJI_CATEGORIES[emojiCategory] ?? [];

    /* ---------- handlers ---------- */
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !imageBase64) return;

        await sendMessage(id, {
            content: newMessage.trim(),
            imageUrl: imageBase64,
            replyTo: replyingTo?.id ?? null,
        });

        setNewMessage('');
        setImageBase64(null);
        setImagePreview(null);
        setReplyingTo(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setImageBase64(result);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleShareLocation = () => {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                await sendMessage(id, {
                    location: {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        label: "Mi ubicación",
                    },
                });
            },
            () => alert("No se pudo obtener la ubicación")
        );
    };

    const addEmoji = (emoji: string) => {
        setNewMessage((prev) => prev + emoji);
        inputRef.current?.focus();
    };

    const formatTime = (ts: string) =>
        new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    const getReplyPreview = (replyId: string) => {
        const msg = messages.find((m) => m.id === replyId);
        if (!msg) return "Mensaje";
        return msg.content || (msg.imageUrl ? "Imagen" : "Mensaje");
    };

    const personName = person?.name ?? "Usuario";
    const personPhoto = person?.photo ?? "";

    /* ------------------------------------------------------------------ */
    /*  RENDER                                                              */
    /* ------------------------------------------------------------------ */

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col max-w-4xl mx-auto">

            {/* HEADER */}
            <div className="border-b bg-background p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => person && navigate(`/profile/${person.id}`)}
                    >
                        <Avatar>
                            <AvatarImage src={personPhoto} />
                            <AvatarFallback>{getInitials(personName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-medium">{personName}</h2>
                            <p className="text-sm text-muted-foreground">{person?.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-muted/30">
                {messages
                    .filter((m) => {
                        if (m.deletedForEveryone) return true;
                        if (m.deletedFor?.includes(currentUserId)) return false;
                        return true;
                    })
                    .map((message) => {
                        const isOwn = message.senderId === currentUserId;

                        return (
                            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                                <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {!isOwn && (
                                        <Avatar className="w-8 h-8 self-end">
                                            <AvatarImage src={personPhoto} />
                                            <AvatarFallback>{getInitials(personName)}</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className="relative">
                                        {/* Burbuja */}
                                        <div
                                            onDoubleClick={() => setReactionTarget(message)}
                                            className={`rounded-2xl px-4 py-2 cursor-pointer ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-background border'
                                                }`}
                                        >
                                            {/* Reply preview */}
                                            {message.replyTo && !message.deletedForEveryone && (
                                                <div className={`text-xs mb-2 px-2 py-1 rounded-lg border-l-2 ${isOwn ? 'border-white/50 bg-white/10' : 'border-primary bg-muted'
                                                    }`}>
                                                    <span className="opacity-70">{getReplyPreview(message.replyTo)}</span>
                                                </div>
                                            )}

                                            {message.deletedForEveryone ? (
                                                <p className="text-sm italic opacity-60">Mensaje eliminado</p>
                                            ) : (
                                                <>
                                                    {message.content && (
                                                        <p className="text-sm break-words">{message.content}</p>
                                                    )}
                                                    {message.imageUrl && (
                                                        <img
                                                            src={message.imageUrl}
                                                            className="mt-2 rounded-lg max-h-60 cursor-zoom-in"
                                                            onClick={() => window.open(message.imageUrl!, '_blank')}
                                                        />
                                                    )}
                                                    {message.location && (
                                                        <a
                                                            href={`https://maps.google.com/?q=${message.location.lat},${message.location.lng}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-2 mt-1 text-sm underline ${isOwn ? 'text-primary-foreground/80' : 'text-primary'
                                                                }`}
                                                        >
                                                            <MapPin className="w-4 h-4" />
                                                            {message.location.label}
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Hora + status + acciones hover */}
                                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <p className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</p>
                                            {isOwn && <StatusIcon status={message.status} />}

                                            {!message.deletedForEveryone && (
                                                <div className="hidden group-hover:flex items-center gap-1 ml-1">
                                                    <button
                                                        title="Responder"
                                                        onClick={() => {
                                                            setReplyingTo(message);
                                                            inputRef.current?.focus();
                                                        }}
                                                        className="p-1 rounded-full hover:bg-muted transition-colors"
                                                    >
                                                        <CornerUpLeft className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        title="Opciones"
                                                        onClick={() => setSelectedMessage(message)}
                                                        className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground text-sm font-bold"
                                                    >
                                                        ···
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Panel reacciones (doble clic) */}
                                        {reactionTarget?.id === message.id && (
                                            <div
                                                className={`absolute z-10 bottom-8 ${isOwn ? 'right-0' : 'left-0'} bg-background border rounded-2xl shadow-xl px-3 py-2 flex gap-2`}
                                                onMouseLeave={() => setReactionTarget(null)}
                                            >
                                                {REACTION_EMOJIS.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        className="text-xl hover:scale-125 transition-transform"
                                                        onClick={() => setReactionTarget(null)}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                <div ref={messagesEndRef} />
            </div>

            {/* BARRA DE INPUT */}
            <div className="border-t bg-background p-4 relative">

                {/* Preview imagen */}
                {imagePreview && (
                    <div className="mb-3 relative inline-block">
                        <img src={imagePreview} className="h-20 rounded-lg object-cover" />
                        <button
                            onClick={() => { setImagePreview(null); setImageBase64(null); }}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Preview respuesta */}
                {replyingTo && (
                    <div className="mb-3 flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                        <div>
                            <p className="text-xs font-medium text-primary">Respondiendo a</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {replyingTo.content || (replyingTo.imageUrl ? "Imagen" : "Mensaje")}
                            </p>
                        </div>
                        <button onClick={() => setReplyingTo(null)}>
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 items-center">

                    {/* Imagen */}
                    <Button type="button" size="icon" variant="ghost" title="Enviar imagen"
                        onClick={() => fileInputRef.current?.click()}>
                        <Image className="w-5 h-5" />
                    </Button>
                    <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />

                    {/* Ubicación */}
                    <Button type="button" size="icon" variant="ghost" title="Compartir ubicación"
                        onClick={handleShareLocation}>
                        <MapPin className="w-5 h-5" />
                    </Button>

                    {/* Emoji */}
                    <Button type="button" size="icon" variant="ghost" title="Emojis"
                        onClick={() => setShowEmoji(!showEmoji)}>
                        <Smile className="w-5 h-5" />
                    </Button>

                    <Input
                        ref={inputRef}
                        placeholder={`Mensaje a ${personName}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                    />

                    <Button type="submit" size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>

                {/* EMOJI PICKER */}
                {showEmoji && (
                    <div
                        ref={emojiRef}
                        className="absolute bottom-20 left-4 z-20 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-xl"
                        style={{ width: 340, height: 420 }}
                    >
                        {/* Buscador */}
                        <div className="border-b px-3 py-2">
                            <input
                                type="text"
                                placeholder="Buscar emoji"
                                className="w-full rounded-full bg-muted px-4 py-1.5 text-sm outline-none"
                                value={emojiSearch}
                                onChange={(e) => setEmojiSearch(e.target.value)}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b px-1" style={{ scrollbarWidth: 'none' }}>
                            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setEmojiCategory(cat); setEmojiSearch(""); }}
                                    className={`flex flex-none items-center justify-center border-b-2 px-3 py-2 transition-colors ${emojiCategory === cat && !emojiSearch
                                            ? "border-green-500 text-foreground"
                                            : "border-transparent text-muted-foreground hover:bg-muted"
                                        }`}
                                    title={cat}
                                >
                                    {CATEGORY_ICONS[cat]}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-2">
                            <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                {emojiSearch ? "Resultados" : emojiCategory}
                            </p>
                            <div className="grid grid-cols-8 gap-0.5">
                                {filteredEmojis.map((emoji, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-transform hover:scale-125 hover:bg-muted"
                                        onMouseEnter={() => setHoveredEmoji(emoji)}
                                        onClick={() => addEmoji(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="flex items-center gap-2 border-t px-3 py-2">
                            <span className="text-2xl">{hoveredEmoji || "😊"}</span>
                            <span className="text-xs text-muted-foreground">Toca para insertar</span>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL OPCIONES DE MENSAJE */}
            {selectedMessage && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-30"
                    onClick={() => setSelectedMessage(null)}
                >
                    <div
                        className="bg-background rounded-xl p-5 space-y-3 w-64 shadow-2xl border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm font-medium text-center text-muted-foreground">
                            Opciones de mensaje
                        </p>

                        {/* Responder */}
                        <Button className="w-full" variant="outline"
                            onClick={() => {
                                setReplyingTo(selectedMessage);
                                setSelectedMessage(null);
                                inputRef.current?.focus();
                            }}>
                            <CornerUpLeft className="w-4 h-4 mr-2" />
                            Responder
                        </Button>

                        {/* Eliminar para mí */}
                        <Button className="w-full" variant="outline"
                            onClick={() => {
                                deleteMessage(selectedMessage.id, "me");
                                setSelectedMessage(null);
                            }}>
                            Eliminar para mí
                        </Button>

                        {/* Eliminar para todos — solo si es tuyo */}
                        {selectedMessage.senderId === currentUserId && (
                            <Button className="w-full" variant="destructive"
                                onClick={() => {
                                    deleteMessage(selectedMessage.id, "all");
                                    setSelectedMessage(null);
                                }}>
                                Eliminar para todos
                            </Button>
                        )}

                        <Button variant="ghost" className="w-full" onClick={() => setSelectedMessage(null)}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}