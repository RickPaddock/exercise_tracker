import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Target, Users, Check, Moon, Sun } from 'lucide-react';

const STORAGE_KEYS = {
  startDate: 'abs_startDate',
  participants: 'abs_participants',
  completedDays: 'abs_completedDays',
  isDarkMode: 'abs_isDarkMode'
};

const safeLoadJSON = (key, fallback) => {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    // corrupted localStorage value -> return fallback
    return fallback;
  }
};

const AbsChallengeTracker = () => {
  const todayIso = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(() => safeLoadJSON(STORAGE_KEYS.startDate, todayIso));
  const [participants, setParticipants] = useState(() => safeLoadJSON(STORAGE_KEYS.participants, []));
  const [newParticipantName, setNewParticipantName] = useState('');
  const [completedDays, setCompletedDays] = useState(() => safeLoadJSON(STORAGE_KEYS.completedDays, {}));
  const [isDarkMode, setIsDarkMode] = useState(() => safeLoadJSON(STORAGE_KEYS.isDarkMode, true));

  // persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.startDate, JSON.stringify(startDate)); } catch (e) {}
  }, [startDate]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.participants, JSON.stringify(participants)); } catch (e) {}
  }, [participants]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.completedDays, JSON.stringify(completedDays)); } catch (e) {}
  }, [completedDays]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.isDarkMode, JSON.stringify(isDarkMode)); } catch (e) {}
  }, [isDarkMode]);

  // Helpers
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getDaysBehind = (participant) => {
    const today = new Date();
    const start = new Date(startDate);
    const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    const scheduledDay = Math.min(daysSinceStart, 28);
    if (scheduledDay <= 0) return 0;

    const completedDaysCount = Array.from({ length: 28 }, (_, i) => i + 1)
      .filter(day => completedDays[`${day}-${participant}`]).length;

    return Math.max(0, scheduledDay - completedDaysCount);
  };

  const getCurrentChallengeDay = () => {
    const today = new Date();
    const start = new Date(startDate);
    const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(daysSinceStart, 0), 28);
  };

  const getExerciseType = (day) => {
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  };

  const exerciseLinks = {
    1: 'https://www.youtube.com/watch?v=AErtEV69HT8&feature=youtu.be',
    2: 'https://www.youtube.com/watch?v=roVpnF0PK_8',
    3: 'https://www.youtube.com/watch?v=obSgX7plyz4&feature=youtu.be',
    4: 'https://www.youtube.com/watch?v=R8oZk2wnpY0'
  };

  const getDateForDay = (day) => {
    const start = new Date(startDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + day - 1);
    return targetDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', weekday: 'short'
    });
  };

  // Add new participant (safe, avoids duplicates)
  const addParticipant = () => {
    const name = newParticipantName.trim();
    if (!name) return;
    setParticipants(prev => (prev.includes(name) ? prev : [...prev, name]));
    setNewParticipantName('');
  };

  // Toggle completion status
  const toggleCompletion = (day, participant) => {
    const key = `${day}-${participant}`;
    setCompletedDays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Remove participant and clean up their completed days
  const removeParticipant = (participantToRemove) => {
    setParticipants(prev => prev.filter(p => p !== participantToRemove));
    setCompletedDays(prev => {
      const out = {};
      Object.keys(prev).forEach(key => {
        if (!key.endsWith(`-${participantToRemove}`)) out[key] = prev[key];
      });
      return out;
    });
  };

  const getProgress = (participant) => {
    const completed = Array.from({ length: 28 }, (_, i) => i + 1)
      .filter(day => completedDays[`${day}-${participant}`]).length;
    return { completed, percentage: Math.round((completed / 28) * 100) };
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-black' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-black',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    cardBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    tableBg: isDarkMode ? 'bg-gray-900' : 'bg-white',
    tableRow: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
    headerBg: isDarkMode ? 'bg-gray-800' : 'bg-gray-100',
    input: isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black',
    button: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} transition-colors`}>
      <div className="w-full">
        {/* Header */}
        <div className="text-center p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <Target className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-4xl font-bold text-center">Igor Voitenko 28 Day Abs Challenge</h1>
            <button
              type="button"
              onClick={() => setIsDarkMode(prev => !prev)}
              className={`p-2 rounded-lg ${themeClasses.button} transition-colors`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* Challenge Link */}
          <div className="mb-4 sm:mb-6">
            <a
              href="https://igorvoitenko.com/abs-challenge-2021"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${themeClasses.button} hover:underline transition-colors text-sm sm:text-base`}
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              View Original Challenge
            </a>
          </div>

          {/* Start Date Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <label className="font-medium text-sm sm:text-base">Challenge Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`px-3 py-2 rounded-lg ${themeClasses.input} border focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base`}
            />
          </div>

          {/* Current Date */}
          <div className={`mb-4 sm:mb-6 ${themeClasses.textMuted} text-xs sm:text-sm`}>
            Current Date: {getCurrentDate()}
          </div>

          {/* Add Participant */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Add participant name..."
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addParticipant(); } }}
              className={`px-3 py-2 rounded-lg ${themeClasses.input} border focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full sm:w-64 max-w-xs`}
            />
            <button
              type="button"
              onClick={addParticipant}
              className={`${themeClasses.button} p-2 rounded-lg transition-colors`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Main Tracker Table */}
        {participants.length > 0 ? (
          <div className="px-2 sm:px-4">
            <div className={`${themeClasses.tableBg} rounded-lg sm:rounded-2xl shadow-2xl border ${themeClasses.border} relative`}>
              <div
                className="overflow-auto"
                style={{
                  maxHeight: '70vh',
                  scrollbarWidth: 'thin',
                  scrollbarColor: isDarkMode ? '#4B5563 #1F2937' : '#D1D5DB #F9FAFB'
                }}
              >
                <table className="w-full" style={{ minWidth: participants.length > 2 ? '800px' : '600px' }}>
                  <thead className={`${themeClasses.headerBg} sticky top-0 z-20 shadow-sm`}>
                    <tr>
                      <th className={`px-2 sm:px-4 py-3 sm:py-4 text-left font-semibold ${themeClasses.text} text-xs sm:text-sm sticky left-0 z-30 ${themeClasses.headerBg} border-r ${themeClasses.border}`} style={{ minWidth: '40px', width: '40px' }}>
                        Day
                      </th>
                      <th className={`px-2 sm:px-3 py-3 sm:py-4 text-left font-semibold ${themeClasses.text} text-xs sm:text-sm border-r ${themeClasses.border}`} style={{ minWidth: '60px', width: '60px' }}>
                        Date
                      </th>
                      <th className={`px-2 sm:px-3 py-3 sm:py-4 text-left font-semibold ${themeClasses.text} text-xs sm:text-sm border-r ${themeClasses.border}`} style={{ minWidth: '70px', width: '70px' }}>
                        Exercise
                      </th>
                      {participants.map(participant => {
                        const progress = getProgress(participant);
                        const daysBehind = getDaysBehind(participant);
                        return (
                          <th key={participant} className={`px-2 sm:px-3 py-3 sm:py-4 text-center font-semibold ${themeClasses.text} text-xs sm:text-sm border-r ${themeClasses.border}`} style={{ minWidth: '100px', width: '100px' }}>
                            <div className="flex flex-col">
                              <span className="mb-1 truncate text-xs sm:text-sm" title={participant}>{participant}</span>
                              <div className="text-xs font-normal">
                                <div>{progress.completed}/28 • {progress.percentage}%</div>
                                {daysBehind > 0 && (
                                  <div className="text-red-500 mt-1">
                                    {daysBehind} behind
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeParticipant(participant)}
                                className={`text-red-500 hover:text-red-400 text-xs mt-1 underline`}
                              >
                                Remove
                              </button>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
                      const exerciseType = getExerciseType(day);
                      const isWeekStart = (day - 1) % 7 === 0;
                      const currentDay = getCurrentChallengeDay();
                      const isCurrentDay = day === currentDay;

                      return (
                        <tr
                          key={day}
                          className={`transition-colors ${
                            isCurrentDay
                              ? isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-200 hover:bg-gray-300'
                              : themeClasses.tableRow
                          } ${
                            isWeekStart ? `border-t-2 ${themeClasses.border}` : `border-b ${themeClasses.border}`
                          }`}
                        >
                          <td className={`px-2 sm:px-4 py-2 sm:py-3 font-semibold ${themeClasses.text} text-xs sm:text-sm sticky left-0 z-10 ${
                            isCurrentDay
                              ? isDarkMode
                                ? 'bg-gray-700'
                                : 'bg-gray-200'
                              : themeClasses.tableBg
                          } border-r ${themeClasses.border}`} style={{ width: '40px' }}>
                            {day}
                          </td>
                          <td className={`px-2 sm:px-3 py-2 sm:py-3 ${themeClasses.textMuted} text-xs sm:text-sm border-r ${themeClasses.border}`} style={{ width: '60px' }}>
                            {getDateForDay(day)}
                          </td>
                          <td className={`px-2 sm:px-3 py-2 sm:py-3 border-r ${themeClasses.border}`} style={{ width: '70px' }}>
                            <a
                              href={exerciseLinks[exerciseType]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap hover:underline transition-colors ${
                                exerciseType === 1 ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' :
                                exerciseType === 2 ? 'bg-gray-300 text-gray-900 hover:bg-gray-400' :
                                exerciseType === 3 ? 'bg-gray-400 text-gray-900 hover:bg-gray-500' :
                                'bg-gray-500 text-white hover:bg-gray-600'
                              }`}
                            >
                              Exercise {exerciseType}
                            </a>
                          </td>
                          {participants.map(participant => (
                            <td key={participant} className={`px-2 sm:px-3 py-2 sm:py-3 border-r ${themeClasses.border}`} style={{ width: '100px' }}>
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => toggleCompletion(day, participant)}
                                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                    completedDays[`${day}-${participant}`]
                                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600'
                                      : isDarkMode
                                        ? 'border-gray-600 hover:border-green-400 hover:bg-green-900'
                                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                  }`}
                                >
                                  {completedDays[`${day}-${participant}`] && (
                                    <Check className="w-3 h-3 sm:w-5 sm:h-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 px-4 ${themeClasses.textMuted}`}>
            <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg sm:text-xl">Add participants to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsChallengeTracker;
