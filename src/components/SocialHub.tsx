import React, { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  Swords,
  Search,
  UserPlus,
  Check,
  X,
  Flame,
  Target,
  Clock,
  ChevronRight,
  Shield,
  Loader2,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  AlertCircle,
  Eye,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  UserState,
  FriendProfileSummary,
  FriendRequest,
  WeeklyLeagueInfo,
  Challenge,
} from '../types';
import { SocialService } from '../services/socialService';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';
import { RankManager } from '../engines/RankManager';

interface SocialHubProps {
  currentUser: UserState;
  onOpenProfile: (profile: FriendProfileSummary) => void;
  onStartChallenge: (opponent: FriendProfileSummary) => void;
  onPlayChallenge: (challenge: Challenge) => void;
  onOpenAuth: () => void;
  isGuest: boolean;
}

export const SocialHub: React.FC<SocialHubProps> = ({
  currentUser,
  onOpenProfile,
  onStartChallenge,
  onPlayChallenge,
  onOpenAuth,
  isGuest,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'leagues' | 'friends' | 'rankings' | 'challenges'>('leagues');

  // Friends tab state
  const [friends, setFriends] = useState<FriendProfileSummary[]>([]);
  const [friendSortMode, setFriendSortMode] = useState<'level' | 'weeklyXP'>('level');
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfileSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendActionMsg, setFriendActionMsg] = useState<string | null>(null);

  // Leagues tab state
  const [leagueInfo, setLeagueInfo] = useState<WeeklyLeagueInfo | null>(null);
  const [leagueLoading, setLeagueLoading] = useState(false);

  // Challenges tab state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);

  // Global Rankings state (100% Real Players from Firestore)
  const [rankingFilter, setRankingFilter] = useState<'totalXP' | 'level' | 'maxStreak' | 'accuracy'>('totalXP');
  const [globalRankings, setGlobalRankings] = useState<FriendProfileSummary[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);

  useEffect(() => {
    loadAllSocialData();
  }, [currentUser?.id, currentUser?.totalXP, currentUser?.level, currentUser?.weeklyXP]);

  useEffect(() => {
    if (activeSubTab === 'rankings') {
      loadGlobalRankings();
    }
  }, [activeSubTab, rankingFilter, currentUser?.totalXP, currentUser?.level]);

  const loadAllSocialData = async () => {
    loadLeague();
    loadFriendsAndRequests();
    loadChallenges();
    loadGlobalRankings();
  };

  const loadLeague = async () => {
    setLeagueLoading(true);
    try {
      const data = await SocialService.getWeeklyLeagueInfo(currentUser);
      setLeagueInfo(data);
    } catch {
      // Fallback
    } finally {
      setLeagueLoading(false);
    }
  };

  const loadGlobalRankings = async () => {
    setRankingsLoading(true);
    try {
      const realPlayers = await SocialService.getGlobalLeaderboard(rankingFilter, currentUser);
      setGlobalRankings(realPlayers);
    } catch {
      // Fallback
    } finally {
      setRankingsLoading(false);
    }
  };

  const loadFriendsAndRequests = async () => {
    if (!currentUser?.id) return;
    setFriendsLoading(true);
    try {
      const [friendsList, reqs] = await Promise.all([
        SocialService.getFriendsList(currentUser.id),
        SocialService.getPendingFriendRequests(currentUser.id),
      ]);
      setFriends(friendsList);
      setPendingRequests(reqs);
    } catch {
      // Fallback
    } finally {
      setFriendsLoading(false);
    }
  };

  const loadChallenges = async () => {
    if (!currentUser?.id) return;
    setChallengesLoading(true);
    try {
      const chals = await SocialService.getChallenges(currentUser.id);
      setChallenges(chals);
    } catch {
      // Fallback
    } finally {
      setChallengesLoading(false);
    }
  };

  // Search users live
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2 || !currentUser?.id) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await SocialService.searchUsers(searchQuery, currentUser.id);
        setSearchResults(results);
      } catch {
        // Ignore
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser?.id]);

  const handleSendFriendRequest = async (target: FriendProfileSummary) => {
    try {
      const res = await SocialService.sendFriendRequest(currentUser, target.userId, target.username);
      setFriendActionMsg(res.message);
      loadFriendsAndRequests();
      setTimeout(() => setFriendActionMsg(null), 4000);
    } catch {
      setFriendActionMsg('Erro ao enviar solicitação.');
    }
  };

  const handleAcceptRequest = async (req: FriendRequest) => {
    if (!req || !req.id) return;
    try {
      await SocialService.acceptFriendRequest(req, currentUser?.id);
      loadFriendsAndRequests();
    } catch {
      // Ignore
    }
  };

  const handleDeclineRequest = async (req: FriendRequest) => {
    if (!req || !req.id) return;
    try {
      await SocialService.declineFriendRequest(req.id);
      loadFriendsAndRequests();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 animate-fadeIn">
      {/* Guest Banner Notice if not logged in */}
      {isGuest && (
        <div className="mb-6 p-4 bg-orange-950/40 border border-orange-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Modo Visitante</h4>
              <p className="text-xs text-[#aaa]">
                Crie ou entre na sua conta para salvar seu username exclusivo, adicionar amigos e subir de divisão nas Ligas!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-orange-950/40"
          >
            Entrar ou Criar Conta
          </button>
        </div>
      )}

      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#222] pb-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#141414] p-1 rounded-xl border border-[#262626]">
          <button
            onClick={() => setActiveSubTab('leagues')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'leagues'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#1f1f1f]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ligas Semanais</span>
          </button>

          <button
            onClick={() => setActiveSubTab('friends')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer relative ${
              activeSubTab === 'friends'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#1f1f1f]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Amigos</span>
            {pendingRequests.length > 0 && (
              <span className="w-4 h-4 bg-orange-500 text-black font-black text-[9px] rounded-full flex items-center justify-center ml-1">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('challenges')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'challenges'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#1f1f1f]'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Desafios 1v1</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rankings')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'rankings'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#1f1f1f]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Rankings Globais</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIGAS SEMANAIS (WEEKLY LEAGUES) */}
      {/* ======================================================== */}
      {activeSubTab === 'leagues' && (
        <div className="space-y-6">
          {/* League Tier Banner */}
          <div className="bg-gradient-to-r from-[#2a1a0f] via-[#1a1412] to-[#121212] border border-orange-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-600/30 border-2 border-orange-500/50 flex items-center justify-center text-3xl shadow-lg shrink-0">
                  🏆
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">
                      Divisão {leagueInfo?.tierLevel || 3} de 7
                    </span>
                    <span className="text-xs text-[#888] font-mono">Semana {leagueInfo?.weekId}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    Liga {leagueInfo?.tierName || 'Elite'}
                  </h3>
                  <p className="text-xs text-[#aaa] mt-0.5">
                    Os 5 primeiros sobem de divisão no final da semana. Os 5 últimos caem de divisão.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#141414]/90 p-3 rounded-xl border border-[#333] shrink-0">
                <Clock className="w-5 h-5 text-orange-400" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#888] block">Tempo Restante</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {leagueInfo?.timeRemainingStr || '3d 12h'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cohort Leaderboard Table */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#222] flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#888] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-orange-400" />
                Classificação da Sua Turma (25 Jogadores)
              </h4>
              <span className="text-xs font-mono text-[#666]">
                Sua posição: <strong className="text-orange-400">#{leagueInfo?.userRankInCohort || 1}</strong>
              </span>
            </div>

            {leagueLoading ? (
              <div className="p-12 text-center text-[#777] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                <span className="text-xs">Carregando classificação da liga...</span>
              </div>
            ) : (
              <div className="divide-y divide-[#1c1c1c]">
                {leagueInfo?.members.map((member, index) => {
                  const rankNum = index + 1;
                  const isPromotion = rankNum <= 5;
                  const isRelegation = rankNum > 20;
                  const memberKey = member.userId ? `${member.userId}_${index}` : `member_${index}`;

                  return (
                    <div
                      key={memberKey}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
                        member.isCurrentUser
                          ? 'bg-orange-950/30 border-l-4 border-orange-500'
                          : 'hover:bg-[#181818]'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Rank Position Number */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            rankNum === 1
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : rankNum === 2
                              ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                              : rankNum === 3
                              ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                              : 'bg-[#1f1f1f] text-[#888]'
                          }`}
                        >
                          {rankNum}
                        </div>

                        {/* Player Avatar & Handle */}
                        <div className="relative shrink-0">
                          <RankFrame rank={RankManager.getRankForLevel(member.level || 1)} size="sm">
                            <div className="w-full h-full bg-[#222] flex items-center justify-center text-lg">
                              {member.avatar || '🦊'}
                            </div>
                          </RankFrame>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">
                              {member.displayName}
                            </span>
                            {member.isCurrentUser && (
                              <span className="text-[9px] font-mono bg-orange-950/60 border border-orange-500/40 text-orange-400 px-1.5 py-0.2 rounded uppercase font-bold">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#777]">
                            <RankBadge rank={RankManager.getRankForLevel(member.level || 1)} size="xs" showGlow={false} />
                            <span className="truncate">{member.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: XP & Zone Indicator */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <div className="text-right font-mono">
                          <span className="text-sm sm:text-base font-black text-orange-400 block">
                            {member.weeklyXP.toLocaleString()} XP
                          </span>
                          <span className="text-[10px] text-[#666]">nesta semana</span>
                        </div>

                        <div className="w-20 text-right hidden sm:block">
                          {isPromotion && (
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Zona de Subida
                            </span>
                          )}
                          {isRelegation && (
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Zona de Rebaixamento
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AMIGOS (FRIENDS SYSTEM) */}
      {/* ======================================================== */}
      {activeSubTab === 'friends' && (
        <div className="space-y-6">
          {friendActionMsg && (
            <div className="p-3 bg-orange-950/40 border border-orange-500/40 rounded-xl text-orange-300 text-xs text-center font-medium">
              {friendActionMsg}
            </div>
          )}

          {/* Search bar */}
          <div className="bg-[#141414] p-4 rounded-2xl border border-[#262626] shadow-md">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">
              Buscar Novos Amigos (@username ou Nome)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#666] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por @username ou nome..."
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#555] focus:outline-none focus:border-orange-500 transition font-mono"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-orange-400 animate-spin absolute right-3.5 top-3" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-3 divide-y divide-[#222] bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
                {searchResults.map((user, idx) => (
                  <div key={`${user.userId || 'user'}_${idx}`} className="p-3 flex items-center justify-between gap-3 hover:bg-[#222] transition">
                    <div
                      onClick={() => onOpenProfile(user)}
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#282828] flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{user.displayName}</span>
                          <span className="text-[10px] font-mono text-orange-400">Nv. {user.level}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#777] block truncate">{user.username}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendFriendRequest(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0 shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Friend Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-[#181412] border border-orange-500/30 rounded-2xl p-5 shadow-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Solicitações de Amizade Recebidas ({pendingRequests.length})
              </h4>
              <div className="space-y-2">
                {pendingRequests.map((req, idx) => (
                  <div
                    key={`${req.id || 'req'}_${idx}`}
                    className="p-3 bg-[#141414] rounded-xl border border-[#2a2a2a] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#222] flex items-center justify-center text-lg">
                        {req.fromAvatar || '🦊'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{req.fromDisplayName}</span>
                        <span className="text-[11px] font-mono text-[#777] block truncate">{req.fromUsername}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(req)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-sm"
                        title="Aceitar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req)}
                        className="p-2 rounded-xl bg-[#222] hover:bg-rose-950/40 text-[#777] hover:text-rose-400 transition cursor-pointer"
                        title="Recusar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List & Rankings */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#888]">
                  Seus Amigos ({friends.length})
                </h4>
              </div>

              {friends.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[#1a1a1a] p-1 rounded-xl border border-[#282828] self-start sm:self-auto">
                  <button
                    onClick={() => setFriendSortMode('level')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      friendSortMode === 'level'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-[#888] hover:text-white'
                    }`}
                  >
                    Por Nível Global (Lifetime XP)
                  </button>
                  <button
                    onClick={() => setFriendSortMode('weeklyXP')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      friendSortMode === 'weeklyXP'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-[#888] hover:text-white'
                    }`}
                  >
                    Por Liga Semanal (Weekly XP)
                  </button>
                </div>
              )}
            </div>

            {friendsLoading ? (
              <div className="p-12 text-center text-[#777] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                <span className="text-xs">Carregando lista de amigos...</span>
              </div>
            ) : friends.length === 0 ? (
              <div className="p-12 text-center text-[#666] flex flex-col items-center justify-center gap-2">
                <Users className="w-8 h-8 text-[#444]" />
                <p className="text-xs text-[#888]">Você ainda não adicionou nenhum amigo.</p>
                <p className="text-[11px] text-[#666]">
                  Use a barra acima para buscar outros jogadores e começar a competir!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1c1c1c]">
                {[...friends]
                  .sort((a, b) => {
                    if (friendSortMode === 'weeklyXP') {
                      return (b.weeklyXP || 0) - (a.weeklyXP || 0);
                    }
                    // Global Level with Lifetime XP as tie-breaker
                    if ((b.level || 1) !== (a.level || 1)) {
                      return (b.level || 1) - (a.level || 1);
                    }
                    return (b.totalXP || 0) - (a.totalXP || 0);
                  })
                  .map((friend, idx) => {
                    const friendXP = friend.totalXP || 0;
                    const myXP = currentUser.totalXP || 0;
                    const isFriendAhead = friendXP > myXP;
                    const xpDelta = Math.abs(friendXP - myXP);

                    return (
                      <div
                        key={`${friend.userId || 'friend'}_${idx}`}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#181818] transition"
                      >
                        <div
                          onClick={() => onOpenProfile(friend)}
                          className="flex items-center gap-3 cursor-pointer min-w-0"
                        >
                          <div className="relative shrink-0">
                            <RankFrame rank={RankManager.getRankForLevel(friend.level || 1)} size="sm">
                              <div className="w-full h-full bg-[#222] flex items-center justify-center text-lg">
                                {friend.avatar}
                              </div>
                            </RankFrame>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">{friend.displayName}</span>
                              <span className="text-xs font-mono font-bold text-orange-400">Nv. {friend.level}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-[#777]">
                              <RankBadge rank={RankManager.getRankForLevel(friend.level || 1)} size="xs" showGlow={false} />
                              <span>{friend.username}</span>
                              <span>•</span>
                              <span className="text-[#999]">{friend.rankFullName}</span>
                              <span>•</span>
                              <span className="text-slate-400">
                                {friendSortMode === 'weeklyXP'
                                  ? `${(friend.weeklyXP || 0).toLocaleString()} XP nesta semana`
                                  : `${friendXP.toLocaleString()} XP total`}
                              </span>
                            </div>

                            {/* Motivational Proximity Delta Banner */}
                            {isFriendAhead && xpDelta > 0 && (
                              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400">
                                <span>⚡ Faltam {xpDelta.toLocaleString()} XP para alcançar {friend.displayName.split(' ')[0]}</span>
                              </div>
                            )}
                            {!isFriendAhead && xpDelta > 0 && (
                              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                                <span>🏆 +{xpDelta.toLocaleString()} XP à frente</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            onClick={() => onOpenProfile(friend)}
                            className="px-3 py-1.5 bg-[#222] hover:bg-[#2c2c2c] text-[#aaa] hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Ver Perfil
                          </button>
                          <button
                            onClick={() => onStartChallenge(friend)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-orange-950/40"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>Desafiar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DESAFIOS 1v1 (HEAD-TO-HEAD DUELS) */}
      {/* ======================================================== */}
      {activeSubTab === 'challenges' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#221710] to-[#141414] border border-orange-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-600/30 border-2 border-orange-500/50 flex items-center justify-center text-3xl shrink-0">
                ⚔️
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Duelos Diretos 1v1 Assíncronos</h3>
                <p className="text-xs text-[#aaa] mt-1">
                  Ambos os jogadores respondem às mesmas 20 questões geradas de forma justa. Quem acertar mais no menor tempo vence o confronto!
                </p>
              </div>
            </div>
          </div>

          {/* Active / Pending Challenges */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#222] flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#888] flex items-center gap-2">
                <Swords className="w-4 h-4 text-orange-400" />
                Histórico e Desafios Ativos ({challenges.length})
              </h4>
            </div>

            {challengesLoading ? (
              <div className="p-12 text-center text-[#777] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                <span className="text-xs">Carregando desafios...</span>
              </div>
            ) : challenges.length === 0 ? (
              <div className="p-12 text-center text-[#666] flex flex-col items-center justify-center gap-2">
                <Swords className="w-8 h-8 text-[#444]" />
                <p className="text-xs text-[#888]">Nenhum desafio ativo no momento.</p>
                <p className="text-[11px] text-[#666]">
                  Abra a aba Amigos e clique em "Desafiar" para iniciar um duelo de 20 questões!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1c1c1c]">
                {challenges.map((c, idx) => {
                  const isChallenger = c.challengerId === currentUser?.id;
                  const oppName = isChallenger ? c.opponentDisplayName : c.challengerDisplayName;
                  const oppAvatar = isChallenger ? c.opponentAvatar : c.challengerAvatar;
                  const myResult = isChallenger ? c.challengerResult : c.opponentResult;
                  const oppResult = isChallenger ? c.opponentResult : c.challengerResult;
                  const hasIPlayed = !!myResult;
                  const isCompleted = c.status === 'completed';
                  const isWinner = c.winnerId === currentUser?.id;
                  const isDraw = c.winnerId === 'draw';

                  return (
                    <div key={`${c.id || 'chal'}_${idx}`} className="p-4 flex items-center justify-between gap-3 hover:bg-[#181818] transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center text-xl shrink-0">
                          {oppAvatar || '🦊'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">
                              Duelo vs {oppName}
                            </span>
                            {isCompleted ? (
                              isWinner ? (
                                <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-400 px-2 py-0.5 rounded uppercase">
                                  Vitória
                                </span>
                              ) : isDraw ? (
                                <span className="text-[10px] font-bold bg-sky-500/20 border border-sky-500/40 text-sky-400 px-2 py-0.5 rounded uppercase">
                                  Empate
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-400 px-2 py-0.5 rounded uppercase">
                                  Derrota
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] font-bold bg-orange-950/60 border border-orange-500/40 text-orange-400 px-2 py-0.5 rounded uppercase">
                                Em Andamento
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[#777] block mt-0.5">
                            {isCompleted
                              ? `Você: ${myResult?.correctCount}/20 (${((myResult?.totalTimeMs || 0)/1000).toFixed(1)}s) • ${oppName}: ${oppResult?.correctCount}/20 (${((oppResult?.totalTimeMs || 0)/1000).toFixed(1)}s)`
                              : hasIPlayed
                              ? `Você já completou suas 20 questões. Aguardando ${oppName}.`
                              : `Você foi desafiado! Jogue suas 20 questões.`}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {!hasIPlayed ? (
                          <button
                            onClick={() => onPlayChallenge(c)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-orange-950/50"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>Jogar Agora</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onPlayChallenge(c)}
                            className="px-3 py-1.5 bg-[#222] hover:bg-[#2c2c2c] text-[#aaa] hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Ver Duelo
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RANKINGS GLOBAIS */}
      {/* ======================================================== */}
      {activeSubTab === 'rankings' && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'totalXP', label: 'XP Total (Lifetime)' },
              { id: 'level', label: 'Maior Nível Global' },
              { id: 'maxStreak', label: 'Maior Sequência (Streak)' },
              { id: 'accuracy', label: 'Precisão Mental %' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRankingFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  rankingFilter === tab.id
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-900/40'
                    : 'bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#242424]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ranking Board */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Ranking Global Oficial
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Ao Vivo
                </span>
              </div>
              <button
                onClick={loadGlobalRankings}
                disabled={rankingsLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#aaa] hover:text-white text-xs font-mono rounded-lg transition cursor-pointer disabled:opacity-50"
                title="Atualizar ranking em tempo real"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rankingsLoading ? 'animate-spin text-orange-400' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </div>

            {rankingsLoading && globalRankings.length === 0 ? (
              <div className="p-12 text-center text-[#777] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
                <span className="text-xs font-mono">Carregando dados reais dos jogadores...</span>
              </div>
            ) : globalRankings.length === 0 ? (
              <div className="p-12 text-center text-[#777]">
                <Trophy className="w-10 h-10 mx-auto text-[#444] mb-3" />
                <p className="text-sm text-white font-bold mb-1">Nenhum jogador registrado ainda</p>
                <p className="text-xs text-[#777]">
                  Treine e ganhe XP para inaugurar a classificação global!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1c1c1c]">
                {globalRankings.map((player, idx) => {
                  const rankPos = idx + 1;
                  const isCurrent = player.userId === currentUser?.id;
                  const streakVal = player.maxStreak || player.currentStreak || 0;
                  const playerKey = player.userId ? `${player.userId}_${idx}` : `rank_${idx}`;

                  return (
                    <div
                      key={playerKey}
                      onClick={() => onOpenProfile(player)}
                      className={`p-4 flex items-center justify-between gap-3 transition cursor-pointer ${
                        isCurrent
                          ? 'bg-orange-950/30 border-l-4 border-orange-500 hover:bg-orange-950/40'
                          : 'hover:bg-[#181818]'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            rankPos === 1
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                              : rankPos === 2
                              ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                              : rankPos === 3
                              ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                              : 'bg-[#1f1f1f] text-[#888]'
                          }`}
                        >
                          {rankPos}
                        </div>

                        <div className="relative shrink-0">
                          <RankFrame rank={RankManager.getRankForLevel(player.level)} size="sm">
                            <div className="w-full h-full bg-[#222] flex items-center justify-center text-lg">
                              {player.avatar}
                            </div>
                          </RankFrame>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{player.displayName}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono bg-orange-950/80 border border-orange-500/50 text-orange-400 px-1.5 py-0.2 rounded uppercase font-bold">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#777]">
                            <RankBadge rank={RankManager.getRankForLevel(player.level)} size="xs" showGlow={false} />
                            <span className="truncate">{player.username}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0">
                        <span className="text-sm sm:text-base font-black text-orange-400 block">
                          {rankingFilter === 'totalXP' && `${(player.totalXP || 0).toLocaleString()} XP`}
                          {rankingFilter === 'level' && `Nível ${player.level}`}
                          {rankingFilter === 'maxStreak' && `${streakVal} dias`}
                          {rankingFilter === 'accuracy' && `${player.accuracy || 0}%`}
                        </span>
                        <span className="text-[10px] text-[#666]">
                          {rankingFilter === 'totalXP'
                            ? `Nível ${player.level}`
                            : `${(player.totalXP || 0).toLocaleString()} XP`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
