// from protobuf https://github.com/SteamDatabase/Protobufs/blob/master/dota2/dota_gcmessages_client_watch.proto
export const EWatchLiveResult = {
	0: 'SUCCESS',
	1: 'ERROR_GENERIC',
	2: 'ERROR_NO_PLUS',
	3: 'ERROR_NOT_FRIENDS',
	4: 'ERROR_LOBBY_NOT_FOUND',
	5: 'ERROR_SPECTATOR_IN_A_LOBBY',
	6: 'ERROR_LOBBY_IS_LAN',
	7: 'ERROR_WRONG_LOBBY_TYPE',
	8: 'ERROR_WRONG_LOBBY_STATE',
	9: 'ERROR_PLAYER_NOT_PLAYER',
	10: 'ERROR_TOO_MANY_SPECTATOR',
	11: 'ERROR_SPECTATOR_SWITCHED_TEAMS',
	12: 'ERROR_FRIENDS_ON_BOTH_SIDES',
	13: 'ERROR_SPECTATOR_IN_THIS_LOBBY',
	14: 'ERROR_LOBBY_IS_LEAGUE',
};

export const ErrorDotaClient = {
	0: 'failed to connect to game coordinator',
	1: 'k_EMsgGCSpectateFriendGame request failed, match server not found'
};