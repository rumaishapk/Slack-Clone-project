import { useChannelStateContext } from "stream-chat-react";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";
import {
  HashIcon,
  LockIcon,
  PinIcon,
  Trash2Icon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMassagesModal";
import InviteModal from "./inviteModal";
import { deleteChannel as deleteChannelRequest } from "../lib/api";
import { isDirectMessageChannel } from "../lib/channel";

const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [, setSearchParams] = useSearchParams();

  const memberCount = Object.keys(channel.state.members).length;

  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const otherUser = Object.values(channel.state.members).find(
    (member) => member.user.id !== user.id,
  );

  const isDM = isDirectMessageChannel(channel);

  const handleShowPinned = async () => {
    const channelState = await channel.query();
    setPinnedMessages(channelState.pinned_messages);
    setShowPinnedMessages(true);
  };

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      await channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
    }
  };

  const handleDeleteChannel = async () => {
    if (!channel?.id || isDM || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      const authToken = await getToken();

      if (!authToken) {
        throw new Error("Failed to get auth token.");
      }

      await deleteChannelRequest(channel.id, authToken);
      await channel.stopWatching().catch(() => {});

      setSearchParams({});
      toast.success(`Channel "${channel.data?.name || channel.id}" deleted.`);
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to delete channel.";

      console.error("Error deleting channel", error);
      toast.error(message);
      Sentry.captureException(error, {
        tags: { component: "CustomChannelHeader" },
        extra: {
          context: "delete_channel",
          channelId: channel?.id,
        },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const channelName = isDM
    ? otherUser?.user?.name || otherUser?.user?.id
    : channel.data?.name || channel.data?.id;

  return (
    <div className="h-14 border-b border-gray-200 bg-white px-4">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          {channel.data?.private ? (
            <LockIcon className="size-4 text-[#616061]" />
          ) : (
            <HashIcon className="size-4 text-[#616061]" />
          )}
          {isDM && otherUser?.user?.image && (
            <img
              src={otherUser.user.image}
              alt={otherUser.user.name || otherUser.user.id}
              className="size-7 rounded-full object-cover mr-1"
            />
          )}
          <span className="font-medium text-[#1D1C1D]">
            {channelName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-[#F8F8F8]"
            onClick={() => setShowMembers(true)}
          >
            <UsersIcon className="size-5 text-[#616061]" />
            <span className="text-sm text-[#616061]">{memberCount}</span>
          </button>

          <button
            className="rounded p-1 hover:bg-[#F8F8F8]"
            onClick={handleVideoCall}
            title="Start video call"
          >
            <VideoIcon className="size-5 text-[#1264A3]" />
          </button>

          {channel.data?.private && (
            <button
              className="btn btn-primary"
              onClick={() => setShowInvite(true)}
            >
              Invite
            </button>
          )}

          <button
            className="rounded p-1 hover:bg-[#F8F8F8]"
            onClick={handleShowPinned}
            title="Show pinned messages"
          >
            <PinIcon className="size-4 text-[#616061]" />
          </button>

          {!isDM && (
            <button
              className="rounded p-1 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleDeleteChannel}
              title="Delete channel"
              disabled={isDeleting}
            >
              <Trash2Icon className="size-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      {showMembers && (
        <MembersModal
          members={Object.values(channel.state.members)}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showPinnedMessages && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setShowPinnedMessages(false)}
        />
      )}

      {showInvite && (
        <InviteModal channel={channel} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
};

export default CustomChannelHeader;
