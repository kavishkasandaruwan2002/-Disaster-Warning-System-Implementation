import React from 'react';
import { ShieldAlert, Code2, PhoneCall, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                DEWECS
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Disaster Early-Warning and Emergency Coordination System. Built for ground hazard verification, multi-channel broadcast warnings, shelter allocation, and analytical reporting.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Channel Fan-out Gateway Online (PUSH • SMS • AUDIBLE)</span>
            </div>
          </div>

          {/* Quick Hotlines Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Emergency Hotlines
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-rose-400">117</span> — Disaster Management
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-blue-400">119</span> — Police Emergency
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400">1990</span> — Ambulance (Suwa Seriya)
              </div>
            </div>
          </div>

          {/* Academic / Group Credit Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Project Information
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Developed for <strong>SE3070</strong> Software Engineering Project.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
              >
                <Code2 className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DEWECS • SE3070 Group 20. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>MERN Stack &amp; TailwindCSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
