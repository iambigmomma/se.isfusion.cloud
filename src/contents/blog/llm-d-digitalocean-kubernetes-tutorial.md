---
title: 'Deploy llm-d for Distributed LLM Inference on DigitalOcean Kubernetes'
publishedAt: '2025-07-15'
description: >-
  Learn how to deploy llm-d on DigitalOcean Kubernetes (DOKS) for distributed LLM inference with GPU support. This tutorial covers automated cluster setup, llm-d deployment, and basic testing to get you started with production-ready distributed LLM services.
banner: 'llm-d-doks-deploy'
tags: 'kubernetes, gpu, llm, inference, digitalocean'
---

# Deploy llm-d for Distributed LLM Inference on DigitalOcean Kubernetes

This tutorial will guide you through deploying llm-d on DigitalOcean Kubernetes using our automated deployment scripts. Whether you're a DevOps engineer, ML engineer, or platform architect, this guide will help you establish a distributed LLM inference service on Kubernetes.

**⏱️ Estimated Deployment Time: 15-20 minutes**

**📋 Tutorial Scope: This tutorial focuses on basic llm-d deployment on DigitalOcean Kubernetes with automated scripts.**

---

## Overview

[**llm-d**](https://llm-d.ai/) is a distributed LLM inference framework designed for Kubernetes environments, featuring disaggregated serving architecture and intelligent resource management. On DigitalOcean Kubernetes, you can deploy llm-d to achieve:

1. **Disaggregated LLM Inference**  
   Separate prefill (context processing) and decode (token generation) stages across different GPU nodes.

2. **GPU Resource Management**  
   Automatic GPU resource allocation with support for NVIDIA RTX 4000 Ada, RTX 6000 Ada, and L40S cards.

3. **Kubernetes-Native Architecture**  
   Cloud-native design with proper service discovery and resource management.

---

## What is llm-d?

**llm-d** represents a next-generation distributed LLM inference platform, specifically designed for Kubernetes environments. Unlike traditional single-node solutions, llm-d brings distributed computing capabilities to LLM inference.
![llm-d architecture](https://res.cloudinary.com/iambigmomma/image/upload/v1752497883/blog/deploy-llm-d-on-doks/architecture.svg)

### Understanding Disaggregated LLM Inference

Think of the difference between fast fashion retail and bespoke tailoring - this perfectly captures the fundamental differences between traditional web applications and LLM inference:

**Traditional Web Applications vs. LLM Inference:**

| Comparison Aspect         | Traditional Web Apps (Fast Fashion)                              | LLM Inference (Bespoke Tailoring Workshop)                      |
| ------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| **Service Process**       | Store displays S·M·L standard sizes, customers grab and checkout | Measurement → Pattern Making → Fitting → Alterations → Delivery |
| **Request Lifespan**      | Milliseconds to seconds (instant checkout)                       | Seconds to minutes (stitch by stitch execution)                 |
| **Resource Requirements** | Similar fabric and manufacturing time per item                   | Vastly different fabric usage and handcraft time per suit       |
| **Statefulness**          | Staff don't remember your previous purchases                     | Tailor remembers your measurements and preferences              |
| **Cost**                  | Low unit price, mass production                                  | High unit price, precision handcraft                            |

![fast-fashion-vs-beskpoke](https://res.cloudinary.com/iambigmomma/image/upload/v1752508698/blog/deploy-llm-d-on-doks/beskpoke-vs-fast-fashion.png)
**Traditional LLM Serving = "One-Person-Does-Everything Tailor"**

Problems with this approach:

- **Resource Imbalance**: Some customers need simple hem adjustments, others want full custom suits - workload varies dramatically
- **Fabric Waste**: Each customer monopolizes a pile of fabric, no sharing of leftover pieces
- **Queue Blocking**: Complex orders in front block quick alterations behind

**llm-d's Disaggregated Approach = "Modern Bespoke Tailoring Production Line"**

| Station             | Process Analogy                   | Specialized Optimization                            |
| ------------------- | --------------------------------- | --------------------------------------------------- |
| **Prefill Station** | Measurement + Pattern Making Room | High parallel computation, CPU/GPU collaboration    |
| **Decode Station**  | Sewing Room                       | Sequential output focus, maximum memory bandwidth   |
| **Smart Gateway**   | Master Tailor Manager             | Dynamic order assignment based on KV Cache and load |

**Benefits Achieved:**

1. **Fabric (KV Cache) Sharing**: Similar pattern orders concentrated for high hit rates
2. **Request Shape Optimization**: Hem alterations express lane, formal wear slow lane - each takes its own path
3. **Independent Scaling**: Add more pattern makers during measurement season, more sewers during delivery season
4. **GPU Memory Efficiency**: Measurement phase needs compute-heavy/memory-light; sewing phase needs the opposite - separation allows each to take what it needs

**One-Line Summary**: Fast fashion emphasizes "grab and go"; bespoke tailoring pursues "measured perfection." llm-d separates measurement from sewing, with intelligent master tailor coordination, making AI inference both personalized and efficient.

---

## Tutorial Steps

## Step 1: Clone the Repository and Setup Environment

First, let's get the llm-d deployer repository and set up our environment:

```bash
# Clone the llm-d deployer repository
git clone https://github.com/iambigmomma/llm-d-deployer.git
cd llm-d-deployer/quickstart/infra/doks-digitalocean
```

### Prerequisites

- DigitalOcean account with GPU quota enabled
- `doctl` CLI installed and authenticated
- `kubectl` installed
- `helm` installed

### Set Required Environment Variables

```bash
# Set your HuggingFace token (required for model downloads)
export HF_TOKEN=hf_your_token_here

# Verify doctl is authenticated
doctl auth list
```

### 🔐 Important: Model Access Requirements

**For Meta Llama Models (Llama-3.2-3B-Instruct):**

The `meta-llama/Llama-3.2-3B-Instruct` model used in this tutorial requires special access:

1. **HuggingFace Account Required**: You must have a HuggingFace account
2. **Model Access Request**: Visit [Llama-3.2-3B-Instruct on HuggingFace](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
3. **Accept License Agreement**: Click "Agree and access repository" and complete the license agreement
4. **Wait for Approval**: Access approval is usually granted within a few hours
5. **Generate Access Token**: Create a HuggingFace access token with "Read" permissions from your [Settings > Access Tokens](https://huggingface.co/settings/tokens)
   ![HF-meta-llama-repo](https://res.cloudinary.com/iambigmomma/image/upload/v1752497883/blog/deploy-llm-d-on-doks/hf-meta-llama-access-request.png)

**Alternative Open Models (No License Required):**

If you prefer to avoid the approval process, consider these open alternatives:

- `google/gemma-2b-it` - Google's open instruction-tuned model
- `Qwen/Qwen2.5-3B-Instruct` - Alibaba's multilingual model
- `microsoft/Phi-3-mini-4k-instruct` - Microsoft's efficient small model

To use alternative models, you'll need to modify the deployment configuration files accordingly.

## Step 2: Create DOKS Cluster with GPU Nodes

Our automated script will create a complete DOKS cluster with both CPU and GPU nodes:

```bash
# Run the automated cluster setup script
./setup-gpu-cluster.sh
```

The script will:

1. Create a new DOKS cluster with CPU nodes
2. Add a GPU node pool with your chosen GPU type
3. Install NVIDIA Device Plugin for GPU support
4. Configure proper node labeling and GPU resource management

### Choose Your GPU Type

When prompted, select your preferred GPU type:

- **RTX 4000 Ada**: Cost-effective for smaller models (7B-13B parameters)
- **RTX 6000 Ada**: Balanced performance for medium models (13B-34B parameters)
- **L40S**: Maximum performance for large models (70B+ parameters)

![setup-gpu-doks](https://res.cloudinary.com/iambigmomma/image/upload/v1752497883/blog/deploy-llm-d-on-doks/setup-doks-gpu-cluster.png)

### Verify Cluster Setup

```bash
# Check cluster status
kubectl get nodes

# Verify GPU nodes are ready
kubectl get nodes -l doks.digitalocean.com/gpu-brand=nvidia

# Check GPU resources are available
kubectl describe nodes -l doks.digitalocean.com/gpu-brand=nvidia | grep nvidia.com/gpu
```

You should see output similar to:

```bash
NAME                   STATUS   ROLES    AGE   VERSION
pool-gpu-xxxxx         Ready    <none>   3m    v1.31.1
pool-gpu-yyyyy         Ready    <none>   3m    v1.31.1
```

### 🔄 If the Setup Script Stops Unexpectedly

**This is completely normal!** DigitalOcean API calls may occasionally timeout during node provisioning. If you see the script stop after creating the GPU node pool:

1. **Wait 30 seconds** for the API operations to complete
2. **Re-run the same command**:
   ```bash
   ./setup-gpu-cluster.sh
   ```
3. **The script will automatically detect existing components** and continue from where it left off
4. **No duplicate resources will be created** - the script is designed to be safely re-run

The script has intelligent state detection and will skip already completed steps, making it completely safe to re-run multiple times.

## Step 3: Deploy llm-d with Monitoring

Now let's deploy llm-d using our automated deployment script:

```bash
# Deploy llm-d with your chosen GPU configuration and dashboard import
./deploy-with-monitoring.sh -g rtx-6000-ada -t your_hf_token

# Alternative: Deploy without dashboard import
./deploy-with-monitoring.sh -g rtx-6000-ada -t your_hf_token -m
```

### What Gets Deployed

The deployment script will install:

**llm-d Core Components:**

- **Prefill Service**: Handles context processing on GPU pods
- **Decode Service**: Manages token generation with GPU optimization
- **Gateway Service**: Routes requests and manages load balancing
- **Redis Service**: Provides KV cache storage

**Smart Monitoring Integration:**

- **Automatic Detection**: Checks if Prometheus/Grafana already exist
- **No Duplicate Installation**: llm-d installer handles monitoring setup automatically
- **Dashboard Import**: Imports llm-d Inference Gateway dashboard to existing Grafana
- **ServiceMonitor Creation**: Automatic metrics collection setup

### Monitor Deployment Progress

```bash
# Watch deployment progress
kubectl get pods -n llm-d -w

# Check all components are running
kubectl get all -n llm-d
```

Wait until all pods show `Running` status:

```bash
NAME                                           READY   STATUS    RESTARTS   AGE
meta-llama-llama-3-2-3b-instruct-decode-xxx   1/1     Running   0          3m
meta-llama-llama-3-2-3b-instruct-prefill-xxx  1/1     Running   0          3m
llm-d-inference-gateway-xxx                    1/1     Running   0          3m
redis-xxx                                      1/1     Running   0          3m
```

## Step 4: Test Your llm-d Deployment

Now let's test that everything is working correctly using our test script:

```bash
# Navigate to the test directory
cd /path/to/llm-d-deployer/quickstart

# Run the automated test
./test-request.sh
```

![test-request](https://res.cloudinary.com/iambigmomma/image/upload/v1752499780/blog/deploy-llm-d-on-doks/test-request.png)

### Manual Testing (Alternative)

If you prefer to test manually:

```bash
# Port-forward to the gateway service
kubectl port-forward -n llm-d svc/llm-d-inference-gateway-istio 8080:80 &

# Test the API with a simple request
curl localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.2-3B-Instruct",
    "messages": [
      {"role": "user", "content": "Explain Kubernetes in simple terms"}
    ],
    "max_tokens": 150,
    "stream": false
  }' | jq
```

### Expected Response

You should see a successful JSON response like:

```json
{
  "id": "cmpl-4cc80b2c-f6c8-4e86-9f31-500485a19ca9",
  "object": "text_completion",
  "created": 1751474325,
  "model": "meta-llama/Llama-3.2-3B-Instruct",
  "choices": [
    {
      "index": 0,
      "text": "Kubernetes is like a smart orchestra conductor for containers. It helps manage and coordinate multiple applications running in containers across different computers or servers...",
      "logprobs": null,
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 158,
    "completion_tokens": 150
  }
}
```

## Step 5: Access Monitoring and Dashboard

llm-d automatically sets up monitoring if needed. You can access the Grafana dashboard:

```bash
# Port-forward to Grafana
kubectl port-forward -n llm-d-monitoring svc/prometheus-grafana 3000:80

# Get admin password
kubectl get secret prometheus-grafana -n llm-d-monitoring -o jsonpath="{.data.admin-password}" | base64 -d
```

**Grafana Access**: http://localhost:3000  
**Username**: admin  
**Password**: (from command above)
![monitoring-dashboard](https://res.cloudinary.com/iambigmomma/image/upload/v1752501545/blog/deploy-llm-d-on-doks/monitoring-dashboard.png)

### llm-d Dashboard and Key Metrics

If you deployed with dashboard import (default), you'll find:

- **Dashboard Location**: Look for "llm-d" folder in Grafana
- **Dashboard Name**: "llm-d Inference Gateway"

The dashboard may take 1-2 minutes to appear as it's loaded by Grafana's sidecar.

#### 📊 Important Metrics to Monitor

**Request Performance Metrics:**

- **Time to First Token (TTFT)**: Critical for user experience - measures how quickly the first response token is generated
- **Inter-Token Latency (ITL)**: Speed of subsequent token generation - affects perceived responsiveness
- **Requests per Second (RPS)**: Overall system throughput
- **Request Duration**: End-to-end request completion time

**Resource Utilization Metrics:**

- **GPU Memory Usage**: Monitor GPU memory consumption across prefill and decode pods
- **GPU Utilization**: Actual compute usage percentage of GPUs
- **KV Cache Hit Rate**: Percentage of requests benefiting from cached computations
- **Queue Depth**: Number of pending requests waiting for processing

**llm-d Specific Metrics:**

- **Prefill vs Decode Load Distribution**: Balance between processing phases
- **Cache-Aware Routing Effectiveness**: Success rate of intelligent request routing
- **Model Loading Time**: Time to load models into GPU memory
- **Token Generation Rate**: Tokens produced per second per GPU

**Kubernetes Metrics:**

- **Pod Autoscaling Events**: HPA scaling decisions and timing
- **Node Resource Pressure**: CPU, memory, and GPU pressure on nodes
- **Network Throughput**: Inter-pod communication for disaggregated serving

**Performance Optimization Indicators:**

- **Batch Size Utilization**: How well requests are batched for efficiency
- **Context Length Distribution**: Understanding of typical request patterns
- **Failed Request Rate**: Error rates and their causes

These metrics help you:

- **Optimize Performance**: Identify bottlenecks in prefill vs decode stages
- **Right-Size Resources**: Balance cost and performance based on actual usage
- **Troubleshoot Issues**: Quickly identify problems with specific components
- **Plan Capacity**: Predict future resource needs based on traffic patterns

---

## Common Issues and Solutions

### Setup Script Stops After GPU Node Pool Creation

**Symptoms**: Script terminates after "GPU node pool created successfully"
**Cause**: DigitalOcean API response delays during node provisioning (this is normal!)
**Solution**:

```bash
# Wait 30 seconds, then re-run the script
./setup-gpu-cluster.sh

# The script will automatically continue from where it left off
# No duplicate resources will be created
```

### GPU Pod Scheduling Issues

**Symptoms**: Pods stuck in `Pending` state
**Solution**: Check GPU node availability and resource requests

```bash
kubectl describe pods -n llm-d | grep -A 5 "Events:"
```

### Model Download Failures

**Symptoms**: Pods showing download errors
**Solution**: Verify HF_TOKEN is set correctly

```bash
kubectl logs -n llm-d -l app=decode
```

### Service Connectivity Issues

**Symptoms**: API requests failing
**Solution**: Check all pods are running and services are available

```bash
kubectl get pods -n llm-d
kubectl get svc -n llm-d
```

### Dashboard Not Appearing in Grafana

**Symptoms**: llm-d dashboard not visible in Grafana after deployment
**Solution**: Check dashboard ConfigMap and Grafana sidecar

```bash
# Check if dashboard ConfigMap exists
kubectl get configmap llm-d-dashboard -n llm-d-monitoring

# Check ConfigMap labels
kubectl get configmap llm-d-dashboard -n llm-d-monitoring -o yaml | grep grafana_dashboard

# If missing, re-run deployment with dashboard import
./deploy-with-monitoring.sh -g rtx-6000-ada -t your_hf_token
```

---

## Next Steps

Congratulations! You now have a working llm-d deployment on DigitalOcean Kubernetes. Your deployment includes:

✅ **DOKS Cluster**: With CPU and GPU nodes properly configured  
✅ **llm-d Services**: Prefill, decode, gateway, and Redis running  
✅ **GPU Support**: NVIDIA Device Plugin configured for GPU scheduling  
✅ **Working API**: Tested and confirmed LLM inference capability

### What You Can Do Next

- **Scale Your Deployment**: Add more GPU nodes or increase pod replicas
- **Deploy Different Models**: Use different model configurations
- **Monitor Performance**: Use Grafana dashboards to track metrics
- **Integrate with Applications**: Use the OpenAI-compatible API in your applications

### Cleanup (Optional)

When you're done experimenting, you have two cleanup options:

#### Option 1: Remove Only llm-d Components (Keep Cluster)

If you want to keep your DOKS cluster but remove llm-d components:

```bash
# Navigate back to the deployment directory
cd /path/to/llm-d-deployer/quickstart/infra/doks-digitalocean

# Remove llm-d components using the uninstall flag
./deploy-with-monitoring.sh -u
```

This will:

- Remove all llm-d pods and services
- Delete the llm-d namespace
- Remove monitoring components (if they were installed by llm-d)
- Keep your DOKS cluster and GPU nodes intact for future use

#### Option 2: Delete Entire Cluster

If you want to remove everything including the cluster:

```bash
# Delete the cluster (this will remove all resources)
doctl kubernetes cluster delete llm-d-cluster
```

**💡 Tip**: Use Option 1 if you plan to experiment with different llm-d configurations or other Kubernetes workloads on the same cluster. Use Option 2 for complete cleanup when you're finished with all experiments.

---

## Resources

- **llm-d Documentation**: [Official llm-d Docs](https://github.com/DigitalOcean/llm-d)
- **DigitalOcean Kubernetes**: [DOKS Documentation](https://docs.digitalocean.com/products/kubernetes/)
- **GPU Droplet Pricing**: [DigitalOcean GPU Pricing](https://www.digitalocean.com/pricing/gpu)

**Happy deploying with llm-d on Kubernetes!** 🚀
