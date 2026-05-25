import { Layers, Map, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { Badge, Button, Card } from './UI';

interface MapTabProps {
  onSelectWork: (id: string) => void;
}

const SHOPS = ['All Shops', 'Body Shop', 'Assembly Shop', 'Paint Shop'];

const FACTORY_MACHINES = [
  {
    id: 'PM-20260512-0001',
    name: 'Friction Roller Bed',
    shop: 'Body Shop',
    gridPos: { r: 1, c: 2 },
    status: 'In Progress',
    equNo: 'BD-BDC-FRB-01/50',
    temp: '42°C',
    health: 88,
    desc: 'Main transfer conveyor driving system in the Body welding shop.'
  },
  {
    id: 'PM-20260512-0002',
    name: 'Lifter Main Line',
    shop: 'Assembly Shop',
    gridPos: { r: 2, c: 1 },
    status: 'Pending',
    equNo: 'AS-LIFT-MAIN-02',
    temp: '38°C',
    health: 94,
    desc: 'Heavy vertical lifter shifting chassis plates from assembly line.'
  },
  {
    id: 'PM-20260512-0003',
    name: 'Robot Arm #04',
    shop: 'Body Shop',
    gridPos: { r: 2, c: 3 },
    status: 'Upcoming',
    equNo: 'BD-WEL-ROB-04',
    temp: '51°C (High)',
    health: 79,
    desc: 'FANUC Welding robot suffering from slight mechanical vibration.'
  },
  {
    id: 'PM-20260512-0004',
    name: 'Conveyor Drive',
    shop: 'Paint Shop',
    gridPos: { r: 3, c: 2 },
    status: 'Completed',
    equNo: 'PT-CONV-DRV-01',
    temp: '34°C',
    health: 100,
    desc: 'Main paint shop dipping process continuous loop drivetrain.'
  }
];

export default function MapTab({ onSelectWork }: MapTabProps) {
  const [selectedShop, setSelectedShop] = useState('All Shops');
  const [activeMachine, setActiveMachine] = useState<typeof FACTORY_MACHINES[0] | null>(FACTORY_MACHINES[0]);

  const filteredMachines = selectedShop === 'All Shops'
    ? FACTORY_MACHINES
    : FACTORY_MACHINES.filter(m => m.shop === selectedShop);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-[#D91E1E] px-6 pt-16 pb-10 rounded-b-[32px] shadow-lg shadow-red-900/10">
        <div>
          <p className="text-red-100 text-xs font-bold uppercase tracking-wider">Spatial Floor Layout</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6" /> Machine Locator
          </h1>
        </div>
        <p className="text-red-100 text-sm opacity-80 mt-1">
          Interactive map of plant floor. Click a machine node to start preventive inspections instantly.
        </p>

        {/* Shop Category Tabs */}
        <div className="flex gap-1.5 mt-5 overflow-x-auto scrollbar-none pb-1">
          {SHOPS.map(shop => (
            <button
              key={shop}
              onClick={() => {
                setSelectedShop(shop);
                // Reset active helper to first machine in filter
                const filtered = shop === 'All Shops' ? FACTORY_MACHINES : FACTORY_MACHINES.filter(m => m.shop === shop);
                setActiveMachine(filtered[0] || null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedShop === shop
                  ? 'bg-white text-[#D91E1E] shadow-md shadow-black/10'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {shop}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Body */}
      <div className="px-6 mt-6 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gray-400" /> Ground Floor Grid
            </span>
            <span className="text-[10px] text-gray-500 font-bold bg-gray-200/60 px-2 py-0.5 rounded">
              Wuling Plant Cikarang
            </span>
          </div>

          {/* Plant Floor Simulated Map Grid */}
          <div className="bg-gray-900 border-4 border-gray-800 rounded-2xl p-5 shadow-inner relative aspect-square flex flex-col justify-between overflow-hidden">
            {/* Grid Line Accents */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 opacity-10 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border-t border-l border-white" />
              ))}
            </div>

            {/* Custom Interactive Hotspots Layout */}
            <div className="relative w-full h-full grid grid-cols-3 grid-rows-3 gap-3">
              {FACTORY_MACHINES.map((machine) => {
                const isSelected = activeMachine?.id === machine.id;
                const isFilteredOut = selectedShop !== 'All Shops' && machine.shop !== selectedShop;

                // Color themes of dots on map based on PM status
                const ledColor = 
                  machine.status === 'Completed' ? 'bg-green-400' :
                  machine.status === 'In Progress' ? 'bg-blue-400 shadow-blue-500/50' :
                  machine.status === 'Upcoming' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400 animate-ping';

                return (
                  <button
                    key={machine.id}
                    onClick={() => setActiveMachine(machine)}
                    disabled={isFilteredOut}
                    style={{
                      gridRowStart: machine.gridPos.r,
                      gridColumnStart: machine.gridPos.c,
                    }}
                    className={`relative rounded-xl flex flex-col items-center justify-center p-2.5 transition-all duration-300 border ${
                      isFilteredOut ? 'opacity-20 pointer-events-none' : 'opacity-100'
                    } ${
                      isSelected 
                        ? 'bg-red-950/80 border-[#D91E1E] ring-2 ring-red-500/30 scale-105' 
                        : 'bg-gray-800/90 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`w-3.5 h-3.5 rounded-full ${ledColor} border-2 border-gray-950`} />
                    </div>
                    
                    <span className="text-[9px] font-mono font-bold text-gray-300 mt-1.5 text-center truncate w-full">
                      {machine.name.split(' ')[0]}
                    </span>
                    <span className="text-[7px] text-gray-500 font-bold uppercase tracking-tight font-mono">
                      {machine.shop.split(' ')[0]}
                    </span>

                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 bg-[#D91E1E] text-white p-0.5 rounded-full">
                        <MapPin className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scale indicator overlay */}
            <div className="absolute bottom-2 right-2 text-[7px] font-mono text-gray-500 font-bold">
              GRID SCALE: 1 UNIT = 15m
            </div>
          </div>
        </div>

        {/* Selected Area Machine Details Panel */}
        <AnimatePresence mode="wait">
          {activeMachine && (
            <motion.div
              key={activeMachine.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Card className="border border-red-100 overflow-hidden relative">
                {/* Visual Accent Badge */}
                <span className="absolute top-0 right-0 h-10 w-10 bg-red-500/5 rounded-bl-[40px]" />

                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-base">{activeMachine.name}</h3>
                      <Badge variant={
                        activeMachine.status === 'In Progress' ? 'blue' : 
                        activeMachine.status === 'Completed' ? 'green' : 
                        activeMachine.status === 'Upcoming' ? 'gray' : 'yellow'
                      }>
                        {activeMachine.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-[#D91E1E] font-bold">{activeMachine.equNo}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold">Health Score</p>
                    <p className={`text-lg font-mono font-extrabold ${activeMachine.health >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {activeMachine.health}%
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed mb-4">
                  {activeMachine.desc}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-2 border border-gray-100 rounded-lg bg-white">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">SHOP SECTOR</p>
                    <p className="text-xs font-bold text-gray-700">{activeMachine.shop}</p>
                  </div>
                  <div className="p-2 border border-gray-100 rounded-lg bg-white">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">INTERNAL TEMP</p>
                    <p className="text-xs font-bold text-gray-700">{activeMachine.temp}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => onSelectWork(activeMachine.id)}
                  className="w-full"
                >
                  {activeMachine.status === 'Completed' ? 'Inspeksi Ulang / Lihat PM' : 'Mulai Inspeksi Checklist'}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
