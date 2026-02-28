from ultralytics import YOLO
import joblib
import pandas as pd
import cv2
import numpy as np

# load models
yolo = YOLO("models/best.pt")

weight_model = joblib.load(
    "models/weight_stacking_model.pkl"
)

encoder = joblib.load(
    "models/material_encoder.pkl"
)

EMISSION_FACTOR = {
    "plastic":2.5,
    "paper":1.3,
    "cardboard":1.1,
    "metal":8.5,
    "glass":1.2,
    "trash":2.0
}


def predict(image_path):

    img = cv2.imread(image_path)

    results = yolo(img)[0]

    output=[]

    for box in results.boxes:

        cls_id=int(box.cls)

        material=results.names[cls_id]

        x1,y1,x2,y2=map(int,box.xyxy[0])

        roi=img[y1:y2,x1:x2]

        gray=cv2.cvtColor(roi,cv2.COLOR_BGR2GRAY)

        _,thresh=cv2.threshold(
            gray,0,255,
            cv2.THRESH_BINARY+cv2.THRESH_OTSU
        )

        pixel_area=np.sum(thresh==255)

        norm_area=pixel_area/(roi.shape[0]*roi.shape[1])

        material_encoded=encoder.transform([material])[0]

        X=pd.DataFrame(
            [[pixel_area,norm_area,material_encoded]],
            columns=[
                "pixel_area",
                "normalized_area",
                "material_encoded"
            ]
        )

        weight=float(weight_model.predict(X)[0])

        carbon=weight/1000*EMISSION_FACTOR[material]

        output.append({

            "material":material,
            "confidence":float(box.conf),
            "weight_g":weight,
            "carbon_kg":carbon

        })

    return output