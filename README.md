TypeScript Web Application Project with AWS Resources

This project is a TypeScript-based web application encompassing both frontend and backend AWS resources.

Frontend Components:
S3 Bucket: Hosts static files and resources for the frontend.
CloudFront: Content delivery network for improved performance and scalability.
Route 53: Manages DNS and routes traffic efficiently to your CloudFront distribution.

Backend Components:
ECR (Elastic Container Registry): Stores Docker container images for your backend services.
ECS (Elastic Container Service): Orchestration service for deploying and managing containerized applications.
VPC (virtual private cloud): ecure, isolated private cloud hosted within a public cloud.
CloudWatch: Provides monitoring and observability for your ECS containers.

Buildkite Pipeline:
The .buildkite folder contains a sample pipeline configuration. Users can choose to deploy or destroy different stacks using this pipeline.

Makefile Integration:
We've integrated a Makefile with various commands that align with the Buildkite pipeline steps, facilitating ease of use and deployment. You can customize these commands as per your requirements.

Docker Compose:
We've included Docker Compose to streamline the build processes, allowing for faster and more efficient development workflows.
