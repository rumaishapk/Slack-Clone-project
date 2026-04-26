import { HashIcon } from "lucide-react";
import { isDirectMessageChannel } from "../lib/channel";

const CustomChannelPreview = ({
  channel,
  setActiveChannel,
  activeChannel,
}) => {
  const isActive = activeChannel?.id === channel.id;
  const isDm = isDirectMessageChannel(channel);

  if (isDm) return null;

  const unreadCount =
    typeof channel.countUnread === "function" ? channel.countUnread() : 0;
  const channelName = channel.data?.name || channel.data?.id || "Untitled";
//    const unreadCount = channel.countUnread();

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
