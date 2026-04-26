export const isDirectMessageChannel = (channel) => {
  const memberCount =
    channel?.data?.member_count ?? Object.keys(channel?.state?.members ?? {}).length;
  const hasExplicitDmFlag = channel?.data?.isDirectMessage === true;
  const looksLikeLegacyDm =
    memberCount === 2 &&
    !channel?.data?.name &&
    !channel?.data?.description &&
    !channel?.data?.created_by_id;

  return hasExplicitDmFlag || looksLikeLegacyDm || channel?.data?.distinct === true;
};
