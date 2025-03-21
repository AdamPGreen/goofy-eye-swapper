
# Face Detection Models

This directory is used for storing face-api.js models. The application will automatically fall back to using CDN-hosted models if local models are not found.

## Model Files

The application requires the following models:
- ssd_mobilenetv1 (instead of tiny_face_detector)
- face_landmark_68

## Using Local Models (Optional)

For better performance and offline capability, you can download the required models from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

After downloading, place the model files in this directory with the following structure:
```
/public/models/
  ├── ssd_mobilenetv1_model-shard1
  ├── ssd_mobilenetv1_model-shard2
  ├── ssd_mobilenetv1_model-weights_manifest.json
  ├── face_landmark_68_model-shard1
  └── face_landmark_68_model-weights_manifest.json
```

If local models are not found, the application will automatically use models hosted on a CDN.
