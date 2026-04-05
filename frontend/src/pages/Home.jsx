import useChat from '../hooks/useChat.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatContainer from '../components/ChatContainer.jsx'
import ChatInput from '../components/ChatInput.jsx'

export default function Home() {
  const {
    sessions,
    activeSession,
    messages,
    isLoading,
    bottomRef,
    selectedModel,
    setSelectedModel,
    selectedMode,
    setSelectedMode,
    startNewSession,
    switchSession,
    deleteSession,
    renameSession,
    sendMessage,
  } = useChat()

  return (
    <div className="flex h-full overflow-hidden bg-surface">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.id ?? null}
        onNewChat={startNewSession}
        onSwitchSession={switchSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          bottomRef={bottomRef}
          onSend={sendMessage}
        />
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />
      </div>
    </div>
  )
}