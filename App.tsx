
import React, { useState, useEffect, useRef } from 'react';
import { AppView, UserProfile, Contact, Message, Story, Comment } from './types';
import { INITIAL_PROFILE, DEFAULT_CONTACTS, MOCK_STORIES } from './constants';
import { getBotResponse, translateText, generatePixelSticker } from './services/geminiService';
import { audio as audioService } from './services/audioService';

const Icons = {
  Chats: () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Search: () => <svg className="icon-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Wall: () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 9h16M9 4v16"/></svg>,
  Profile: () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  System: () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.41 1.41M6.34 17.66l-1.41 1.41M17.66 17.66l1.41 1.41M6.34 6.34 4.93 4.93"/></svg>,
  GPS: () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>,
  Mic: () => <svg className="icon-svg" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('boot');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const s = localStorage.getItem('ney_v13_profile');
    return s ? JSON.parse(s) : INITIAL_PROFILE;
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const s = localStorage.getItem('ney_v13_contacts');
    return s ? JSON.parse(s) : DEFAULT_CONTACTS;
  });
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const s = localStorage.getItem('ney_v13_messages');
    return s ? JSON.parse(s) : {};
  });
  const [stories, setStories] = useState<Story[]>(() => {
    const s = localStorage.getItem('ney_v13_stories');
    return s ? JSON.parse(s) : MOCK_STORIES as Story[];
  });

  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{text: string, sources?: any[]} | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const wallInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === 'boot') setTimeout(() => setView('chats'), 2000);
  }, []);

  useEffect(() => {
    localStorage.setItem('ney_v13_profile', JSON.stringify(profile));
    localStorage.setItem('ney_v13_contacts', JSON.stringify(contacts));
    localStorage.setItem('ney_v13_messages', JSON.stringify(messages));
    localStorage.setItem('ney_v13_stories', JSON.stringify(stories));
    document.body.className = `theme-${profile.lcdColor}`;
  }, [profile, contacts, messages, stories]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeContact, isTyping]);

  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const handleShare = async () => {
    vibrate(20);
    const shareData = {
      title: 'NEY PAGER PRO',
      text: `Conéctate conmigo en mi red nodal NEY PAGER. Mi ID: ${profile.name}`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("URL_COPIADA_AL_PORTAPAPELES");
    }
  };

  const sendMessage = async (params: Partial<Message>) => {
    if (!activeContact) return;
    audioService.playClick();
    vibrate(10);
    const msg: Message = { id: Date.now().toString(), senderId: 'me', timestamp: Date.now(), status: 'sent', ...params };
    setMessages(prev => ({ ...prev, [activeContact.id]: [...(prev[activeContact.id] || []), msg] }));
    setInput('');

    if (activeContact.id === 'bot-1' && params.text) {
      setIsTyping(true);
      const res = await getBotResponse(params.text);
      setIsTyping(false);
      vibrate([30, 50, 30]); // Vibración de mensaje recibido
      const botMsg: Message = { id: (Date.now()+1).toString(), senderId: 'bot-1', text: res.text.toUpperCase(), sources: res.sources, timestamp: Date.now(), status: 'read' };
      setMessages(prev => ({ ...prev, [activeContact.id]: [...(prev[activeContact.id] || []), botMsg] }));
    }
  };

  // Fixed: Added missing handlePost function
  const handlePost = (content: string) => {
    if (!content.trim()) return;
    const newStory: Story = {
      id: Date.now().toString(),
      userId: 'me',
      userName: profile.name,
      userAvatar: profile.avatar,
      content: content.toUpperCase(),
      timestamp: Date.now(),
      comments: [],
      reactions: {}
    };
    setStories(prev => [newStory, ...prev]);
    setInput('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => sendMessage({ audioUrl: reader.result as string });
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
      vibrate(50);
      audioService.playBeep(true);
    } catch (err) { alert("MIC_ERROR: NO_PERMISSION"); }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      vibrate(20);
      audioService.playBeep(false);
    }
  };

  if (view === 'boot') return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center p-10">
      <div className="text-4xl font-black text-[#d4e09b] tracking-[15px] animate-pulse mb-2">NEY</div>
      <div className="text-[10px] text-[#d4e09b] font-mono opacity-50 tracking-widest uppercase">Initializing_Nodal_System_V13</div>
      <div className="mt-20 w-48 h-1 bg-[#d4e09b]/20 overflow-hidden">
         <div className="h-full bg-[#d4e09b] animate-[shimmer_2s_infinite]" style={{width: '60%'}}></div>
      </div>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
    </div>
  );

  return (
    <div className="pager-frame">
      <div className="lcd-screen">
        <div className="scanline"></div>
        <div className="status-bar">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span> ANT_ON</span>
            <span>MOD_PRO</span>
          </div>
          <span>{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'chats' && (
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <span className="config-label">NODOS_DISPONIBLES</span>
              {contacts.map(c => (
                <div key={c.id} onClick={() => { vibrate(15); setActiveContact(c); setView('chat-detail'); }}
                     className="flex items-center gap-4 p-4 border-2 border-black bg-black/5 active:bg-black active:text-white transition-all cursor-pointer">
                  <img src={c.avatar} className="w-10 h-10 border-2 border-black pixel-img" />
                  <div className="flex-1">
                    <div className="font-black text-sm uppercase">{c.name}</div>
                    <div className="text-[9px] opacity-70 uppercase truncate tracking-tighter">{c.bio}</div>
                  </div>
                  <div className="text-[10px] opacity-30">▶</div>
                </div>
              ))}
              <button onClick={handleShare} className="mt-auto bevel-out py-4 bg-black text-white flex items-center justify-center gap-2">
                INVITAR_A_LA_RED <span>📤</span>
              </button>
            </div>
          )}

          {view === 'chat-detail' && activeContact && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-black/10 p-2 flex justify-between items-center border-b-2 border-black">
                <button onClick={() => { vibrate(10); setView('chats'); }} className="text-[10px] font-black underline px-2 py-1">BACK</button>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-black uppercase leading-none">{activeContact.name}</span>
                  <span className="text-[7px] font-bold opacity-50">CANAL_ENCRIPTADO_AES</span>
                </div>
                <button onClick={() => {
                  vibrate(20);
                  navigator.geolocation.getCurrentPosition((pos) => {
                    sendMessage({ text: `📍 GPS_NODAL: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
                  });
                }} className="p-1"><Icons.GPS /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" ref={scrollRef}>
                {(messages[activeContact.id] || []).map(m => (
                  <div key={m.id} className={`bubble ${m.senderId === 'me' ? 'bubble-me' : 'bubble-them'} ${ghostMode && m.senderId !== 'me' ? 'ghost-hidden' : ''}`}>
                    {m.sticker && <img src={m.sticker} className="w-20 h-20 mb-2 pixel-img" />}
                    {m.text && <div className="leading-snug">{m.text}</div>}
                    {m.audioUrl && (
                      <button onClick={() => { vibrate(10); new Audio(m.audioUrl).play(); }} className="mt-1 p-2 border border-current text-[10px] font-black bg-current/10">▶ REPRODUCIR_VOZ</button>
                    )}
                    <div className="text-[7px] opacity-50 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  </div>
                ))}
                {isTyping && <div className="text-[10px] font-black animate-pulse">PENDING_SIGNAL...</div>}
                {isRecording && <div className="text-[10px] font-black text-red-600 animate-pulse bg-red-600/10 p-1 border border-red-600 self-center">GRABANDO_AUDIO_SISTEMA...</div>}
              </div>

              <div className="p-3 border-t-2 border-black bg-black/5 flex flex-col gap-2">
                <input className="bevel-in text-sm" value={input} onChange={e => setInput(e.target.value)} placeholder="ESCRIBIR..." onKeyDown={e => e.key === 'Enter' && sendMessage({text: input})} />
                <div className="flex gap-1">
                  <button onClick={() => sendMessage({text: input})} className="flex-1 bg-black text-white py-3 font-black text-[11px] active:bg-gray-800">ENVIAR</button>
                  <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
                          className={`px-5 border-2 border-black font-black flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 text-white' : 'bg-white/20'}`}>
                    <Icons.Mic />
                  </button>
                  <button onClick={async () => {
                    if (!input) return;
                    setIsTyping(true);
                    vibrate(10);
                    const sticker = await generatePixelSticker(input);
                    if (sticker) sendMessage({ sticker });
                    setIsTyping(false);
                  }} className="px-3 border-2 border-black font-black text-[10px] active:bg-black active:text-white">IA</button>
                </div>
              </div>
            </div>
          )}

          {view === 'wall' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b-2 border-black bg-black/5 flex gap-2">
                <input className="flex-1 bevel-in text-[12px]" value={input} onChange={e => setInput(e.target.value)} placeholder="POSTEAR..." />
                <button onClick={() => { vibrate(10); handlePost(input); }} className="bevel-out px-4 bg-black text-white">OK</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {stories.map(s => (
                  <div key={s.id} className="border-2 border-black p-4 bg-white/5 shadow-[4px_4px_0_#000]">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={s.userAvatar} className="w-7 h-7 border border-black pixel-img" />
                      <span className="text-[11px] font-black uppercase">{s.userName}</span>
                    </div>
                    <p className="text-[13px] font-bold mb-3 uppercase leading-tight">{s.content}</p>
                    {s.image && <img src={s.image} className="w-full border-2 border-black mb-3 pixel-img" />}
                    <div className="flex gap-4 border-t border-black/10 pt-2 text-[10px] font-black">
                      <button onClick={() => { vibrate(10); setStories(stories.map(st => st.id === s.id ? {...st, reactions: {...st.reactions, '🔥': (st.reactions['🔥']||0)+1}} : st)); }}>LIKE {s.reactions['🔥'] || 0}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'search' && (
            <div className="flex-1 flex flex-col p-6 gap-4">
              <label className="config-label">RED_GLOBAL_S_NET</label>
              <div className="flex gap-2">
                <input className="flex-1 bevel-in" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="BUSCAR..." />
                <button onClick={async () => {
                  vibrate(15);
                  setIsTyping(true);
                  const res = await getBotResponse(searchQuery);
                  setSearchResults(res);
                  setIsTyping(false);
                }} className="bevel-out px-6 bg-black text-white font-black">GO</button>
              </div>
              <div className="flex-1 border-2 border-black bg-white/10 p-4 font-mono text-[11px] uppercase leading-tight overflow-y-auto">
                {isTyping ? "CONNECTING_TO_S_NET..." : searchResults ? searchResults.text : "LISTO PARA INDEXAR RED"}
                {searchResults?.sources?.map((s,i) => (
                  <a key={i} href={s.uri} target="_blank" className="block mt-3 underline opacity-50 text-[9px] border-l border-current pl-2">SRC_{i}: {s.title}</a>
                ))}
              </div>
            </div>
          )}

          {view === 'profile' && (
            <div className="flex-1 flex flex-col p-6 gap-8 overflow-y-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img src={profile.avatar} className="w-24 h-24 border-4 border-black shadow-[6px_6px_0_#000] pixel-img" />
                  <button onClick={() => { vibrate(10); avatarInputRef.current?.click(); }} className="absolute -bottom-2 -right-2 bg-black text-white p-2 border-2 border-black text-[9px] font-black">EDIT</button>
                </div>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onloadend = () => setProfile({ ...profile, avatar: r.result as string });
                    r.readAsDataURL(f);
                  }
                }} />
              </div>
              <div className="space-y-6">
                <div>
                  <label className="config-label">ID_NAME</label>
                  <input className="bevel-in" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="config-label">BIO_DAT</label>
                  <input className="bevel-in" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="config-label">THEME_COLOR</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['default', 'amber', 'blue', 'red'].map(c => (
                      <button key={c} onClick={() => { vibrate(5); setProfile({...profile, lcdColor: c}); }} 
                              className={`h-12 border-2 border-black shadow-[3px_3px_0_#000] ${c === 'default' ? 'bg-[#d4e09b]' : c === 'amber' ? 'bg-amber-400' : c === 'blue' ? 'bg-blue-400' : 'bg-red-400'}`}>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'system' && (
            <div className="flex-1 flex flex-col p-6 gap-6 font-mono text-[12px] font-black uppercase">
              <span className="config-label">NUCLEO_SISTEMA_V13</span>
              <div className="space-y-4 p-5 border-2 border-black bg-black/5">
                <div className="flex justify-between items-center">
                  <span>MODO_GHOST:</span>
                  <button onClick={() => { vibrate(20); setGhostMode(!ghostMode); }} className={`px-4 py-1 border-2 border-black ${ghostMode ? 'bg-black text-white' : ''}`}>
                    {ghostMode ? 'ACTIVO' : 'OFF'}
                  </button>
                </div>
                <div className="flex justify-between"><span>SEÑAL_NET:</span> <span className="text-green-800">100%_STABLE</span></div>
                <div className="flex justify-between"><span>LATENCIA:</span> <span className="text-green-800">8MS</span></div>
                <div className="flex justify-between"><span>PWA_MODE:</span> <span>STANDALONE</span></div>
              </div>
              <button onClick={() => { vibrate([50, 100, 50]); localStorage.clear(); window.location.reload(); }} className="mt-auto border-2 border-black py-5 bg-red-600/20 active:bg-red-600 active:text-white font-black">PURGE_SYSTEM_MEMORY</button>
            </div>
          )}
        </div>
      </div>

      <div className="nav-bar">
        <button onClick={() => { vibrate(5); setView('chats'); }} className={`nav-item ${view === 'chats' ? 'active' : ''}`}>
          <Icons.Chats />
          <span>NODES</span>
        </button>
        <button onClick={() => { vibrate(5); setView('search'); }} className={`nav-item ${view === 'search' ? 'active' : ''}`}>
          <Icons.Search />
          <span>S_NET</span>
        </button>
        <button onClick={() => { vibrate(5); setView('wall'); }} className={`nav-item ${view === 'wall' ? 'active' : ''}`}>
          <Icons.Wall />
          <span>WALL</span>
        </button>
        <button onClick={() => { vibrate(5); setView('profile'); }} className={`nav-item ${view === 'profile' ? 'active' : ''}`}>
          <Icons.Profile />
          <span>ID</span>
        </button>
        <button onClick={() => { vibrate(5); setView('system'); }} className={`nav-item ${view === 'system' ? 'active' : ''}`}>
          <Icons.System />
          <span>SYS</span>
        </button>
      </div>
    </div>
  );
};

export default App;
