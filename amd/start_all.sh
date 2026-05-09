#!/bin/bash
# Run this script on your AMD MI300X instance to start all 3 AI services
# Usage: bash start_all.sh

echo "========================================="
echo "  StyleSense AMD Services Startup"
echo "========================================="

# Kill any existing services on these ports
echo "Cleaning up old processes..."
fuser -k 8000/tcp 2>/dev/null
fuser -k 8001/tcp 2>/dev/null
fuser -k 8002/tcp 2>/dev/null
sleep 2

# Service 1 — Qwen2.5-VL-72B (Vision model, port 8000)
echo ""
echo "[1/3] Starting Qwen2.5-VL-72B vision model on port 8000..."
nohup python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-VL-72B-Instruct-AWQ \
  --port 8000 \
  --host 0.0.0.0 \
  --api-key token-amd-hackathon \
  --gpu-memory-utilization 0.45 \
  --max-model-len 4096 \
  > /var/log/vllm_vision.log 2>&1 &

VISION_PID=$!
echo "Vision model PID: $VISION_PID"
echo "Waiting 2 minutes for vision model to load..."
sleep 120

# Service 2 — Qwen2.5-72B (Agent model, port 8002)
echo ""
echo "[2/3] Starting Qwen2.5-72B agent model on port 8002..."
nohup python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-72B-Instruct-AWQ \
  --port 8002 \
  --host 0.0.0.0 \
  --api-key token-amd-hackathon \
  --gpu-memory-utilization 0.45 \
  --max-model-len 4096 \
  > /var/log/vllm_agent.log 2>&1 &

AGENT_PID=$!
echo "Agent model PID: $AGENT_PID"
echo "Waiting 2 minutes for agent model to load..."
sleep 120

# Service 3 — CLIP embedding service (port 8001)
echo ""
echo "[3/3] Starting CLIP embedding service on port 8001..."
nohup uvicorn clip_service:app \
  --host 0.0.0.0 \
  --port 8001 \
  > /var/log/clip.log 2>&1 &

CLIP_PID=$!
echo "CLIP service PID: $CLIP_PID"
sleep 10

# Health checks
echo ""
echo "========================================="
echo "  Running health checks..."
echo "========================================="

check_service() {
  local name=$1
  local url=$2
  if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
    echo "  ✓ $name is UP"
  else
    echo "  ✗ $name is NOT responding (may still be loading)"
  fi
}

check_service "CLIP (port 8001)"         "http://localhost:8001/health"
check_service "Vision model (port 8000)" "http://localhost:8000/v1/models"
check_service "Agent model (port 8002)"  "http://localhost:8002/v1/models"

echo ""
echo "Logs:"
echo "  Vision model : tail -f /var/log/vllm_vision.log"
echo "  Agent model  : tail -f /var/log/vllm_agent.log"
echo "  CLIP service : tail -f /var/log/clip.log"
echo ""
echo "All services started. Your AMD instance IP: $(curl -s ifconfig.me)"
echo "Update AMD_INSTANCE_IP in your .env file with the IP above."
