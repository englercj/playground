# Next Up:

- Finish client.
- Client js is HUGE, wtf?
- Use CodeDeploy from travis for continuous deployment

# AWS Services:

- EC2
- S3
- DynamoDB
- CloudWatch
- Beanstalk
- Elastic Load Balancer
- IAM
- Certificate Manager
- ElastiCache (soon)

# TODO:

- Switch to local data sources instead of AWS when running in non-production mode
- Optimization: Do S3 reads/writes from the client to avoid the upload via node. Can do this with signed upload urls.
