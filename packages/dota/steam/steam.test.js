import steamClientSingleton from './index.js';
import { ErrorDotaClient } from '../utils/const.js';

test('testing game coordinator', async () => {
	steamClientSingleton.connect();

	try {
		await steamClientSingleton.requestSpectateFriendGame(12131);
	}
	catch (error) {
		expect(error).toMatch(ErrorDotaClient[1]);
		steamClientSingleton.exit();
	}
// the request will fail after 190 seconds and 9 attempts
});

