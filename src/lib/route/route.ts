import { goto } from '$app/navigation';
import { base } from '$app/paths';

export const BackToLogin = () => {
	setTimeout(() => {
		goto(base + '/login');
	}, 2000);
};
