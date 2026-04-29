import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta

def predict(server_id, n_points=12):
    np.random.seed(server_id * 7)
    n_history = 60
    t = np.arange(n_history)

    cpu_history = (
        40 + 20 * np.sin(t * 0.3 + server_id) +
        10 * np.sin(t * 0.1) +
        np.random.normal(0, 5, n_history)
    ).clip(5, 95)

    mem_history = (
        50 + 15 * np.sin(t * 0.2 + server_id * 0.5) +
        8 * np.cos(t * 0.15) +
        np.random.normal(0, 4, n_history)
    ).clip(10, 90)

    X = t.reshape(-1, 1)

    cpu_model = RandomForestRegressor(n_estimators=30, random_state=42)
    cpu_model.fit(X, cpu_history)

    mem_model = RandomForestRegressor(n_estimators=30, random_state=42)
    mem_model.fit(X, mem_history)

    future_t = np.arange(n_history, n_history + n_points).reshape(-1, 1)
    cpu_preds = cpu_model.predict(future_t).clip(5, 95)
    mem_preds = mem_model.predict(future_t).clip(10, 90)

    base_time = datetime.now()
    results = []
    for i in range(n_points):
        confidence = max(60, 95 - i * 2.5)
        results.append({
            "time": (base_time + timedelta(minutes=i * 5)).strftime("%H:%M"),
            "cpu_predicted": round(float(cpu_preds[i]), 1),
            "mem_predicted": round(float(mem_preds[i]), 1),
            "confidence": round(confidence, 1)
        })

    return results
