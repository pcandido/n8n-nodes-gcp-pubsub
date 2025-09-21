import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow'
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow'
import { PubSub } from '@google-cloud/pubsub'

export class GcpPubSubPublisher implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GcpPubSubPublisher',
		name: 'gcpPubSubPublisher',
		icon: { light: 'file:GcpPubSubPublisher.svg', dark: 'file:GcpPubSubPublisher.svg' },
		group: ['output'],
		version: 1,
		description: 'Publishes messages to a Google Pub/Sub topic',
		defaults: {
			name: 'GCP Pub/Sub Publisher',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Topic Name',
				name: 'topicName',
				type: 'string',
				default: '',
				required: true,
			},
		],
		credentials: [
			{
				name: 'gcpServiceAccountApi',
				required: true,
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()

		const projectId = this.getNodeParameter('projectId', 0) as string
		const topicName = this.getNodeParameter('topicName', 0) as string
		if (!projectId || !topicName) {
			throw new NodeOperationError(this.getNode(), 'Project ID and Topic Name are required')
		}

		let serviceAccount
		try {
			const credentials = await this.getCredentials('gcpServiceAccountApi')
			serviceAccount = JSON.parse(credentials['serviceAccountJson'] as string)
		} catch {
			throw new NodeOperationError(this.getNode(), 'Failed to parse Service Account JSON')
		}

		const pubsub = new PubSub({
			projectId,
			credentials: serviceAccount,
		})
		const topic = pubsub.topic(topicName)

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item: INodeExecutionData = items[itemIndex]
			try {
				const messageId = await topic.publishMessage({ json: item })
				item.json.result = { success: true, messageId }
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex })
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex
						throw error
					}
					throw new NodeOperationError(this.getNode(), error, { itemIndex })
				}
			}
		}

		return [items]
	}
}
