import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GcpServiceAccountApi implements ICredentialType {
	name = 'gcpServiceAccountApi';
	displayName = 'Google Cloud Platform Service Account API';
	documentationUrl = 'https://cloud.google.com/iam/docs/service-accounts';
	properties: INodeProperties[] = [
		{
			displayName: 'Service Account JSON',
			name: 'serviceAccountJson',
			type: 'json',
			default: '',
			required: true,
			description: 'The JSON content of the service account key file downloaded from Google Cloud Console',
			placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key_id": "...",\n  ...\n}',
		},
	];
}