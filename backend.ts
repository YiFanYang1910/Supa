import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export class EcrStack extends cdk.Stack {
  public readonly frontendRepository: ecr.Repository;
  public readonly backendRepository: ecr.Repository;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define ECR repositories for front-end and back-end
    this.frontendRepository = new ecr.Repository(this, 'SupaFrontendEcrRepository', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageScanOnPush: true
    });

    this.backendRepository = new ecr.Repository(this, 'SupaBackendEcrRepository', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageScanOnPush: true
    });
  }
}

interface CloudWatchStackProps extends cdk.StackProps {
  ecsService: ecs.BaseService;
}

export class CloudWatchStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: CloudWatchStackProps) {
    super(scope, id, props);

    // Import the ECS service
    const service = props.ecsService;

    // Create a CloudWatch metric for ECS service CPU utilization
    const cpuUtilizationMetric = service.metricCpuUtilization();

    // Create a CloudWatch alarm for CPU utilization
    new cloudwatch.Alarm(this, 'CPUUtilizationAlarm', {
      metric: cpuUtilizationMetric,
      threshold: 80,
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      alarmDescription: 'Alarm if CPU utilization exceeds 80%',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });
  }
}

export class AutoScalingFargateService extends cdk.Stack {
  constructor(scope: cdk.App, id: string, ecrProps: EcrStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a cluster
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, 'SupaEcsCluster', { vpc });

    // Use the created ECR repositories
    const frontendEcrRepository = ecrProps.frontendRepository;
    const backendEcrRepository = ecrProps.backendRepository;

    // Create Fargate Service for front-end
    const frontendService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'SupaFrontendFargateService', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(frontendEcrRepository, 'latest'),
      },
    });

    // Create Fargate Service for back-end
    const backendService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'SupaBackendFargateService', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(backendEcrRepository, 'latest'),
      },
    });

    // Setup AutoScaling policy for front-end
    frontendService.service.autoScaleTaskCount({ maxCapacity: 2 }).scaleOnCpuUtilization('FrontendCpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });

    // Setup AutoScaling policy for back-end
    backendService.service.autoScaleTaskCount({ maxCapacity: 2 }).scaleOnCpuUtilization('BackendCpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });

    // Add CloudWatch alarms for the ECS cluster
    new CloudWatchStack(scope, 'FrontendCloudWatchStack', { ecsService: frontendService.service });
    new CloudWatchStack(scope, 'BackendCloudWatchStack', { ecsService: backendService.service });
  }
}

const app = new cdk.App();
const ecrStack = new EcrStack(app, 'EcrStack');
new AutoScalingFargateService(app, 'supa-fargate-web', ecrStack);
app.synth();