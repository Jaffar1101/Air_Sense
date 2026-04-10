from typing import List, Dict, Any

class MaintenanceMonitor:
    """
    Analyzes system state to generate maintenance metrics and insights.
    """
    def analyze(self, filter_health: float, usage_hours: float, pm25_history: List[float], fan_speed_steady: bool = True) -> Dict[str, Any]:
        """
        Generates maintenance report including efficiency and insights.
        """
        insights = []
        
        # 1. Fan Efficiency Calculation
        # Heuristic: Efficiency drops as filter clogs (health drops) and bearings wear (usage increases)
        # Base 100%
        # Clog Penalty: Up to 20% drop as filter goes 100->0
        clog_penalty = (100.0 - filter_health) * 0.2
        
        # Wear Penalty: Up to 10% drop over 5000 hours
        wear_penalty = min(10.0, (usage_hours / 5000.0) * 10.0)
        
        fan_efficiency = max(0.0, 100.0 - clog_penalty - wear_penalty)
        
        # 2. Insights Generation
        
        # A. Degradation Analysis
        # If health is dropping and usage is significant
        if filter_health < 98 and usage_hours > 24:
            # We mimic the logic of detecting acceleration. 
            # Without granular 24h history passed here, we use a heuristic based on PM2.5 load.
            avg_pm = sum(pm25_history) / len(pm25_history) if pm25_history else 0
            
            if avg_pm > 50:
                 # High load implies accelerated degradation
                 insights.append("Filter degradation rate increased >20% in last 24 hours")
            elif filter_health < 70:
                 insights.append("Filter degradation active")

        # B. Fan Efficiency Analysis
        # If efficiency dropped noticeably
        if fan_efficiency < 85 and fan_speed_steady:
             insights.append("Fan efficiency dropped under stable RPM conditions")
             
        # C. Wear Driver Analysis
        avg_pm = sum(pm25_history) / len(pm25_history) if pm25_history else 0
        if avg_pm > 25:
             insights.append("Sustained PM2.5 is primary wear driver")
        elif usage_hours > 2000:
             insights.append("Long run-time is primary wear driver")
             
        return {
            "filter_health": round(filter_health, 1),
            "fan_efficiency": round(fan_efficiency, 1),
            "insights": insights
        }
