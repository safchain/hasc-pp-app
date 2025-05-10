import { writable } from 'svelte/store';
import { WritableTokenStore } from '$lib/store/auth';
import { PUBLIC_WS_ENDPOINT } from '$env/static/public';
import { PUBLIC_API_ENDPOINT } from '$env/static/public';

export class Path {
	NodeName: string;
	EndpointId: number;
	ClusterName: string;
	Name: string;

	constructor(NodeName: string, EndpointId: number, ClusterName: string, Name: string) {
		this.NodeName = NodeName;
		this.EndpointId = EndpointId;
		this.ClusterName = ClusterName;
		this.Name = Name;
	}

	toString(): string {
		return `${this.NodeName}/${this.EndpointId}/${this.ClusterName}/${this.Name}`;
	}
}

export interface Value {
	Type: string;
	Value: string;
}

interface Data {
	Id: number;
	NodeName: string;
	NodeId: number;
	EndpointId: number;
	ClusterName: string;
	ClusterId: number;
	Name: string;
	Type: string;
	Value: string;
	Date: string;
}

interface Data extends Path, Value { }

type State = Map<string, Value>;

let token = '';

WritableTokenStore.subscribe((t) => {
	token = t;
});

export const State = writable<State>(new Map());
export const Error = writable<string>('');

export let NodeIds = new Map<string, number>;

const updateState = (data: Data) => {
	let path = new Path(data.NodeName, data.EndpointId, data.ClusterName, data.Name);

	let value: Value = {
		Type: data.Type,
		Value: data.Value,
	};

	State.update((state) => {
		state.set(path.toString(), value);
		return state;
	});

	NodeIds.set(data.NodeName, data.NodeId);
};

let lastUpdate = new Date();

export const Connect = () => {
	fetch(`${PUBLIC_API_ENDPOINT}/api/attributes`, {
		headers: new Headers({
			'Authorization': `Bearer ${token}`,
		})
	}).then((res) => {
		if (res.ok) {
			return res.json().then((arr: Data[]) => {
				arr.forEach(updateState);
			});
		}
	});

	let ws = new WebSocket(`${PUBLIC_WS_ENDPOINT}/ws?token=${token}`);

	ws.addEventListener('message', (message: any) => {
		lastUpdate = new Date();

		updateState(JSON.parse(message.data));
	});

	ws.addEventListener('open', () => {
		Error.update((error) => {
			error = '';
			return error;
		});
	});

	ws.addEventListener('error', (err: any) => {
		Error.update((error) => {
			error = err;
			return error;
		});
	});

	ws.onclose = function () {
		setTimeout(() => {
			ws = new WebSocket(`${PUBLIC_WS_ENDPOINT}/ws?token=${token}`);
		}, 1000)
	}

	document.addEventListener("visibilitychange", function (e) {
		ws = new WebSocket(`${PUBLIC_WS_ENDPOINT}/ws?token=${token}`);
	});
};
