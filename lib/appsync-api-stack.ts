import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { Configuration } from '../bin/configuration';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { join } from 'path'
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
export interface AppsyncApiProps extends StackProps, Configuration {
  envName: string
}
export class AppsyncApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AppsyncApiProps) {
    super(scope, id, props);

    // =================================================
    // * appsync api
    // =================================================
    const apiName: string = `${cdk.Aws.STACK_NAME}-API`;
    const api: appsync.GraphqlApi = new appsync.GraphqlApi(this, apiName, {
      name: apiName,
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      schema: appsync.SchemaFile.fromAsset(join(__dirname, '..', 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        }
      },
      xrayEnabled: true,
    });
    new ssm.StringParameter(this, 'graphql-api-url-' + props?.envName, {
      parameterName: `/${props?.envName}/graphql/api/url`,
      stringValue: api.graphqlUrl,
      description: 'The url to call the appsync graphql API',
      tier: ssm.ParameterTier.STANDARD
    });

    if (api.apiKey) {
      new ssm.StringParameter(this, 'graphql-api-key-' + props?.envName, {
        parameterName: `/${props?.envName}/graphql/api/key`,
        stringValue: api.apiKey,
        description: 'The appsync graphql api-key',
        tier: ssm.ParameterTier.STANDARD
      });
    }
    // set custom domain
    if (props?.apiCertificateArn) {
      const api_domain = new appsync.CfnDomainNameApiAssociation(this, `${id}-domain-association`, {
        apiId: api.apiId,
        domainName: props?.apiDomainName
      });

      new appsync.CfnDomainName(this, `${id}-domain`, {
        domainName: api_domain.domainName,
        certificateArn: props.apiCertificateArn
      });
    }
    // =================================================
    // * lambda function handler
    // =================================================
    const lambdaFunction = new NodejsFunction(this, 'LambdaDataSource', {
      functionName: `${cdk.Aws.STACK_NAME}-LambdaDataSource`,
      entry: join(__dirname, '..', 'lambda', 'index.ts'),
      handler: 'handler',
      bundling: {},
      environment: {},
      timeout: cdk.Duration.minutes(1),
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_18_X,
      logRetention: logs.RetentionDays.ONE_WEEK,
    })

    const lambdaDataSource = api.addLambdaDataSource('lambdaDataSource', lambdaFunction);
    lambdaDataSource.createResolver('get-posts-resolver',{
      typeName: 'Query',
      fieldName: 'getPosts',
    })
    lambdaDataSource.createResolver('get-post-resolver',{
      typeName: 'Query',
      fieldName: 'getPost',
    })

    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl || ''
    });

    new cdk.CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || ''
    });
    
  }
}
