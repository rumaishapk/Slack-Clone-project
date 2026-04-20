import { UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { HashIcon, PlusIcon, UsersIcon } from "lucide-react";
import { useStreamChat } from "../Hooks/useStreamChat";
import PageLoader from "../components/PageLoader";
import "../styles/stream-chat-theme.css";
import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();
  const channelId = searchParams.get("channel");
  const activeChannel =
    chatClient && channelId ? chatClient.channel("messaging", channelId) : null;
  const filters = chatClient?.userID
    ? { type: "messaging", members: { $in: [chatClient.userID] } }
    : { type: "messaging" };
  const sort = { last_message_at: -1 };

  if (error) return <p>{error.message || "Something went wrong..."}</p>;
  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="chat-wrapper">
      <Chat client={chatClient}>
        <div className="chat-container">
          <div className="str-chat__channel-list">
            <div className="team-channel-list">
              <div className="team-channel-list__header gap-4">
                <div className="brand-container">
                  <img src="/logo.png" alt="Logo" className="brand-logo" />
                  <span className="brand-name">Slap</span>
                </div>
                <div className="user-button-wrapper">
                  <UserButton />
                </div>
              </div>
              <div className="team-channel-list__content">
                <div className="create-channel-section">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="create-channel-btn"
                  >
                    <PlusIcon className="size-4" />
                    <span>Create Channel</span>
                  </button>
                </div>
                <ChannelList
                  filters={filters}
                  options={{ state: true, watch: true }}
                  sort={sort}
                  Preview={({ channel }) => (
                    <CustomChannelPreview
                      channel={channel}
                      activeChannel={activeChannel}
                      setActiveChannel={(nextChannel) =>
                        setSearchParams({ channel: nextChannel.id })
                      }
                    />
                  )}
                  List={({ children, loading, error }) => (
                    <div className="channel-sections">
                      <div className="section-header">
                        <div className="section-title">
                          <HashIcon className="size-4" />
                          <span>Channels</span>
                        </div>
                      </div>

                      {loading && (
                        <div className="loading-message">
                          Loading channels...
                        </div>
                      )}
                      {error && (
                        <div className="error-message">
                          Error loading channels
                        </div>
                      )}

                      <div className="channels-list">{children}</div>

                      <div className="section-header direct-messages">
                        <div className="section-title">
                          <UsersIcon className="size-4" />
                          <span>Direct Messages</span>
                        </div>
                      </div>
                      <UsersList activeChannel={activeChannel} />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
          {/* //right container */}
          <div className="chat-main">
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  <CustomChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Select a channel to start chatting.
              </div>
            )}
          </div>
        </div>
        {isCreateModalOpen && (
          <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />
        )}
      </Chat>
    </div>
  );
};

export default HomePage;
