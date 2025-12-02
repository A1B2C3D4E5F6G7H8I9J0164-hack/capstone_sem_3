import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function ActivityGraph({ energyGraphData, hoveredDay, setHoveredDay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 rounded-2xl bg-gradient-to-br from-black/80 via-black to-gray-900/90 dark:from-black/80 dark:via-black dark:to-gray-900/90 light:from-white/90 light:via-gray-50 light:to-gray-100/90 border border-white/5 dark:border-white/5 light:border-gray-200 shadow-2xl shadow-black/50 dark:shadow-black/50 light:shadow-gray-300/30 p-5 space-y-5 backdrop-blur-md"
    >
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-white/80 dark:text-white/80 light:text-gray-700" />
          <p className="text-sm font-medium text-white/90 dark:text-white/90 light:text-gray-800">Activity Overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70 dark:text-white/70 light:text-gray-600">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-400 light:bg-emerald-600 mr-1.5 shadow-sm shadow-emerald-400/50"></span>
            <span className="text-white/80 dark:text-white/80 light:text-gray-700">Completed</span>
          </span>
          <span className="hidden sm:inline text-white/30 dark:text-white/30 light:text-gray-400">•</span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-rose-400 dark:bg-rose-400 light:bg-rose-600 mr-1.5 shadow-sm shadow-rose-400/50"></span>
            <span className="text-white/60 dark:text-white/60 light:text-gray-600">Pending</span>
          </span>
          <span className="hidden sm:inline text-white/30 dark:text-white/30 light:text-gray-400">•</span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-400 light:bg-purple-600 mr-1.5 shadow-sm shadow-purple-400/50"></span>
            <span className="text-white/60 dark:text-white/60 light:text-gray-600">Activities</span>
          </span>
        </div>
      </div>
      
      <div className="relative h-48 -mx-1">
        <div className="absolute inset-0 grid grid-cols-7 h-full">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="border-r border-white/[0.03] dark:border-white/[0.03] light:border-gray-200/20 last:border-r-0"></div>
          ))}
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 25, 50, 75, 100].map((percent, i) => (
            <div 
              key={i}
              className="relative h-px w-full"
              style={{ 
                marginTop: i === 0 ? 0 : 'auto',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent)',
                dark: { background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent)' },
                light: { background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.05) 90%, transparent)' }
              }}
            >
              {percent > 0 && (
                <span className="absolute left-1 text-[10px] text-white/20 dark:text-white/20 light:text-gray-400 -translate-y-1/2 select-none">
                  {100 - percent}
                </span>
              )}
            </div>
          ))}
        </div>
        
        <div className="relative h-full flex items-end justify-between px-1">
          {energyGraphData === null ? (
            Array(7).fill(0).map((_, i) => (
              <div 
                key={`loading-${i}`} 
                className="h-full w-8 relative group"
                style={{
                  '--delay': `${i * 0.1}s`,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `var(--delay, 0s)`,
                }}
              >
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/30 dark:from-indigo-500/30 light:from-indigo-400/40 to-purple-500/20 dark:to-purple-500/20 light:to-purple-400/30 rounded-t-lg shadow-sm shadow-indigo-500/20"></div>
              </div>
            ))
          ) : Array.isArray(energyGraphData) && energyGraphData.length > 0 ? (
            energyGraphData.map((d) => {
              const total = Math.max(1, d.total || 0);
              const completed = d.completed || 0;
              const pending = d.pending || 0;
              const activities = d.activities || 0;
              
              const maxValue = Math.max(1, ...energyGraphData.map(d => 
                Math.max(d.total || 0, d.activities || 0, d.completed || 0, d.pending || 0)
              ));
              
              const totalHeight = Math.min((total / maxValue) * 90, 90);
              const completedHeight = total > 0 ? (completed / total) * 100 : 0;
              const activitiesHeight = total > 0 ? (activities / total) * 100 : 0;
              
              const isHovered = hoveredDay === d.day;
              
              return (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center h-full relative group"
                  onMouseEnter={() => setHoveredDay(d.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {isHovered && (
                    <div 
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg bg-gradient-to-b from-black/95 dark:from-black/95 light:from-white/95 to-gray-900/95 dark:to-gray-900/95 light:to-gray-100/95 border border-white/10 dark:border-white/10 light:border-gray-200 backdrop-blur-md z-50 shadow-xl shadow-black/40 dark:shadow-black/40 light:shadow-gray-300/40 w-40 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-white/10 dark:border-white/10 light:border-gray-200">
                        <p className="text-sm font-semibold text-white dark:text-white light:text-gray-800">{d.day}</p>
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 dark:bg-white/10 light:bg-gray-100 text-white/80 dark:text-white/80 light:text-gray-700">
                            {total} total
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-400 light:bg-emerald-600 mr-1.5"></span>
                            Completed
                          </span>
                          <span className="text-xs font-medium text-white dark:text-white light:text-gray-800">{completed || 0}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-rose-400 dark:bg-rose-400 light:bg-rose-600 mr-1.5"></span>
                            Pending
                          </span>
                          <span className="text-xs font-medium text-white dark:text-white light:text-gray-800">{pending || 0}</span>
                        </div>
                        
                        {activities > 0 && (
                          <div className="pt-1.5 mt-1.5 border-t border-white/5 dark:border-white/5 light:border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-300 dark:text-purple-300 light:text-purple-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-400 light:bg-purple-600 mr-1.5"></span>
                                Activities
                              </span>
                              <span className="text-xs font-medium text-white dark:text-white light:text-gray-800">{activities}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/95 dark:bg-black/95 light:bg-white/95 border-t border-l border-white/10 dark:border-white/10 light:border-gray-200 -rotate-45 -z-10"></div>
                    </div>
                  )}

                  <div className="relative w-full h-full flex items-end justify-center group" style={{ minWidth: '28px' }}>
                    <div 
                      className="relative w-6 mx-auto transition-all duration-300 group-hover:w-7"
                      style={{
                        height: `${Math.max(totalHeight, 5)}%`,
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 dark:from-white/10 light:from-gray-200/40 to-black/20 dark:to-black/20 light:to-gray-300/40 rounded-t-lg overflow-hidden border border-white/10 dark:border-white/10 light:border-gray-300 transition-all duration-200 group-hover:border-white/20 dark:group-hover:border-white/20 light:group-hover:border-gray-400 shadow-sm">
                        {pending > 0 && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-500 dark:from-rose-500 light:from-rose-600 to-rose-400 dark:to-rose-400 light:to-rose-500 transition-all duration-300 shadow-sm shadow-rose-500/40"
                            style={{
                              height: `${(pending / total) * 100}%`,
                              borderTop: '1px solid rgba(236, 72, 153, 0.4)'
                            }}
                          ></div>
                        )}
                        
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-emerald-400 dark:from-emerald-400 light:from-emerald-600 to-emerald-500 dark:to-emerald-500 light:to-emerald-700 transition-all duration-300 shadow-sm shadow-emerald-500/40"
                          style={{
                            height: `${(completed / total) * 100}%`,
                            borderTopLeftRadius: '0.5rem',
                            borderTopRightRadius: '0.5rem'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 dark:from-white/20 light:from-white/30 to-transparent opacity-40"></div>
                        </div>
                        
                        {activities > 0 && (
                          <div 
                            className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-t from-purple-500 dark:from-purple-500 light:from-purple-600 to-purple-400 dark:to-purple-400 light:to-purple-500 transition-all duration-300 group-hover:from-purple-400 dark:group-hover:from-purple-400 light:group-hover:from-purple-500 group-hover:to-purple-300 dark:group-hover:to-purple-300 light:group-hover:to-purple-400 shadow-sm shadow-purple-500/40"
                            style={{
                              bottom: `${(activities / total) * 100}%`
                            }}
                          ></div>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 dark:from-white/10 light:from-gray-200/40 to-transparent rounded-t-lg"></div>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full text-center">
                      <span className="text-[10px] font-medium text-white/40 dark:text-white/40 light:text-gray-500 group-hover:text-white/70 dark:group-hover:text-white/70 light:group-hover:text-gray-700 transition-colors select-none">
                        {d.day.slice(0, 1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 dark:bg-white/5 light:bg-gray-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white/30 dark:text-white/30 light:text-gray-400" />
              </div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-500 text-center max-w-[200px]">
                No activity data available for this week
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between px-0.5 mt-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="w-7 text-center">
              <span className="text-[10px] text-white/30 dark:text-white/30 light:text-gray-400 select-none">{day}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center space-x-2 text-white/50 dark:text-white/50 light:text-gray-600">
          <Activity className="h-3 w-3 text-white/60 dark:text-white/60 light:text-gray-500" />
          <span className="text-white/70 dark:text-white/70 light:text-gray-700">Weekly Activity</span>
        </div>
        <div className="text-white/50 dark:text-white/50 light:text-gray-600 font-medium">
          {energyGraphData ? energyGraphData.reduce((sum, day) => sum + (day.activities || 0), 0) : 0} activities
        </div>
      </div>
    </motion.div>
  );
}
