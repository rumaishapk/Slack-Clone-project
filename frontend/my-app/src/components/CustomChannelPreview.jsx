import { HashIcon } from "lucide-react";

const CustomChannelPreview = ({
  channel,
  setActiveChannel,
  activeChannel,
}) => {
  const isActive = activeChannel?.id === channel.id;
  const isDm =
    channel.data?.member_count === 2 && channel.data?.id?.includes("user_");

  if (isDm) return null;

  const unreadCount =
    typeof channel.countUnread === "function" ? channel.countUnread() : 0;
  const channelName = channel.data?.name || channel.data?.id || "Untitled";

  return (
    <div>
      <button
        type="button"
        onClick={() => setActiveChannel(channel)}
        className={`str-chat__channel-preview-messenger transition-colors flex items-center w-full text-left px-4 py-2 rounded-lg mb-1 font-medium hover:bg-blue-50/80 min-h-9 ${
          isActive
            ? "str-chat__channel-preview-messenger--active"
            : ""
        }`}
      >
        <HashIcon className="w-4 h-4 text-[#9b9b9b] mr-2" />
        <span className="str-chat__channel-preview-messenger-name flex-1">
          {channelName}
        </span>
        {unreadCount > 0 && (
          <span className="flex items-center justify-center ml-2 size-4 text-xs rounded-full bg-red-500 ">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default CustomChannelPreview;
