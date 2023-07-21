import d2gsi from 'dota2-gsi';
const server = new d2gsi();

// let client_store;
// const player_ids = [];

server.events.on('newclient', function(client) {
	console.log('New client connection, IP address: ' + client.ip);
	if (client.auth && client.auth.token) {
		console.log('Auth token: ' + client.auth.token);
	}
	else {
		console.log('No Auth token');
	}

	client.on('player:activity', function(activity) {
		if (activity == 'playing') console.log('Game started!');
	});
	client.on('hero:level', function(level) {
		console.log('Now level ' + level);
	});
	client.on('abilities:ability0:can_cast', function(can_cast) {
		if (can_cast) console.log('Ability0 off cooldown!');
	});
});

export default server;