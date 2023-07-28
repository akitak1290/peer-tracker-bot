import { fetchUserPeer } from './liveMatch';
import { ErrorOpenDotaApi } from '../utils/const';

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
	});

	test('fetch user\'s peers successful', async () => {
		expect.assertions(1);

		const data = await fetchUserPeer(94054712, 66858751);
		expect(data.matches).toMatch('https://www.opendota.com/players/94054712/matches?included_account_id=66858751');
	});
});
