---
layout: post
title:  "Terraform-GCP-K8s: A Jenkins DevOps story"
date:   2020-12-07 20:15:29 -0500
categories: tech
comments: false
---

In this post we are going to bootstrap a disposable `Kubernetes cluster` in `Google Cloud Platform` using `Terraform`. Once we have the cluster ready, we will use a `Docker` based ephemeral `Jenkins Configuration as Code` node to setup a pipeline to deploy `Helm packages` into our cluster. We'll call it the `K8s Playground`.

This write-up assumes you have a basic idea about these tools. This is what we-re building-
![K8s-Playground](/assets/2020-12-07-terraform-gcp-k8s/K8s-Playground.png)

Things you'll learn-
- How to use Terraform Cloud as a remote state store.
- How to provision an auto-scaling Kubernetes cluster managed by Google.
- How to use create a Jenkins master-worker setup using [JCasC](https://www.jenkins.io/projects/jcasc/){:target="_blank" rel="noopener"} and Docker.
- How to deploy components to a Kubernetes cluster using Helm.

Code for this project-
- [Terraform-GKE](https://github.com/janpreet/Terraform-GKE){:target="_blank" rel="noopener"}
- [Terraform-GCP-Jenkins](https://github.com/janpreet/Terraform-GCP-Jenkins){:target="_blank" rel="noopener"}
- [Jenkins-Master](https://github.com/janpreet/Jenkins-with-Docker){:target="_blank" rel="noopener"}
- [Jenkins-Worker](https://github.com/janpreet/Jenkins-Worker){:target="_blank" rel="noopener"}
- [Multibranch-Jenkins-Pipeline](https://github.com/janpreet/Jenkins-Job-DSL){:target="_blank" rel="noopener"}

Registries for this project-
- [Docker Hub](https://hub.docker.com/u/janpreet){:target="_blank" rel="noopener"}
- [Terraform Registry](https://registry.terraform.io/modules/janpreet/cluster-kubeconfig/google/latest){:target="_blank" rel="noopener"}
- [Helm Repo](https://janpreet.github.io/helm-charts/){:target="_blank" rel="noopener"}

> *The GCP resources required for this exercise exceed the free tier. At the time of writing this post, as a first time customer you'd get [$300 free credits](https://cloud.google.com/free){:target="_blank" rel="noopener"} to explore Google cloud.* 

### Let's begin the Setup

#### Terraform Cloud
- Please follow the [official guide](https://learn.hashicorp.com/tutorials/terraform/install-cli){:target="_blank" rel="noopener"} to install Terraform on your computer.
- Go to [Terraform Cloud](https://app.terraform.io/){:target="_blank" rel="noopener"} and create an organization. Our workspaces will be a part of this organization.
- Go to User Settings -> Tokens -> Create an API Token. Copy and securely save this token for the next step.
- Follow the [official guide](https://www.terraform.io/docs/commands/cli-config.html){:target="_blank" rel="noopener"} to create a file named `.terraformrc`. (name may change depending on your OS - follow the guide for this). Add the token generated in the previous step to this file

<script src="https://gist.github.com/janpreet/c1bf8026e9121996fbe9658f48896bc2.js"></script>

- Create an environment variable `TF_CLI_CONFIG_FILE` pointing to the .terraformrc file location. `You must never share this file or publish it to a Git repo. This is a secret and must be stored securely`.
- Select your organization from top left drop-down and create a new workspace of `CLI-driven workflow` type.
- Click on the workspace and go to Settings -> General, and select `Local` as the `Execution Mode`. This will make sure that the Terraform plans run on your local machine and the states are stored in Terraform cloud. The connection will be authenticated by the API token for your registered user we created in previous steps.
- The main benefit of storing states in a remote backend will be the centralized single source of truth. [Read more here](https://www.terraform.io/docs/state/remote.html){:target="_blank" rel="noopener"}.

#### Google Cloud
- In this exercise we will be interacting with the GCP infrastructure using declarative HCL code and we will be making requests against the Google Cloud API so we will not be installing Google Cloud SDK.
- Create two new projects (`Test-Cluster` and `Test-VM`) in [Google Cloud](https://console.cloud.google.com/){:target="_blank" rel="noopener"}. 
- Go to Identity -> Service Accounts and create a [Service Account](https://cloud.google.com/docs/authentication/getting-started){:target="_blank" rel="noopener"} called `Terraform` and you can add `Terraform CLI` to Service Account Description. 
- Assign `Project Editor` role to the service account or a more restrictive access per your needs. You need this account to be able to create and destroy Google Cloud resources.
- Create and download `*.json` credentials key, and store it in a secure location. Make sure you set an environment variable pointing to GCP secret token, something like `export TF_VAR_credentials=/path/to/GCP-key.json`. This is another secret, please make sure this is never shared and is always accessed via an environment variable or a secure Ansible/ Hashicorp Vault. This token will be used by Terraform to authenticate your requests against GCP API.

#### Terraform-GKE
Let's start with a simple environment variables list which must be sourced every time before running a Terraform command. As a quick hack you can always create an `alias Terraform="source env.sh && terraform"` to operate automatically. I also never store env.sh in a Git repository, I create symlinks inside my project pointing to securely stored env.sh along with a `.gitignore`. If you don't like polluting your environment variables, there are better ways of handling secrets like [Hashicorp Vault](https://www.vaultproject.io/){:target="_blank" rel="noopener"} or [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html){:target="_blank" rel="noopener"}. Encrypted or not, sharing your secrets is still NEVER recommended. 

<script src="https://gist.github.com/janpreet/02a5690f346bd092f90b005cf95ed2b5.js"></script>
Here Google project and credentials variables here must be pointing to `Test-Cluster` project you created earlier.
<script src="https://gist.github.com/janpreet/bd64bb2407a721aa896a45022c0288ad.js"></script>

We will not be making use of all these variables in this project. All variables prefixed with `TF_VAR_` are going to be picked up and used by Terraform as long as they are declared in a variables.tf

<script src="https://gist.github.com/janpreet/c1cd5a1f57d6e114748ce6305b509223.js"></script>

I like to maintain a separate file for default definitions

<script src="https://gist.github.com/janpreet/5a66246bb9d5d7f30331bf32dbd0bcf4.js"></script>

Note that secret variables have not been defined in `.auto.tf` file, because their values will be assigned by `TF_VAR_` environment variables. Now to the main file

<script src="https://gist.github.com/janpreet/756c36f0de7297ade136c5dd8d30ae05.js"></script>

The first block configures Terraform to use a remote backend to store states authenticated by `TF_CLI_CONFIG_FILE`. I'm using a custom module here `janpreet/cluster-kubeconfig/google` because Terraform's [google-container-cluster](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_cluster#attributes-reference){:target="_blank" rel="noopener"} does not have a straight-forward way of exposing a Kubeconfig for your cluster. The variable `var.kubeconfig` is going to be the path where you'd like to store the kubeconfig, defined as a Terraform environment variable. If you quickly want to see this in action you may just; clone [Terraform-GKE](https://github.com/janpreet/Terraform-GKE){:target="_blank" rel="noopener"} repo, change variables, organization name and workspace name to your match your setup, source environment variables, and run `Terraform init` to initialize Terraform modules and providers in your working directory. Your output should look like this.
![Terraform init](/assets/2020-12-07-terraform-gcp-k8s/Terraform-init.png)
Now go ahead and run `Terraform plan` to read about what your infrastructure would look like. If you're satisfied, you may run `Terraform apply` to create the infrastructure, you'd want to follow the prompt, and at the end this would be the result.
![Terraform apply](/assets/2020-12-07-terraform-gcp-k8s/Terraform-apply.png)

Go to [Google Cloud Console](https://console.cloud.google.com/){:target="_blank" rel="noopener"} -> Select your project 'Test-cluster` -> Compute Engine -> VM Instances, you can see the worker nodes. If you select Kubernetes Engine from the navigation menu, you can learn about your cluster and explore the Google managed dashboard.

#### Terraform-GCP-Jenkins
We'll deploy our Jenkins container on a VM. Let's do the following-
- Add a second workspace having `CLI-driven workflow` with `Execution Mode` set as `Local` to your organization in Terraform Cloud for storing the Terraform states of our new VM. 
- Repeat the service account setup for our second Google cloud project `Test-VM` we created earlier and securely export the JSON key. 
- Clone [Terraform-GCP-Jenkins](https://github.com/janpreet/Terraform-GCP-Jenkins){:target="_blank" rel="noopener"}. 

Here Google project and credentials variables must be pointing to `Test-VM` project. Which requires you to maintain two different collection of Terraform environment variables.
<script src="https://gist.github.com/janpreet/9400eb9f90333c8d2f9ff40ad7ada21d.js"></script>
We would be creating a single VM to host our Master Jenkins in a container. For that we would be using a Container Optimized image for the VM `cos-cloud/cos-stable-69-10895-71-0`. You'll find these details in vars.* files. It is important to note that you may choose to create your own image using a tool like [Packer](https://www.packer.io/){:target="_blank" rel="noopener"}.
To make our Jenkins setup truly ephemeral we require it to behave exactly the same every time it it re-created. For that Terraform would be rendering this template as Jenkins.yml and feeding it to the VM
<script src="https://gist.github.com/janpreet/e7c3a8c0aa7a8bf73171af92dc12c1dd.js"></script>
Where the startup script will handle it (along with the Kubeconfig), mount a directory and tell Jenkins where to look for the coded configuration file by setting `CASC_JENKINS_CONFIG="/var/jenkins_home/jenkins.yml"`.
As the last step in provisioning our VM, Terraform would be running this startup script, to complete setting up the Jenkins Master container-
<script src="https://gist.github.com/janpreet/1fd276298049d6abfb3446a1cd2c5bae.js"></script>
It is important to note that, our secrets so far have been handled by Terraform environment variables. Sky is the limit when it comes to codifying your configuration.
If you're satisfied with your definitions of Terraform environment variables for this project, you may `Terraform init`, `Terraform plan` and then `Terraform apply` to create the VM. On Google Cloud Console, you can go to the VM project `Test-VM` -> Compute Engine -> VM Instances, to see the newly created VM. 
In our master script, while creating the container we are telling VM Docker engine to map incoming requests at port 8080 with container port 8080 which will be served by the Jenkins service. That means we are now ready to access our Master Jenkins at `<Google Cloud VM's External IP>:8080`. Login to your Jenkins using Jenkins username and password you've defined in `TF_VAR_jenkins_admin_user and TF_VAR_jenkins_admin_password`. 

![Jenkins Welcome](/assets/2020-12-07-terraform-gcp-k8s/Jenkins-home.png)

Clicking on the job will show you all the branches with a Jenkinsfile as separate pipelines.

![Jenkins Branch](/assets/2020-12-07-terraform-gcp-k8s/Jenkins-branch.png)

All changes to existing jobs or addition of new jobs will be changed in [Jenkins-Jobs-DSL](https://github.com/janpreet/Jenkins-Job-DSL){:target="_blank" rel="noopener"} or a similar repo for your project. The idea is to codify your deployments.

#### Deployments

In this exercise I've done three kinds of deployments-
- [Using Kubectl](https://github.com/janpreet/Jenkins-Job-DSL/tree/k8s-dashboard){:target="_blank" rel="noopener"}
- [Using a Helm Chart](https://github.com/janpreet/Jenkins-Job-DSL/tree/maven-hello-world){:target="_blank" rel="noopener"}
- [Re-using a Helm package and passing values](https://github.com/janpreet/Jenkins-Job-DSL/tree/simple-python-api){:target="_blank" rel="noopener"}

Please note that these are not the only options you can always implement an CD operator like [Flux](https://fluxcd.io/) and leverage GitOps practices.
Different use-cases will require different practices. I leave it open for you to decide what's the best deployment method.

Let's verify our deployments. Before we being please make sure you have copied the `Kubeconfig` generated during `Terraform-GKE setup`, and placed it at `~/.kube/config`. It is a very important step without which you will not be able to interact with your Kubernetes cluster.
- Kubernetes Dashboard
1. First copy the admin user token from the K8s Dashboard deployment by running 
```bash
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
```
1. Because the dashboard is using ClusterIP service we can only access it from within the cluster. So we'd have to use kubectl proxy to route localhost requests to the API server. Run
```bash
kubectl proxy
```
1. Now we can access Dashboard at [this link](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/). Paste the token generated in step 1 and this what you should see. Take a pause to play around and explore the dashboard, before moving on.
![Kubernetes Dashboard](/assets/2020-12-07-terraform-gcp-k8s/K8s-dashboard.png)
<br /><br />
- Maven Hello World
1. Note that to interact with our deployment from outside the cluster we have defined a Loadlancer type service resource. To handle the external traffic, behind the scenes we are using GCP managed LoadBalancer using GKE Cloud Controller which sits between our cluster and GCP API endpoints.
<script src="https://gist.github.com/janpreet/07740eb7cacfbadfb926d6a30d02963f.js"></script>
1. Our service would be listening to our request at port 8080 and will be routing it to the node-port 32592, to pod target-port 8080, to container port 8080 exposed by our maven-hello-world container
<script src="https://gist.github.com/janpreet/0f8cb7a746cb352bb2bf61731773fd4f.js"></script>
1. That means as long as we have an IP address for the LoadBalancer we can interact with Maven-Hello-World at port 8080. Let's get the IP address by running
```bash
kubectl get svc maven-hello-world -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```
1. This is what you should see if you go to `<External-IP-Address-from-above>:8080`
![Maven Hello World](/assets/2020-12-07-terraform-gcp-k8s/maven-hello-world.png)
<br /><br />
- Simple Python API
1. For this deployment we are passing the following config to a Helm Package called [Bare-Bones](https://github.com/janpreet/helm-charts/tree/main/bare-bones){:target="_blank" rel="noopener"}
<script src="https://gist.github.com/janpreet/78e1ba15bab6b7f78546581855231204.js"></script>
1. This is what our install command looks like
```bash
helm install simple-python-api -f values.yaml janpreet/bare-bones
```
1. This is also using a LoadBalancer service listening at port 8080, so let's get the external IP address by running
```bash
kubectl get svc simple-python-api-bare-bones -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```
1. This is what you should see when you go to: `<External-IP-Address-from-above>:8080`
![Python API Root](/assets/2020-12-07-terraform-gcp-k8s/python-api-root.png)
1. Let's look at the Flask URL routing
<script src="https://gist.github.com/janpreet/c4f4f5bcc618e94a4987476e52b17cb7.js"></script>
1. Because Flask is also mapping `/api/v1/resources/users/all` to the function `api_all` which is using jsonify to convert our dummy list to a json string. You can also access the records added via the API by going to: `<External-IP-Address-from-above>:8080/api/v1/resources/users/all` and this should be your output-
```json
[{"id":1,"name":"Janpreet Singh","unique":"DL935"},{"id":2,"name":"Second User","unique":"PBX"}]
```

That is the end of our deployments. Let's do a full recap of what we've learned so far
- Created a Kubernetes cluster using Terraform + GCP.
- Created a VM for Jenkins using Terraform + GCP.
- Deployed Jenkins Master using JCasC as a container. 
- Deployed packages to the K8s cluster using Helm and Kubectl, configured in a Jenkinsfile.

It is very important to note that all the above steps are automated. Once you create GKE and the VM using Terraform, it creates the entire pipeline for you. THe very next thing you can do is make changes to your deployments using Jenkinsfile setup in the multi-branch job. 

In this exercise our pipelines are using a Docker Worker container called [all-in-one](https://github.com/janpreet/Jenkins-Worker/blob/main/Dockerfile){:target="_blank" rel="noopener"} which should not limit your interaction with Jenkins. I highly encourage you to make this project yours by
- Cloning repos
- Creating your own repo for Jobs and
- Creating your own Jenkinsfiles to explore more

One of the big advantages of using Jenkins Master-Worker config is to enable seamless develop-build-test-tag-publish-release pipeline. You can code your pipeline to decide which namespace should Helm install a package based on the tags which your pipeline can conditionally set. This was out of the motivation and intent of this project so I've not covered in this. I'll add it in a new post to my blog.

Conclusion-
1. If you must use Jenkins for K8s deployments, it makes the most sense if you deploy Jenkins inside your Kubernetes cluster so you can make the best use of a `Build` worker-agent deployed as a pod tailored to your choice of many containers.
1. I've kept the project ephemeral and avoided external storage, which is not ideal if you're deciding to demonstrate logging. 

This project has taught me a lot about the architecture of application development and release landscape.
The best part?
If you run `Terraform destroy` and approve the prompt, for both of your projects, it will completely destroy everything we have created in this exercise. 
> Do not forget to `Terraform destroy` your workspaces so you're not using GCP resources when you don't need to.

The next time you do a `Terraform apply`, it would set it up for you in the exact same order and setup, because the code is centrally organized and version controlled in GitHub. There is no reason why you can not make use of an PR-driven [Atlantis](https://www.runatlantis.io/){:target="_blank" rel="noopener"} to automatically apply your Terraform plan while working in a team. Look into it.

I hope this helps you learn something new.
Thank you for reading.