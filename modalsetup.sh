#!/bin/bash
REC_MODEL_URL="https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/PP-OCRv5_mobile_det_infer.tar"
DET_MODEL_URL="https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0//PP-OCRv5_mobile_rec_infer.tar"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/PaddleOcrModal"

echo "Dir $TARGET_DIR does not exists, continuing..."
mkdir -p "$TARGET_DIR"

REC_TAR="rec_model.tar"
DET_TAR="det_model.tar"

echo "Downloading recognition model..."
curl -L "$REC_MODEL_URL" -o "$REC_TAR"

echo "Downloading detection model..."
curl -L "$DET_MODEL_URL" -o "$DET_TAR"

echo "Extracting recognition model..."
tar -xf "$REC_TAR"

echo "Extracting detection model..."
tar -xf "$DET_TAR"

REC_FOLDER=$(tar -tf "$REC_TAR" | head -1 | cut -f1 -d"/")
DET_FOLDER=$(tar -tf "$DET_TAR" | head -1 | cut -f1 -d"/")

echo "Moving models to $TARGET_DIR..."
mv "$REC_FOLDER" "$TARGET_DIR/"
mv "$DET_FOLDER" "$TARGET_DIR/"

rm "$REC_TAR" "$DET_TAR"

echo "PaddleOCR models are in $TARGET_DIR"