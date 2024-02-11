// This file will created ECR, ECS Cluster, EC2, ALB and Fargate Task definition
import * as cdk from 'aws-cdk-lib/core';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatchactions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class EcsWebApplicationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC
    const vpc = new ec2.Vpc(this, 'SupaVpc', {
      maxAzs: 2
    });

    // Create a new ECR repository
    const repository = new ecr.Repository(this, 'SupaRepository', {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create a new ECS cluster
    const cluster = new ecs.Cluster(this, 'SupaCluster', {
      vpc: vpc
    });

    // Create a load balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, 'SupaALB', {
      vpc: vpc,
      internetFacing: true
    });

    // Create a listener for the load balancer
    const listener = lb.addListener('Listener', {
      port: 80,
      open: true
    });

    // Create a task definition for ECS
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'SupaTaskDefinition');

    // Add a container to the task definition
    const container = taskDefinition.addContainer('SupaContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repository), // Use the ECR repository
      memoryLimitMiB: 256 // Adjust as per your application's requirements
    });

    // Add port mappings for the container
    container.addPortMappings({
      containerPort: 80
    });

    // Create an ECS service
    const service = new ecs.Ec2Service(this, 'SupaService', {
      cluster: cluster,
      taskDefinition: taskDefinition
    });

    // Attach the ECS service to the load balancer
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'SupaTargetGroup', {
      targets: [service],
      port: 80,
      vpc: vpc,
      targetType: elbv2.TargetType.INSTANCE
    });

    service.attachToApplicationTargetGroup(targetGroup);

    // Output the load balancer DNS name
    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: lb.loadBalancerDnsName });

    // Create RDS Database
    const database = new rds.DatabaseInstance(this, 'SupaDatabase', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      vpc: vpc,
      allocatedStorage: 20,
      storageType: rds.StorageType.GP2,
      deletionProtection: false, // NOTE: consider enabling deletion protection in production
      databaseName: 'mydatabase',
      credentials: {
        username: 'admin',
        password: cdk.SecretValue.plainText('supa'),
      }
    });

    // Setup CloudWatch metrics
    const ecsMetric = service.metricCpuUtilization();
    const ecsAlarm = new cloudwatch.Alarm(this, 'EcsCpuAlarm', {
      metric: ecsMetric,
      threshold: 80,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD
    });

    // Create SNS topic
    const topic = new sns.Topic(this, 'SupaSNSTopic', {
        displayName: 'ECS Alarm SNS Topic'
    });

    // Subscribe email to SNS topic
    topic.addSubscription(new subs.EmailSubscription('ffls712@hotmail.com'));

    // Add action to the alarm (send notification to SNS topic)
    ecsAlarm.addAlarmAction(new cloudwatchactions.SnsAction(topic));
    }
}
// Instantiate the stack
const app = new cdk.App();
new EcsWebApplicationStack(app, 'EcsWebApplicationStack');