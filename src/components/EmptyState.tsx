import React from 'react';
import { Sparkles, FileText, Compass, Code } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string, researchEnabled?: boolean) => void;
  isDark?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt, isDark = false }) => {
  const suggestions = [
    {
      icon: Compass,
      category: 'Creative Concept',
      title: 'Mallorcan Olive Oil Brand',
      desc: 'Brainstorm names, narrative story, and bottle aesthetics for an artisanal cold-pressed grove.',
      prompt: 'Can you help me brainstorm names, brand narrative, and bottle design notes for an artisanal cold-pressed olive oil from a family grove in Mallorca? Looking for something rooted, modern, and quiet.',
      research: false,
    },
    {
      icon: Sparkles,
      category: 'Research with Citations',
      title: 'Caffeine & Sleep Architecture',
      desc: 'Explore adenosine receptor blocking kinetics, plasma half-life, and SWS deep sleep impact.',
      prompt: 'What does current scientific consensus say about caffeine half-life, adenosine receptor blocking, and its effect on slow-wave deep sleep?',
      research: true,
    },
    {
      icon: FileText,
      category: 'Document Analysis',
      title: 'Solar Lease Contract Review',
      desc: 'Examine annual escalator penalties, net-metering tariff changes, and property sale transfers.',
      prompt: 'Can you explain how solar lease escalator clauses work, how net metering changes affect savings, and what to watch out for if selling a house before term ends?',
      research: false,
    },
    {
      icon: Code,
      category: 'Design & Code',
      title: 'Pure CSS SVG Draw Animation',
      desc: 'Learn how to animate an outline stroke drawing itself using stroke-dasharray keyframes.',
      prompt: 'How do I animate an SVG outline drawing itself in pure CSS without any external libraries?',
      research: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto text-center relative z-10">
      {/* Brand Logo with glowing ignition radial gradient */}
      <div className="mb-4 relative group">
        <div className="absolute -inset-2 rounded-full blur-md opacity-40 bg-gradient-to-r from-[#FF6B4A] to-[#5B47E0] group-hover:opacity-75 transition-opacity" />
        <div className="relative">
          <BrandLogo size={52} isDark={isDark} />
        </div>
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-[#15161A] dark:text-[#EDECE8] mb-1.5">
        How can Nova help today?
      </h2>
      <p className="text-sm text-[#5A5C66] dark:text-[#9A9CA6] max-w-md mb-8 leading-relaxed">
        Ask questions, explore creative drafts, analyze contracts, or research complex topics with citations.
      </p>

      {/* Suggestion prompt cards with glass surface and hover lift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt, item.research)}
              className="flex flex-col justify-between p-4 rounded-lg border border-[#E4E2DC]/80 dark:border-[#24262D]/80 bg-[#FFFFFF]/80 dark:bg-[#121318]/80 backdrop-blur-md hover:border-[#5B47E0] dark:hover:border-[#8577FF] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 text-left group"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5B47E0] dark:text-[#8577FF] mb-1.5">
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{item.category}</span>
                </div>
                <span className="block text-xs font-semibold text-[#15161A] dark:text-[#EDECE8] group-hover:text-[#5B47E0] dark:group-hover:text-[#8577FF] mb-1 transition-colors">
                  {item.title}
                </span>
                <p className="text-xs text-[#5A5C66] dark:text-[#9A9CA6] leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#5B47E0] dark:text-[#8577FF] mt-3 group-hover:underline">
                Use prompt
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
