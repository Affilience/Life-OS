import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Heart,
  Brain,
  BookOpen,
  Pen,
  DollarSign,
  Calendar,
  Target,
  Dumbbell
} from 'lucide-react';

export default function ModuleHealthWidget() {
  const navigate = useNavigate();

  // All Modules Health (placeholder data for now)
  const allModules = [
    { name: 'Health', score: 92, icon: Heart, color: 'from-green-500 to-emerald-500', route: '/health' },
    { name: 'Productivity', score: 78, icon: Brain, color: 'from-blue-500 to-cyan-500', route: '/productivity' },
    { name: 'Knowledge', score: 85, icon: BookOpen, color: 'from-purple-500 to-pink-500', route: '/knowledge' },
    { name: 'Journal', score: 67, icon: Pen, color: 'from-orange-500 to-red-500', route: '/journal' },
    { name: 'Finance', score: 45, icon: DollarSign, color: 'from-yellow-500 to-orange-500', route: '/financial' },
    { name: 'Calendar', score: 88, icon: Calendar, color: 'from-indigo-500 to-purple-500', route: '/calendar' },
    { name: 'Skills', score: 73, icon: Target, color: 'from-pink-500 to-rose-500', route: '/skills' },
    { name: 'Fitness', score: 90, icon: Dumbbell, color: 'from-cyan-500 to-blue-500', route: '/health' },
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2 flex-shrink-0">
        <Zap className="w-4 h-4" />
        Module Health
      </h3>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto">
        {allModules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.name}
              className="bg-[#1a1724] border border-white/10 rounded-xl p-3 hover:border-purple-500/30 cursor-pointer transition-all"
              onClick={() => navigate(module.route)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-white/60">{module.name}</div>
                  <div className="text-lg font-bold text-white">{module.score}</div>
                </div>
              </div>
              <div className="h-1 bg-[#0c0a10] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                  style={{ width: `${module.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
