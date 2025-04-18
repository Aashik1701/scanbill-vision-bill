from ultralytics import YOLO
model = YOLO('public/models/yolov8n.pt')  # load the PyTorch model
model.export(format='onnx')  # export to ONNX format
