<script lang="ts">
	import Logo from '$lib/img/hasc.png';
	import Database from '$lib/img/database.svg';
	import ArrowLeftRigth from '$lib/img/arrow-left-right.svg';
	import Microchip from '$lib/img/microchip.svg';
	import Trash from '$lib/img/trash.svg';
	import Globle from '$lib/img/globe.svg';
	import Matter from '$lib/img/matter.svg';
	import { WritableTokenStore } from '$lib/store/auth';
	import { PUBLIC_API_ENDPOINT } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	interface Device {
		Id: number;
		Version: number;
		VendorId: number;
		ProductId: number;
		Discriminator: number | null;
		Name: string;
		Type: string;
		Date: string;
	}

	let devices: Device[] = [];
	let token = '';
	let error = false;

	WritableTokenStore.subscribe((t) => {
		token = t;
	});

	const backToLogin = () => {
		setTimeout(() => {
			goto(base + '/login');
		}, 2000);
	};

	onMount(async () => {
		listNodes();
	});

	const listNodes = () => {
		fetch(`${PUBLIC_API_ENDPOINT}/api/nodes`, {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + token
			}
		})
			.then((res) => {
				if (!res.ok) {
					error = true;
					backToLogin();
				} else {
					res.json().then((data) => {
						devices = data;
					});
				}
			})
			.catch((err) => {
				console.log(err);
				error = true;
				backToLogin();
			});
	};

	const deleteNode = (id: number) => {
		if (!confirm('confirm deletion ?')) {
			return;
		}

		fetch(`${PUBLIC_API_ENDPOINT}/api/nodes/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: 'Bearer ' + token
			}
		})
			.then((res) => {
				if (!res.ok) {
					error = true;
					backToLogin();
				} else {
					listNodes();
				}
			})
			.catch(() => {
				error = true;
				backToLogin();
			});
	};

	const addNode = () => {
		goto(base + '/add');
	};
</script>

<main>
	<div>
		<img src={Logo} class="logo" alt="Logo" />
	</div>
	<h5>Devices</h5>

	<div class="container">
		<div class="row inline">
			<div class="one-quarter column icon">
				<img src={Database} class="picto" alt="Database" />
			</div>
			<div class="one-quarter column icon">
				<img src={ArrowLeftRigth} class="picto" alt="ArrowLeftRight" />
			</div>
			<div class="one-quarter column icon">
				<img src={Microchip} class="picto" alt="Microchip" />
			</div>
		</div>
	</div>

	<hr class="hr" />

	<div class="card">
		{#if error}
			<div class="error">
				Unable to get devices<br />please verify Username/Password
			</div>
		{/if}

		{#if devices.length}
			<div class="container table">
				<div class="row">
					<div class="one columns column-align"><strong>ID</strong></div>
					<div class="three columns column-align"><strong>Name</strong></div>
					<div class="three columns column-align"><strong>Product</strong></div>
					<div class="three columns column-align"><strong>Type</strong></div>
				</div>

				{#each devices as device}
					<div class="row">
						<div class="one columns column-align">{device.Id}</div>
						<div class="three columns column-align">{device.Name}</div>
						<div class="three columns column-align">{device.VendorId}/{device.ProductId}</div>
						<div class="three columns column-align">
							{#if device.Type === 'webhook'}
								<img src={Globle} class="picto-tiny" alt="Globle" />
								hook
							{:else}
								<img src={Matter} class="picto-tiny" alt="Matter" />
								matter
							{/if}
						</div>
						<div class="one column column-align">
							<button class="img-btn" on:click={() => deleteNode(device.Id)}>
								<img src={Trash} class="picto-small" alt="Trash" style="padding-bottom: 2px" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<div class="btn">
			<input class="button-primary input" type="submit" value="Add" on:click={() => addNode()} />
		</div>
	</div>
</main>
