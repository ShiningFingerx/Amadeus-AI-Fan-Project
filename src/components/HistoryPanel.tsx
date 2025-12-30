
import React from 'react';
import type { Conversation } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSwitchChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
  synthesizingId: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  conversations,
  activeConversationId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onClose,
  synthesizingId
}) => {
  if (!isOpen) return null;

  const sortedConversations = [...conversations].sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative h-full w-full max-w-sm glass-panel flex flex-col animate-slide-in-left">
        <div className="p-4 flex-shrink-0 flex justify-between items-center border-b border-amber-500/30">
          <h2 className="text-2xl font-orbitron text-amber-300">Chat History</h2>
          <button
            onClick={onClose}
            aria-label="Close history panel"
            className="text-amber-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex-shrink-0">
            <button
                onClick={onNewChat}
                className="w-full text-center py-2 px-4 border border-amber-500/50 bg-amber-500/20 text-white rounded-md hover:bg-amber-500/30 transition-colors duration-300 font-orbitron tracking-wider"
            >
                + NEW CHAT
            </button>
        </div>

        <div className="flex-grow p-2 overflow-y-auto scrollbar-thin-amber">
          <ul className="space-y-2">
            {sortedConversations.map((convo) => (
              <li key={convo.id}>
                <div
                  className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                    activeConversationId === convo.id
                      ? 'bg-amber-500/30'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex-grow truncate cursor-pointer" onClick={() => onSwitchChat(convo.id)}>
                    <p className="font-bold text-amber-200 truncate">{convo.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(convo.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2 flex items-center gap-1">
                    {synthesizingId === convo.id && (
                        <div className="p-1" title="Memory synthesizing...">
                            <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(convo.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 flex-shrink-0"
                        aria-label={`Delete chat ${convo.title}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
