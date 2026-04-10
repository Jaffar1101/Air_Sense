
from fastapi import APIRouter
from services import hardware_service

router = APIRouter()

@router.get("/status")
def get_sensor_status():
    return hardware_service.get_hardware_status()

@router.get("/stream")
def get_sensor_stream():
    return hardware_service.get_live_readings()

@router.get("/run/current")
def get_current_run():
    return hardware_service.get_current_run_stats()

@router.get("/runs")
def get_run_history():
    return hardware_service.storage_service.get_run_history()

@router.get("/run/current/data")
def get_current_run_data():
    return hardware_service.get_current_run_raw_data()
