export interface NavigationCard {
  title: string;
  description: string;
  icon: string;
  path: string;
  gradient: string;
  hoverColor: string;
}

export const navigationCardsData: NavigationCard[] = [
  {
    title: 'Community',
    description: 'Innovative solutions & platforms',
    icon: '🚀',
    path: '/tabb',
    gradient: 'from-orange-500 to-red-500',
    hoverColor: 'text-[#BBFEFF]'
  },
  {
    title: 'Digital',
    description: 'Cutting-edge development solutions',
    icon: '💻',
    path: '/digital',
    gradient: 'from-blue-500 to-cyan-500',
    hoverColor: 'text-[#BBFEFF]'
  },
  {
    title: 'Media',
    description: 'Creative visual storytelling',
    icon: '🎬',
    path: '/media',
    gradient: 'from-purple-500 to-pink-500',
    hoverColor: 'text-[#BBFEFF]'
  },
  {
    title: 'Academy',
    description: 'Learn and grow with experts',
    icon: '🎓',
    path: '/academy',
    gradient: 'from-green-500 to-teal-500',
    hoverColor: 'text-[#BBFEFF]'
  }
];