# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-21

### Added
- Initial release of n8n-nodes-gcp-pubsub
- **GCP Pub/Sub Publisher Node**: Publishes messages to Google Cloud Pub/Sub topics
  - Support for publishing JSON data to specified topics
  - Project ID and Topic Name configuration parameters
  - Message ID returned upon successful publication
  - Error handling with continue on fail option
  - Can be used as a tool in AI workflows
- **GCP Pub/Sub Subscriber Node**: Trigger node that listens to Pub/Sub subscriptions
  - Continuous message listening from specified subscriptions
  - Automatic message acknowledgment after processing
  - Support for both JSON and text message payloads
  - Comprehensive message metadata output (ID, attributes, data, publish time)
  - Error handling with message nack on processing failure
- **GCP Service Account API Credentials**: Authentication support for Google Cloud Platform
  - Service Account JSON configuration
  - Secure credential management through n8n's credential system
- Dependencies:
  - @google-cloud/pubsub v5.2.0 for Google Cloud Pub/Sub client library
- Development tooling:
  - TypeScript support
  - ESLint configuration
  - n8n node CLI integration
  - Build and development scripts

### Security
- Implemented secure service account authentication
- JSON credential parsing with error handling
- Following Google Cloud security best practices

### Documentation
- Comprehensive README with setup instructions
- Service account creation guide
- Node usage examples
- Security best practices
- API reference documentation