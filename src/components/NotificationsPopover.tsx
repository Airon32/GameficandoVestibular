import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Swords, UserPlus, Trophy, Flame, ChevronRight, CheckCheck, Loader2 } from 'lucide-react';
import { AppNotification, FriendRequest } from '../types';
import { SocialService } from '../services/socialService';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onOpenChallenges: () => void;
  onOpenFriends: () => void;
  onOpenLeagues: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  userId,
  onOpenChallenges,
  onOpenFriends,
  onOpenLeagues,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadNotifs();
    }
  }, [isOpen, userId]);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const list = await SocialService.getNotifications(userId);
      setNotifications(list);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await SocialService.markAllNotificationsAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif) return;
    if (!notif.isRead && notif.id) {
      await SocialService.markNotificationAsRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n && n.id === notif.id ? { ...n, isRead: true } : n)));
    }

    if (notif.type === 'challenge_received' || notif.type === 'challenge_completed') {
      onClose();
      onOpenChallenges();
    } else if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
      onClose();
      onOpenFriends();
    } else if (notif.type === 'league_promotion') {
      onClose();
      onOpenLeagues();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden mt-12 sm:mt-14 mr-0 sm:mr-4">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Notificações</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] text-[#888] hover:text-white flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Lidas
            </button>
            <button
              onClick={onClose}
              className="text-[#777] hover:text-white p-1 rounded-lg hover:bg-[#222] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#1e1e1e]">
          {loading ? (
            <div className="p-8 text-center text-[#777] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
              <span className="text-xs">Carregando avisos...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-[#666] flex flex-col items-center justify-center gap-2">
              <Bell className="w-6 h-6 text-[#444]" />
              <p className="text-xs">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            notifications.map((n, idx) => (
              <div
                key={n.id ? `${n.id}_${idx}` : `notif_${idx}`}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 flex items-start gap-3 hover:bg-[#1c1c1c] transition cursor-pointer ${
                  !n.isRead ? 'bg-orange-950/20' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center shrink-0 text-sm">
                  {n.type === 'challenge_received' && <Swords className="w-4 h-4 text-orange-400" />}
                  {n.type === 'challenge_completed' && <Trophy className="w-4 h-4 text-amber-400" />}
                  {n.type === 'friend_request' && <UserPlus className="w-4 h-4 text-sky-400" />}
                  {n.type === 'friend_accepted' && <Check className="w-4 h-4 text-emerald-400" />}
                  {n.type === 'league_promotion' && <Trophy className="w-4 h-4 text-purple-400" />}
                  {n.type === 'streak_milestone' && <Flame className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                    <span className="text-[9px] font-mono text-[#666] shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#999] mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 self-center" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
