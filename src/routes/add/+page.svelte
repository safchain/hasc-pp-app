<script lang="ts">
	import Logo from '$lib/img/hasc.png';
	import QRCode from '$lib/img/qrcode.svg';
	import ArrowLeftRigth from '$lib/img/arrow-left-right.svg';
	import Microchip from '$lib/img/microchip.svg';
	import { WritableTokenStore } from '$lib/store/auth';
	import { PUBLIC_API_ENDPOINT } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import QrScanner from 'qr-scanner';
	import { onMount } from 'svelte';
	import { BackToLogin } from '$lib/route/route';
	import Switch from './Switch.svelte';

	let token = '';
	let netError = false;
	let qrcodeError = false;
	let video: HTMLVideoElement;
	let qrcode = '';
	let name = '';
	let scanner: QrScanner;
	let loading = false;
	let ble = false;

	WritableTokenStore.subscribe((t) => {
		token = t;
	});

	const backToList = () => {
		setTimeout(() => {
			goto(base + '/list');
		}, 2000);
	};

	onMount(async () => {
		scanner = new QrScanner(
			video,
			(result: QrScanner.ScanResult) => {
				qrcode = result.data;
			},
			{
				onDecodeError: (error: string) => {},
				highlightScanRegion: true,
				highlightCodeOutline: true
			}
		);
		scanner.start();
	});

	const addNode = () => {
		qrcodeError = false;
		netError = false;

		loading = true;

		fetch(`${PUBLIC_API_ENDPOINT}/api/nodes/commission`, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token
			},
			body: JSON.stringify({
				QRCode: qrcode,
				Name: name,
				BLE: ble
			})
		})
			.then((res) => {
				if (!res.ok) {
					qrcodeError = true;
					if (res.status === 403) {
						BackToLogin();
					}
					loading = false;
				} else {
					backToList();
				}
				scanner._updateOverlay();
			})
			.catch(() => {
				netError = true;
				BackToLogin();
				scanner._updateOverlay();
			});
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
				<img src={QRCode} class="picto" alt="QRcode" />
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
		{#if loading}
			<div class="loading">Loading&#8230;</div>
		{/if}

		{#if netError}
			<div class="error">
				Unable to add device<br />please verify Username/Password
			</div>
		{/if}
		{#if qrcodeError}
			<div class="error">
				Unable to add device<br />invalid qrcode
			</div>
		{/if}

		<div>
			<video bind:this={video} width="150px" height="150px" />
		</div>

		<form class="form">
			<label for="qrcode">QRCode :</label>
			<input class="input" type="text" placeholder="QRCode" id="qrcode" bind:value={qrcode} />
			<label for="name">Device name :</label>
			<input class="input" type="text" placeholder="Device name" id="name" bind:value={name} />
			<Switch bind:checked={ble} label="BLE :" />
			<div class="btn">
				<input class="button-primary input" type="submit" value="Add" on:click={addNode} />
			</div>
		</form>
	</div>
</main>

<style>
	video {
		object-fit: cover;
		border-radius: 5px;
		margin-bottom: 20px;
	}
</style>
