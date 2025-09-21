import type {
  ITriggerFunctions,
  ITriggerResponse,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow'
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow'
import { PubSub, Message } from '@google-cloud/pubsub'

export class GcpPubSubSubscriber implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'GCP Pub/Sub Subscriber',
    name: 'gcpPubSubSubscriber',
    icon: { light: 'file:GcpPubSubSubscriber.svg', dark: 'file:GcpPubSubSubscriber.svg' },
    group: ['trigger'],
    version: 1,
    description: 'Subscribes to messages from a Google Cloud Pub/Sub subscription',
    defaults: {
      name: 'GCP Pub/Sub Subscriber',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'Project ID',
        name: 'projectId',
        type: 'string',
        default: '',
        required: true,
        description: 'The Google Cloud Project ID',
      },
      {
        displayName: 'Subscription Name',
        name: 'subscriptionName',
        type: 'string',
        default: '',
        required: true,
        description: 'The name of the Pub/Sub subscription to listen to',
      },
    ],
    credentials: [
      {
        name: 'gcpServiceAccountApi',
        required: true,
      },
    ]
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const projectId = this.getNodeParameter('projectId', 0) as string
    const subscriptionName = this.getNodeParameter('subscriptionName', 0) as string

    if (!projectId || !subscriptionName) {
      throw new NodeOperationError(this.getNode(), 'Both Project ID and Subscription Name must be provided.')
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

    const subscription = pubsub.subscription(subscriptionName)

    subscription.on('message', (message: Message) => {
      try {
        const payload = message.data.toString('utf-8')

        let parsedData
        try {
          parsedData = JSON.parse(payload)
        } catch {
          parsedData = payload
        }

        this.emit([this.helpers.returnJsonArray([{
          id: message.id,
          attributes: message.attributes,
          data: parsedData,
          publishTime: message.publishTime,
          received: new Date().toISOString(),
        }])])

        message.ack()
      } catch (error) {
        this.logger.error('Error processing message:', { error: error instanceof Error ? error.message : String(error) })
        message.nack()
      }
    })

    subscription.on('error', (error: Error) => {
      this.logger.error('Subscription error:', { error: error.message })
    })

    async function closeFunction() {
      await subscription.close()
    }

    return { closeFunction }
  }
}