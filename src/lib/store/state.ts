import { writable } from 'svelte/store';
import { WritableTokenStore } from '$lib/store/auth';
import { PUBLIC_WS_ENDPOINT } from '$env/static/public';

export class Path {
	NodeId: number;
	EndpointId: number;
	ClusterId: number;
	AttributeId: number;

	constructor(NodeId: number, EndpointId: number, ClusterId: number, AttributeId: number) {
		this.NodeId = NodeId;
		this.EndpointId = EndpointId;
		this.ClusterId = ClusterId;
		this.AttributeId = AttributeId;
	}

	toString(): string {
		return `${this.NodeId}/${this.EndpointId}/${this.ClusterId}/${this.AttributeId}`;
	}
}

export interface Value {
	Type: string;
	Value: string;
	Date: string;
}

interface Data {
	NodeId: number;
	EndpointId: number;
	ClusterId: number;
	Id: number;
	Type: string;
	Value: string;
	Date: string;
}

interface Data extends Path, Value {}

type State = Map<string, Value>;

let token = '';

WritableTokenStore.subscribe((t) => {
	token = t;
});

export const State = writable<State>(new Map());
export const Error = writable<string>('');

export const Connect = () => {
	const ws = new WebSocket(`${PUBLIC_WS_ENDPOINT}/ws?token=${token}`);

	ws.addEventListener('message', (message: any) => {
		const data: Data = JSON.parse(message.data);
		let path = new Path(data.NodeId, data.EndpointId, data.ClusterId, data.Id);

		let value: Value = {
			Type: data.Type,
			Value: data.Value,
			Date: data.Date
		};

		State.update((state) => {
			state.set(path.toString(), value);
			return state;
		});
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
};
