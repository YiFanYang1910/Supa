deploy
destroy
all
EcrStack
CloudWatchStack
AutoScalingFargateService
FrontendStack
# export values from aws environment
export xxx := $()
lib-install:
	@docker-compose run --rm supa "npm install aws-cdk-lib"

deploy-all: lib-install
	@docker-compose run --rm supa "cdk deploy --all"

destroy-all: lib-install
	@docker-compose run --rm supa "cdk destroy --all"

deploy-EcrStack: lib-install
	@docker-compose run --rm supa "cdk deploy EcrStack"

destroy-EcrStack: lib-install
	@docker-compose run --rm supa "cdk destroy EcrStack"

CloudWatchStack: lib-install
	@docker-compose run --rm supa "cdk deploy CloudWatchStack"

CloudWatchStack: lib-install
	@docker-compose run --rm supa "cdk destroy CloudWatchStack"

AutoScalingFargateService: lib-install
	@docker-compose run --rm supa "cdk deploy AutoScalingFargateService"

AutoScalingFargateService: lib-install
	@docker-compose run --rm supa "cdk destroy AutoScalingFargateService"

FrontendStack: lib-install
	@docker-compose run --rm supa "cdk deploy FrontendStack"

FrontendStack: lib-install
	@docker-compose run --rm supa "cdk destroy FrontendStack"