import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket for hosting your frontend assets
    const websiteBucket = new s3.Bucket(this, 'SupaS3', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true // Allow public read access to the bucket
    });

    // Create an ACM certificate for securing your domain
    const certificate = new acm.DnsValidatedCertificate(this, 'SupaACM', {
      domainName: 'yourdomain.com', // Your domain name here
      hostedZone: route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: 'yourdomain.com' // Your domain name here
      })
    });

    // Create a CloudFront distribution to serve your frontend content
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SupaDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket
          },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ],
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: ['yourdomain.com'] // Your domain alias here
      })
    });

    // Create a Route 53 A record to alias the CloudFront distribution
    new route53.ARecord(this, 'SupaRecord', {
      zone: route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: 'yourdomain.com' // Your domain name here
      }),
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}

const app = new cdk.App();
new FrontendStack(app, 'FrontendStack');