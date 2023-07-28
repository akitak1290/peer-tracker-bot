import { fetchUserPeer } from '../commands/liveMatch.js';
import { ErrorOpenDotaApi } from '../utils/const.js';
import { parseDataToEmbed } from '../commands/liveMatch.js';

// ! If fetch fails because of operation error or fetch error,
// ! all api tests will fail... make a test for that?

describe('opendota api', () => {
	test('fetch user\'s peers invalid user id', async () => {
		// make sure that error handling is done by returning
		// the error and not by throwing an Error
		expect.assertions(1);

		const data = await fetchUserPeer();
		expect(data.error).toMatch(ErrorOpenDotaApi[0]);
	});

	test('fetch user\'s peers no peer found for ${peerid}', async () => {
		expect.assertions(1);

		const data = await fetchUserPeer(94054712, 66858751231);
		expect(data).toStrictEqual({});
	}, 8 * 1000);

	test('fetch user\'s peers successful', async () => {
		expect.assertions(1);

		const data = await fetchUserPeer(94054712, 66858751);
		expect(data.matchesUrl).toMatch('https://www.opendota.com/players/94054712/matches?included_account_id=66858751');
	});
});

describe('live match data parser', () => {
	test('parse live match data succesful', async () => {
		expect.assertions(1);
		// TODO: use __mock__ instead
		// mock data from public dota matches
		const mockData = {
			team1: [
				{
					'accountid': 94054712,
					'playerid': 0,
					'name': 'Topson',
					'team': 2,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 66858751,
					'playerid': 1,
					'name': 'zoge',
					'team': 2,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 107746371,
					'playerid': 2,
					'name': 'attack hero!',
					'team': 2,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 93526520,
					'playerid': 3,
					'name': 'в среду вечеромв среду вечером',
					'team': 2,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 345509021,
					'playerid': 4,
					'name': 'WhaT\'S UP',
					'team': 2,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
			],
			team2: [
				{
					'accountid': 5150808,
					'playerid': 5,
					'name': '2931',
					'team': 3,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 195539164,
					'playerid': 6,
					'name': 'SelivanSelivan',
					'team': 3,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 156352095,
					'playerid': 7,
					'name': '业报',
					'team': 3,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 196601118,
					'playerid': 8,
					'name': '196601118',
					'team': 3,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
				{
					'accountid': 361192969,
					'playerid': 9,
					'name': 'TOMMY LI',
					'team': 3,
					'heroid': 0,
					'level': 0,
					'kill_count': 0,
					'death_count': 0,
					'assists_count': 0,
					'denies_count': 0,
					'lh_count': 0,
					'gold': 0,
					'x': 0,
					'y': 0,
					'net_worth': 0,
				},
			],
		};

		const embed = await parseDataToEmbed(94054712, mockData);
		expect(embed.data.fields[embed.data.fields.length - 1].value)
			.toMatch('https://www.opendota.com/players/94054712/matches?included_account_id=66858751');
	});
});
