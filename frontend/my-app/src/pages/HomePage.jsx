import { UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { PlusIcon } from "lucide-react";
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

import CreateChannelModel from "../components/CreateChannelModel";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();
  const channelId = searchParams.get("channel");
  const activeChannel =
    chatClient && channelId
      ? chatClient.channel("messaging", channelId)
      : null;
  const filters = chatClient?.userID
    ? { type: "messaging", members: { $in: [chatClient.userID] } }
    : { type: "messaging" };
  const sort = { last_message_at: -1 };
  const options = { limit: 20 };

  if (error) return <p>{error.message || "Something went wrong..."}</p>;
  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="chat-wrapper">
      <Chat client={chatClient}>
        <div className="chat-container">
          <div className="str_chat___channel-list">
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
                  options={options}
                  sort={sort}
                  onSelect={(channel) => {
                    if (channel?.id) {
                      setSearchParams({ channel: channel.id });
                    }
                  }}
                />
              </div>
            </div>
          </div>
          {/* //right container */}
          <div className="chat-main">
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
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
          <CreateChannelModel onClose={() => setIsCreateModalOpen(false)} />
        )}
      </Chat>
    </div>
  );
};

export default HomePage;
