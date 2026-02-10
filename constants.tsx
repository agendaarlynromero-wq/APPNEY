
export const INITIAL_PROFILE = {
  name: 'USER_NEW',
  bio: 'CONECTANDO A LA RED...',
  status: 'ONLINE',
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ney&backgroundColor=ffffff',
  lcdColor: 'default'
};

export const DEFAULT_CONTACTS = [
  {
    id: 'bot-1',
    name: 'NEY_AI',
    bio: 'ASISTENTE VIRTUAL 8-BIT.',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=bot&backgroundColor=ffffff',
    isOnline: true
  }
];

export const MOCK_STORIES = [
  {
    id: 'welcome',
    userId: 'bot-1',
    userName: 'NEY_SYSTEM',
    userAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=bot&backgroundColor=ffffff',
    content: 'BIENVENIDO A NEY PAGER +. COMPARTE TU LINK PARA AGREGAR AMIGOS.',
    timestamp: Date.now(),
    comments: [
      {
        id: 'c1',
        userId: 'bot-1',
        userName: 'NEY_CORE',
        userAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=bot',
        text: '¡ESTOY LISTO PARA TUS PREGUNTAS EN S_NET!',
        timestamp: Date.now()
      }
    ],
    reactions: { '❤️': 1 }
  }
];

export const STICKERS = ['🍄', '⭐', '❤️', '🔥', '⚡', '💣', '💎', '👾'];
