import React from 'react';
import { BatteryCharging, Wrench, ShieldAlert, MapPin, Search } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header section with glassmorphism */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900/40 to-gray-900/80 border border-gray-800 p-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Zap className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Find Your Next <span className="text-emerald-400">Charge</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-6">
            Locate EV charging stations, schedule maintenance services, and get emergency help whenever you need it.
          </p>
          
          {/* Search Bar */}
          <div className="flex bg-gray-800/80 backdrop-blur-sm rounded-full max-w-xl border border-gray-700 shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
            <div className="flex items-center pl-4 pr-2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Search by city, zip code, or station name..." 
              className="w-full bg-transparent border-none text-white focus:outline-none py-4 px-2"
            />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 font-medium transition-colors cursor-pointer">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Charging Stations', desc: 'Find nearby fast chargers', icon: BatteryCharging, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { title: 'Service Hubs', desc: 'Book EV maintenance', icon: Wrench, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { title: 'Trip Planner', desc: 'Plan routes with charging stops', icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { title: 'Emergency SOS', desc: 'Get immediate roadside assistance', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10 border-red-500/30' },
        ].map((item, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 transition-all cursor-pointer group hover:-translate-y-1`}>
            <div className={`p-3 rounded-lg inline-block w-fit ${item.bg} mb-4`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Mock Map / Activity Section */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col items-center justify-center min-h-[400px]">
        <MapPin className="h-16 w-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-medium text-gray-500">Interactive Map Integration Here</h3>
        <p className="text-gray-600 text-sm mt-2">Will display real-time station availability and locations</p>
      </div>

    </div>
  );
};

// We used Zap in the header background, but forgot to import it. Let me fix that.
import { Zap } from 'lucide-react';
export default Dashboard;
