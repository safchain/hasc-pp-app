<script lang="ts">
	import Logo from '$lib/img/hasc.png';
	import User from '$lib/img/user.svg';
	import Ellipsis from '$lib/img/ellipsis.svg';
	import Login from '$lib/img/login.svg';
	import { WritableTokenStore } from '$lib/store/auth';
	import { PUBLIC_API_ENDPOINT } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let username = '';
	let password = '';
	let error = false;

	onMount(async () => {
		WritableTokenStore.set('');
	});

	const login = async () => {
		fetch(`${PUBLIC_API_ENDPOINT}/api/users/signin`, {
			method: 'POST',
			body: JSON.stringify({
				Username: username,
				Password: password
			})
		})
			.then((res) => {
				if (!res.ok) {
					error = true;
				} else {
					res.json().then((data) => {
						WritableTokenStore.set(data.Token);
						goto(base + '/list');
					});
				}
			})
			.catch(() => {
				error = true;
			});
	};
</script>

<main>
	<div>
		<img src={Logo} class="logo" alt="Logo" />
	</div>
	<h5>Login</h5>

	<div class="container">
		<div class="row inline">
			<div class="one-third column icon">
				<img src={User} class="picto" alt="User" />
			</div>
			<div class="one-third column icon">
				<img src={Ellipsis} class="picto" alt="Ellipsis" />
			</div>
			<div class="one-third column icon">
				<img src={Login} class="picto" alt="Login" />
			</div>
		</div>
	</div>

	<hr class="hr" />

	<div class="card">
		{#if error}
			<div class="error">
				Unable to connect<br />please verify Username/Password
			</div>
		{/if}

		<form class="form">
			<label for="username">Username :</label>
			<input class="input" type="text" placeholder="username" id="username" bind:value={username} />
			<label for="password">Password :</label>
			<input
				class="input"
				type="password"
				placeholder="password123"
				id="password"
				bind:value={password}
			/>
			<div class="btn">
				<input class="button-primary input" type="submit" value="Submit" on:click={login} />
			</div>
		</form>
	</div>
</main>
