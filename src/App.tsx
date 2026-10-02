import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { TopHUD } from './components/TopHUD';
import { ActivePanel, RightToolbar } from './components/RightToolbar';
import { BottomChatBar } from './components/BottomChatBar';
import { FocusSessionButton } from './components/FocusSessionButton';
import { FocusSessionModal } from './components/FocusSessionModal';
import { FocusSummaryModal } from './components/FocusSummaryModal';
import { BuildModeToolbar } from './components/BuildModeToolbar';
import { AgentChatModal } from './components/AgentChatModal';
import { AgentsListModal } from './components/AgentsListModal';
import { TasksModal } from './components/TasksModal';
import { SettingsModal } from './components/SettingsModal';
import { HomeTeleportModal } from './components/HomeTeleportModal';
import { ProfileModal } from './components/ProfileModal';
import { FurnitureInspectModal } from './components/FurnitureInspectModal';
import { GlobalChatModal } from './components/GlobalChatModal';
import { MeetingRoomModal } from './components/MeetingRoomModal';
import { BOSModal, BOSModule } from './components/BOSModal';
import { TopBar } from './components/TopBar';
import { LeftNav, NavItemKey } from './components/LeftNav';
import { RightIntelligencePanel } from './components/RightIntelligencePanel';
import { BusinessCommandCentre } from './components/BusinessCommandCentre';
import { OpportunitiesView } from './components/OpportunitiesView';
import { FunnelsView } from './components/FunnelsView';
import { LeadsView } from './components/LeadsView';
import { MoneyView } from './components/MoneyView';
import { ApprovalPanel } from './components/ApprovalPanel';
import { AuthScreen } from './components/AuthScreen';
import { bosManager, BOSStateSnapshot } from './services/bosManager';
import { taskService, opportunityService, leadService, financeService } from './services/domain';
import { approvalService } from './services/execution/approvalService';
import { GameEngine } from './game/gameEngine';
import { INITIAL_AGENTS, INITIAL_TASKS } from './game/constants';
import { soundManager } from './services/soundManager';
import { eventBus } from './services/eventBus';
import {
  AIAgent,
  CharacterCustomization,
  ChatMessage,
  CompanyMetrics,
  FocusSessionState,
  TaskItem,
  WorldObject,
  ApprovalRequest,
} from './types';

// Web Audio synthesizer for pleasant focus chime & UI sound
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Ignore audio policy restrictions
    }
  }

  public playComplete() {
    try {
      const ctx = this.getContext();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.8);
      });
    } catch {
      // Ignore
    }
  }
}

const synth = new SoundSynthesizer();

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // World & Navigation States
  const [currentRoomName, setCurrentRoomName] = useState('Downtown Plaza');
  const [currentFloor, setCurrentFloor] = useState('Exterior Ground');
  const [zoomScale, setZoomScale] = useState(1.75);
  const [showPathDebug, setShowPathDebug] = useState(false);

  // Active UI Panels
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [activeNav, setActiveNav] = useState<NavItemKey>('world');
  const [showRightIntel, setShowRightIntel] = useState<boolean>(true);
  const [activeChatAgent, setActiveChatAgent] = useState<AIAgent | null>(null);
  const [activeInspectedObject, setActiveInspectedObject] = useState<WorldObject | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);

  // Synchronized BOS state
  const [bosState, setBosState] = useState<BOSStateSnapshot>(() => bosManager.getSnapshot());

  useEffect(() => {
    const unsub = bosManager.subscribe((snapshot) => {
      setBosState(snapshot);
    });
    return unsub;
  }, []);

  // Player State
  const [playerName, setPlayerName] = useState('Alex Founder');
  const [playerSpeed, setPlayerSpeed] = useState(3.2);
  const [customization, setCustomization] = useState<CharacterCustomization>({
    hairColor: '#451a03',
    hairStyle: 'spiky',
    skinColor: '#fcd34d',
    outfitColor: '#1e293b',
    pantColor: '#0f172a',
    accessory: 'tie',
  });

  // Business & Task Domain Layer Data
  const [tasks, setTasks] = useState<TaskItem[]>(() => taskService.getAll());

  useEffect(() => {
    const unsub = taskService.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
      if (engineRef.current) {
        engineRef.current.setTasks(updatedTasks);
      }
    });
    return unsub;
  }, []);
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [companyMetrics, setCompanyMetrics] = useState<CompanyMetrics>({
    mrr: 142500,
    monthlyGrowthRate: 28.4,
    activeUsers: 48200,
    retentionRate: 78.2,
    runwayMonths: 24,
    experimentsLive: 3,
    completedTasks: 1,
  });

  // Comms & Global Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'agent_nova',
      senderName: 'Nova-7',
      senderRole: 'Front Desk AI',
      text: 'Good morning, Alex! Welcome to Digital Growth World HQ. All systems operational.',
      timestamp: Date.now() - 3600000,
      isAgent: true,
      channel: 'world',
    },
    {
      id: 'msg-2',
      senderId: 'agent_maya',
      senderName: 'Maya Lin',
      senderRole: 'Growth Lead',
      text: 'Referral loop experiment is ready for review in Open Office!',
      timestamp: Date.now() - 1800000,
      isAgent: true,
      channel: 'world',
    },
  ]);

  // Focus Session State
  const [focusSession, setFocusSession] = useState<FocusSessionState>({
    isActive: false,
    partnerAgentId: 'agent_coach',
    goal: 'Ship core growth feature',
    durationMinutes: 25,
    secondsRemaining: 25 * 60,
    isPaused: false,
    soundEnabled: true,
  });

  const [focusStats, setFocusStats] = useState({
    dailyFocusTimeMinutes: 0,
    completedSessions: 0,
    currentStreak: 1,
  });

  const [focusSummaryData, setFocusSummaryData] = useState<{ duration: number; goal: string } | null>(null);

  // Build Mode State
  const [isBuildMode, setIsBuildMode] = useState(false);
  const [buildAction, setBuildAction] = useState<'place' | 'move' | 'rotate' | 'remove'>('place');
  const [buildSelectedType, setBuildSelectedType] = useState('desk');

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.buildMode.active = isBuildMode;
      engineRef.current.buildMode.action = buildAction;
      engineRef.current.buildMode.selectedType = buildSelectedType;
    }
  }, [isBuildMode, buildAction, buildSelectedType]);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(
    'Welcome! Walk with WASD or click anywhere. Press [E] near an AI agent to talk.'
  );

  // Hide notification after initial 8s
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Focus Session Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (focusSession.isActive && !focusSession.isPaused) {
      interval = setInterval(() => {
        setFocusSession((prev) => {
          // Half-way milestone
          if (prev.secondsRemaining === Math.floor((prev.durationMinutes * 60) / 2)) {
             setNotification(`Halfway there! Keep focusing on: ${prev.goal}`);
             if (engineRef.current) {
                engineRef.current.setAgentAnimation('agent_coach', 'work', {
                  type: 'sparkles',
                  text: 'You got this!',
                  expiresAt: Date.now() + 4000
                });
             }
          }

          if (prev.secondsRemaining <= 1) {
            // Finished!
            if (prev.soundEnabled) {
              synth.playComplete();
            }
            
            setFocusStats((stats) => ({
               dailyFocusTimeMinutes: stats.dailyFocusTimeMinutes + prev.durationMinutes,
               completedSessions: stats.completedSessions + 1,
               currentStreak: stats.currentStreak + 1,
            }));

            setFocusSummaryData({ duration: prev.durationMinutes, goal: prev.goal });

            if (engineRef.current) {
               engineRef.current.setAgentAnimation('agent_coach', 'happy', {
                  type: 'heart',
                  text: 'Great work!',
                  expiresAt: Date.now() + 6000
               });
               engineRef.current.player.animationState = 'happy';
               engineRef.current.player.emote = { type: 'sparkles', expiresAt: Date.now() + 4000 };
            }

            return {
              ...prev,
              isActive: false,
              secondsRemaining: 0,
            };
          }
          return {
            ...prev,
            secondsRemaining: prev.secondsRemaining - 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusSession.isActive, focusSession.isPaused, focusSession.soundEnabled]);

  // Sync activePanel with isBuildMode
  useEffect(() => {
    if (activePanel === 'build') {
      setIsBuildMode(true);
    } else if (isBuildMode) {
      setIsBuildMode(false);
    }
  }, [activePanel]);

  // Sync activeChatAgent with gameEngine interacting state
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.interactingAgentId = activeChatAgent ? activeChatAgent.id : null;
    }
  }, [activeChatAgent]);

  // Trigger Ambient Lo-Fi Synth Soundscape automatically when in 'World' mode
  useEffect(() => {
    const isWorld = isAuthenticated && activeNav === 'world';
    soundManager.setWorldMode(isWorld);
    return () => {
      if (!isWorld) {
        soundManager.setWorldMode(false);
      }
    };
  }, [isAuthenticated, activeNav]);

  // Event Handlers for Game Engine
  const handleAgentTalk = useCallback((agent: AIAgent) => {
    soundManager.playAgentCue(agent.id);
    setActiveChatAgent(agent);
  }, []);

  const handleObjectInteract = useCallback(
    (obj: WorldObject) => {
      // 1. Meeting Room interactive furniture (Presentation screen, agenda board, conference table)
      if (obj.data?.action === 'meeting_room' || obj.room === 'meeting_room') {
        setActivePanel('meeting');
        return;
      }

      // 2. Focus Centre interactive stations (Quiet desks, timer, focus stations) -> "Start Focus Session"
      if (obj.data?.action === 'start_focus') {
        setIsFocusModalOpen(true);
        return;
      }

      if (obj.data?.action === 'open_bos') {
        setActivePanel(obj.data.module as ActivePanel);
        return;
      }

      // 3. Strategy Office, Creative Studio, Sales Office, Operations Centre -> "Ask [Agent]"
      if (obj.data?.action === 'ask_agent' && obj.data?.targetAgentId) {
        const target = agents.find((a) => a.id === obj.data.targetAgentId);
        if (target) {
          handleAgentTalk(target);
          return;
        }
      }

      // Otherwise open detailed furniture inspector
      setActiveInspectedObject(obj);
    },
    [agents, handleAgentTalk]
  );

  const handleRoomChange = useCallback((roomName: string, floor: string) => {
    setCurrentRoomName(roomName);
    setCurrentFloor(floor);
  }, []);

  const handleInteractionBreak = useCallback(() => {
    setActiveChatAgent(null);
  }, []);

  // In-world Chat Message Broadcast
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      senderId: 'player_user',
      senderName: playerName,
      text,
      timestamp: Date.now(),
      isAgent: false,
      channel: 'world',
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Show speech bubble over player
    if (engineRef.current) {
      engineRef.current.player.emote = {
        type: 'speech',
        text,
        expiresAt: Date.now() + 4000,
      };
    }

    // Occasional AI reply in world chat if mentioning an agent
    const lower = text.toLowerCase();
    const mentionedAgent = agents.find((a) =>
      lower.includes(a.name.toLowerCase().split(' ')[0])
    );

    if (mentionedAgent) {
      setTimeout(() => {
        const agentReply: ChatMessage = {
          id: `reply-${Date.now()}`,
          senderId: mentionedAgent.id,
          senderName: mentionedAgent.name,
          senderRole: mentionedAgent.role,
          text: `Hey ${playerName}, I saw your note! Come by my workstation whenever you want to discuss this.`,
          timestamp: Date.now(),
          isAgent: true,
          channel: 'world',
        };
        setChatMessages((prev) => [...prev, agentReply]);
        if (engineRef.current) {
          const liveAgent = engineRef.current.agents.find(
            (a) => a.id === mentionedAgent.id
          );
          if (liveAgent) {
            liveAgent.emote = {
              type: 'speech',
              expiresAt: Date.now() + 4000,
            };
          }
        }
      }, 1200);
    }
  };

  // Focus Session Controls
  const handleStartFocusSession = (
    durationMinutes: number,
    partnerId: string,
    goal: string,
    sound: boolean
  ) => {
    setFocusSession({
      isActive: true,
      partnerAgentId: partnerId,
      goal,
      durationMinutes,
      secondsRemaining: durationMinutes * 60,
      isPaused: false,
      soundEnabled: sound,
    });

    if (sound) {
      synth.playChime();
    }

    const partner = agents.find((a) => a.id === partnerId);
    setNotification(
      `Focus Mode Active: ${durationMinutes}m sprint with ${partner?.name || 'Kai'}. Let's lock in!`
    );

    // If player has engine, teleport to Focus Room or sit next to partner
    if (engineRef.current && partner) {
      // Teleport player to partner's room
      engineRef.current.teleportTo(partner.position.x + 36, partner.position.y);
    }
  };

  const handleToggleFocusPause = () => {
    setFocusSession((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleEndFocusSession = () => {
    setFocusSession((prev) => ({
      ...prev,
      isActive: false,
      secondsRemaining: prev.durationMinutes * 60,
    }));
    setNotification('Focus session ended.');
  };

  // Toggle Task Completion via Domain Service
  const handleToggleTaskStatus = (taskId: string) => {
    const updated = taskService.toggleTaskStatus(taskId);
    if (updated && updated.status === 'done') {
      synth.playChime();
      setNotification(`Task Completed: "${updated.title}" (+${updated.xpReward} XP)`);
    }
  };

  // Add Task via Domain Service
  const handleAddTask = (newTask: Omit<TaskItem, 'id'>) => {
    const task = taskService.createTask(newTask);
    setNotification(`New Task added: "${task.title}"`);
  };

  // Teleport Player to location
  const handleTeleportToLocation = (x: number, y: number, roomId: string) => {
    if (engineRef.current) {
      engineRef.current.teleportTo(x, y, roomId);
      setNotification(`Teleported to ${roomId.replace('_', ' ').toUpperCase()}`);
    }
  };

  // Teleport to specific agent
  const handleTeleportToAgent = (agent: AIAgent) => {
    if (engineRef.current) {
      engineRef.current.teleportTo(agent.position.x, agent.position.y + 36, agent.assignedRoom);
      setNotification(`Navigated to ${agent.name}'s workstation`);
    }
  };

  // Toggle zoom
  const handleToggleZoom = () => {
    const zoomSteps = [1.25, 1.5, 1.75, 2.0];
    const nextIdx = (zoomSteps.indexOf(zoomScale) + 1) % zoomSteps.length;
    const nextZoom = zoomSteps[nextIdx];
    setZoomScale(nextZoom);
    if (engineRef.current) {
      engineRef.current.zoomScale = nextZoom;
    }
  };

  // Apply speed / buff
  const handleApplyBuff = (buffText: string) => {
    setNotification(`Buff Acquired: ${buffText}!`);
    synth.playChime();
    if (engineRef.current) {
      engineRef.current.player.speed = 4.5;
      setTimeout(() => {
        if (engineRef.current) {
          engineRef.current.player.speed = playerSpeed;
        }
      }, 15000);
    }
  };

  // Update customization
  const handleUpdateCustomization = (newCust: CharacterCustomization, newName: string) => {
    setCustomization(newCust);
    setPlayerName(newName);
    if (engineRef.current) {
      engineRef.current.player.customization = newCust;
      engineRef.current.player.name = newName;
    }
    setNotification('Player appearance updated.');
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;

  const handleNavSelect = (item: NavItemKey) => {
    setActiveNav(item);
    if (item === 'world') {
      setActivePanel(null);
    } else if (item === 'settings') {
      setActivePanel('settings');
    } else if (item === 'tasks') {
      setActivePanel('tasks');
    } else if (item === 'meeting') {
      setActivePanel('meeting');
    } else if (item === 'agents') {
      setActivePanel('agents');
    } else {
      setActivePanel(null);
    }
  };

  const handleOpenAgentChat = (agentId: string) => {
    const target = agents.find((a) => a.id === agentId);
    if (target) {
      handleAgentTalk(target);
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[var(--color-background)] font-sans select-none text-[var(--color-text-primary)]">
      {/* 1. FULL SCREEN GAME CANVAS LAYER */}
      <div className={`absolute inset-0 z-0 ${activeNav === 'world' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <GameCanvas
          engineRef={engineRef}
          tasks={tasks}
          onAgentTalk={handleAgentTalk}
          onObjectInteract={handleObjectInteract}
          onRoomChange={handleRoomChange}
          onInteractionBreak={handleInteractionBreak}
        />
      </div>

      {/* 2. GLOBAL UI OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none flex flex-col z-10">
        
        {/* Top Header */}
        <div className="pointer-events-auto shrink-0 z-50">
          <TopBar
            currentRoomName={currentRoomName}
            currentFloor={currentFloor}
            zoomScale={zoomScale}
            onToggleZoom={handleToggleZoom}
            onlineCount={1}
            onOpenSettings={() => setActivePanel('settings')}
            onOpenProfile={() => setActivePanel('profile')}
            isWorldView={activeNav === 'world'}
            onToggleWorldView={() => {
              if (activeNav === 'world') {
                setActiveNav('home');
              } else {
                setActiveNav('world');
              }
            }}
            isRightIntelOpen={showRightIntel}
            onToggleRightIntel={() => setShowRightIntel((prev) => !prev)}
            tasks={tasks}
            onOpenTasks={() => setActivePanel('tasks')}
            approvalsCount={bosState.pendingApprovals?.length || 0}
            onOpenApprovals={() => setShowApprovals(true)}
          />
        </div>
        
        <div className="flex-1 flex overflow-hidden relative w-full h-full">
           {/* Left Dock */}
           <div className="pointer-events-auto shrink-0 flex z-40">
             <LeftNav
               activeItem={activeNav}
               onSelect={handleNavSelect}
               pendingTasksCount={pendingTasksCount}
               unreadChatCount={0}
               activeOpportunitiesCount={(bosState?.opportunities || []).filter((o) => o.status === 'actionable').length}
             />
           </div>

           {/* Central Business Overlays */}
           {activeNav !== 'world' && (
             <div className="absolute inset-0 pointer-events-auto bg-[var(--color-background)]/90 backdrop-blur-md overflow-y-auto p-4 md:p-6 z-30 flex justify-center">
               <div className="w-full max-w-7xl relative">
              {activeNav === 'home' && (
                <BusinessCommandCentre
                  opportunities={bosState.opportunities}
                  funnels={bosState.funnels}
                  agents={agents}
                  nextBestAction={bosState.nextBestAction}
                  moneySummary={bosState.moneySummary}
                  signals={bosState.signals}
                  agentWorkQueues={bosState.agentWorkQueues}
                  onSelectOpportunity={(opp) => {
                    bosManager.updateOpportunityStatus(opp.id, 'actionable');
                    setNotification(`Opportunity activated: ${opp.name}`);
                  }}
                  onSelectFunnel={() => setActiveNav('funnels')}
                  onExecuteAction={(act) => {
                    synth.playChime();
                    setNotification(`Action initiated: ${act.title}`);
                  }}
                  onOpenMeetingRoom={() => setActivePanel('meeting')}
                  onOpenAgentChat={handleOpenAgentChat}
                />
              )}

              {activeNav === 'opportunities' && (
                <OpportunitiesView
                  opportunities={bosState.opportunities}
                  funnels={bosState.funnels}
                  onSelectOpportunity={(opp) => {
                    bosManager.updateOpportunityStatus(opp.id, 'actionable');
                    setNotification(`Opportunity status updated: ${opp.name}`);
                  }}
                  onSelectAgentToChat={handleOpenAgentChat}
                />
              )}

              {activeNav === 'funnels' && (
                <FunnelsView
                  funnels={bosState.funnels}
                  onSelectAgentToChat={handleOpenAgentChat}
                />
              )}

              {activeNav === 'leads' && (
                <LeadsView
                  leads={bosState.leads}
                  onAddLead={(lead) => {
                    bosManager.addLead(lead);
                    setNotification(`Lead created for ${lead.companyName}`);
                  }}
                  onSelectAgentToChat={handleOpenAgentChat}
                />
              )}

              {activeNav === 'money' && (
                <MoneyView
                  moneySummary={bosState.moneySummary}
                  onOpenMeeting={() => setActivePanel('meeting')}
                />
              )}

              {activeNav === 'marketing' && (
                <BOSModal module="marketing" onClose={() => setActiveNav('world')} />
              )}

              {activeNav === 'projects' && (
                <BOSModal module="projects" onClose={() => setActiveNav('world')} />
              )}

              {activeNav === 'analytics' && (
                <BOSModal module="analytics" onClose={() => setActiveNav('world')} />
              )}

              {activeNav === 'audits' && (
                <BOSModal module="audits" onClose={() => setActiveNav('world')} />
              )}
               </div>
             </div>
           )}

           {/* In-World HUD (Only when world is active) */}
           {activeNav === 'world' && (
             <>
               {!isBuildMode && (
                 <div className="absolute bottom-4 left-4 pointer-events-auto z-20">
                   <BottomChatBar
                     onSendMessage={handleSendMessage}
                     recentMessages={chatMessages}
                     onOpenFullChat={() => setActivePanel('chat')}
                     onTriggerEmote={(emote) => {
                       if (engineRef.current) {
                         engineRef.current.triggerEmote(emote);
                       }
                     }}
                   />
                 </div>
               )}
               {isBuildMode && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20">
                   <BuildModeToolbar
                     activeAction={buildAction}
                     selectedFurnitureType={buildSelectedType}
                     onActionChange={setBuildAction}
                     onSelectFurniture={setBuildSelectedType}
                     onClose={() => {
                       setIsBuildMode(false);
                       if (activePanel === 'build') setActivePanel(null);
                     }}
                   />
                 </div>
               )}
               <div className="absolute bottom-4 right-4 pointer-events-auto z-20">
                 <FocusSessionButton
                   focusSession={focusSession}
                   onOpenFocusModal={() => setIsFocusModalOpen(true)}
                   onTogglePause={handleToggleFocusPause}
                   onEndSession={handleEndFocusSession}
                 />
               </div>
             </>
           )}

           {/* Right Intelligence Matrix */}
           {showRightIntel && (
             <div className="absolute right-0 top-0 bottom-0 pointer-events-auto z-40 shadow-2xl">
               <RightIntelligencePanel
                 agents={agents}
                 nextBestAction={bosState.nextBestAction}
                 opportunities={bosState.opportunities}
                 onSelectAgent={handleAgentTalk}
                 onExecuteAction={(action) => {
                   synth.playChime();
                   setNotification(`Autonomous execution started: ${action.title}`);
                 }}
                 onSelectOpportunity={(opp) => {
                   setActiveNav('opportunities');
                   setNotification(`Viewing opportunity: ${opp.name}`);
                 }}
                 onClose={() => setShowRightIntel(false)}
               />
             </div>
           )}
        </div>
      </div>

      {/* 6. Notification Toast Banner */}
      {notification && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-900/95 border border-sky-500/50 shadow-2xl text-slate-100 text-xs px-4 py-2 rounded-full font-mono flex items-center gap-2 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* 7. Contextual AI Agent Chat Modal (Talk with Nova, Pixel, Closer, Orbit, Coach) */}
      {activeChatAgent && (
        <AgentChatModal
          agent={activeChatAgent}
          engine={engineRef.current}
          onClose={() => {
            if (engineRef.current && activeChatAgent) {
              engineRef.current.clearAgentAnimation(activeChatAgent.id);
            }
            setActiveChatAgent(null);
          }}
          onStartFocusWithAgent={(agent) => {
            setActiveChatAgent(null);
            handleStartFocusSession(25, agent.id, `Sprint with ${agent.name}`, true);
          }}
          onTaskCreated={(task) => {
            handleAddTask({
              ...task,
              status: 'in_progress',
              assignedToAgentId: activeChatAgent.id,
              priority: 'high',
              xpReward: 150,
            });
          }}
        />
      )}

      {/* 8. Interactive World Object Inspection Modal */}
      {activeInspectedObject && (
        <FurnitureInspectModal
          object={activeInspectedObject}
          onClose={() => setActiveInspectedObject(null)}
          onApplyBuff={handleApplyBuff}
          onAskAgent={(agentId) => {
            const target = agents.find((a) => a.id === agentId);
            if (target) {
              handleAgentTalk(target);
            }
          }}
          onStartFocus={(duration) => {
            handleStartFocusSession(
              duration || 25,
              'agent_coach',
              'Deep work sprint at Focus Centre',
              focusSession.soundEnabled
            );
          }}
          onOpenMeetingRoom={() => {
            setActivePanel('meeting');
          }}
        />
      )}

      {/* 9. Focus Session Modal (Body-doubling Pomodoro) */}
      {isFocusModalOpen && (
        <FocusSessionModal
          agents={agents}
          currentSession={focusSession}
          onStartSession={handleStartFocusSession}
          onClose={() => setIsFocusModalOpen(false)}
        />
      )}

      {/* 9b. Focus Summary Modal */}
      {focusSummaryData && (
         <FocusSummaryModal
            durationMinutes={focusSummaryData.duration}
            goal={focusSummaryData.goal}
            stats={focusStats}
            onClose={() => setFocusSummaryData(null)}
         />
      )}

      {/* 10. Multi-Agent Shared Meeting Room Workspace */}
      {activePanel === 'meeting' && (
        <MeetingRoomModal
          engine={engineRef.current}
          onClose={() => setActivePanel(null)}
          onTaskCreated={(task) => {
            handleAddTask({
              title: task.title,
              description: task.description,
              category: task.category,
              priority: 'high',
              status: 'todo',
              progress: 0,
              xpReward: 150,
            });
            synth.playChime();
          }}
        />
      )}

      {/* 11. Sidebar Modals */}
      {activePanel === 'agents' && (
        <AgentsListModal
          agents={agents}
          onSelectAgentToChat={handleAgentTalk}
          onTeleportToAgent={handleTeleportToAgent}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'tasks' && (
        <TasksModal
          tasks={tasks}
          agents={agents}
          onToggleTaskStatus={handleToggleTaskStatus}
          onAddTask={handleAddTask}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'opportunities' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl">
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition cursor-pointer z-10"
            >
              ✕
            </button>
            <OpportunitiesView
              opportunities={bosState.opportunities}
              funnels={bosState.funnels}
              onSelectOpportunity={(opp) => {
                bosManager.updateOpportunityStatus(opp.id, 'actionable');
                setNotification(`Opportunity status updated: ${opp.name}`);
              }}
              onSelectAgentToChat={handleOpenAgentChat}
            />
          </div>
        </div>
      )}

      {activePanel === 'funnels' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl">
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition cursor-pointer z-10"
            >
              ✕
            </button>
            <FunnelsView
              funnels={bosState.funnels}
              onSelectAgentToChat={handleOpenAgentChat}
            />
          </div>
        </div>
      )}

      {['clients', 'audits', 'proposals', 'projects', 'leads', 'marketing', 'analytics'].includes(activePanel as string) && (
        <BOSModal module={activePanel as BOSModule} onClose={() => setActivePanel(null)} />
      )}

      {activePanel === 'home' && (
        <HomeTeleportModal
          currentRoomId={engineRef.current?.currentRoomId || 'downtown'}
          onTeleportToLocation={handleTeleportToLocation}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'profile' && (
        <ProfileModal
          customization={customization}
          playerName={playerName}
          onUpdateCustomization={handleUpdateCustomization}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'settings' && (
        <SettingsModal
          zoomScale={zoomScale}
          onSetZoomScale={(scale) => {
            setZoomScale(scale);
            if (engineRef.current) engineRef.current.zoomScale = scale;
          }}
          playerSpeed={playerSpeed}
          onSetPlayerSpeed={(speed) => {
            setPlayerSpeed(speed);
            if (engineRef.current) engineRef.current.player.speed = speed;
          }}
          soundEnabled={focusSession.soundEnabled}
          onToggleSound={() =>
            setFocusSession((prev) => ({
              ...prev,
              soundEnabled: !prev.soundEnabled,
            }))
          }
          showPathDebug={showPathDebug}
          onTogglePathDebug={() => {
            setShowPathDebug((prev) => {
              const next = !prev;
              if (engineRef.current) engineRef.current.showPathDebug = next;
              return next;
            });
          }}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'chat' && (
        <GlobalChatModal
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setActivePanel(null)}
        />
      )}

      {showApprovals && (
        <ApprovalPanel
          approvals={bosState.pendingApprovals}
          onClose={() => setShowApprovals(false)}
          onApprove={(id) => approvalService.approve(id)}
          onReject={(id) => approvalService.reject(id)}
        />
      )}
    </main>
  );
}
