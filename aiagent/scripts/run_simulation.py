from air_quality_agent.agent import AirQualityAgent
import time

def main():
    agent = AirQualityAgent()
    
    # Test Scenarios
    scenarios = [
        {
            "name": "Morning Clean Air (Baseline)", 
            "data": {"pm25": 15, "hour": 6, "usage_hours": 100}
        },
        {
            "name": "Rapidly Rising Pollution (Trend Detection)",
            # History shows sharp rise 20 -> 50. Should trigger proactive response.
            "data": {
                "pm25": 50, 
                "hour": 8, 
                "usage_hours": 105, 
                "history_pm25": [20, 30, 40, 50],
                "current_fan_speed": "LOW"
            }
        },
        {
            "name": "Hysteresis Check (Prevent Dropping Speed)",
            # PM2.5 is 70 (Below High threshold of 75), BUT we are already at HIGH.
            # Should stay HIGH because 70 > 65 (Downgrade threshold).
            "data": {
                "pm25": 70, 
                "hour": 19, 
                "usage_hours": 500,
                "current_fan_speed": "HIGH" 
            }
        },
        {
            "name": "Manual Override (User Force OFF)",
            "data": {
                "pm25": 150, # Hazardous!
                "hour": 20, 
                "usage_hours": 500,
                "override": {"active": True, "speed": "OFF"}
            }
        }
    ]
    
    print("\n--- STARTING AGENT SIMULATION ---\n")
    
    for scenario in scenarios:
        print(f"Scenario: {scenario['name']}")
        print(f"Inputs: {scenario['data']}")
        
        # Run Agent
        result_json = agent.get_json(scenario['data'])
        print("Agent Output:")
        print(result_json)
        print("-" * 30 + "\n")

if __name__ == "__main__":
    main()
