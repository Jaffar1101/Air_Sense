import os
import json

class LLMReasoningEngine:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY") 
        self.mock_mode = not bool(self.api_key)
        if self.mock_mode:
            print("ReasoningEngine: No API key found. Using internal rule-based synthesis (Mock LLM).")
        else:
            print("ReasoningEngine: LLM API Key detected. Reasoning layer active.")

    def explain(self, agent_output):
        """
        Generates a human-friendly explanation of the agent's decision.
        
        Args:
            agent_output (dict): The full structured output from the agent.
            
        Returns:
            str: A natural language sentence explaining the 'Why'.
        """
        if self.mock_mode:
            return self._synthesize_local_explanation(agent_output)
        else:
            return self._call_real_llm(agent_output)

    def _synthesize_local_explanation(self, data):
        """
        Fallback method that works without an internet connection or API key.
        Constructs sentences dynamically based on data state.
        """
        # Extract features
        pm25 = data["status"]["current_air_quality_index"]
        pred_pm25 = data["status"]["predicted_next_hour_index"]
        spike = data["status"]["spike_warning"]
        speed = data["action"]["recommended_fan_speed"]
        filter_status = data["filter"]["status"]
        override = data.get("decision_confidence", 0) == 1.0 and "Manual" in data.get("decision_reason", "")

        # 1. Override Case
        if override:
            return f"I've set the fan to {speed} because manual override is active, ignoring sensor data."

        # 2. Critical Filter
        if "Critical" in filter_status or "Replace" in filter_status:
           return "I've minimized fan speed to prevent damage because the filter is critically exhausted. Please replace it immediately."

        # 3. Normal Operation Logic
        explanation = ""
        
        # Context
        if pm25 > 150:
            explanation += "The air is currently hazardous. "
        elif pm25 > 75:
            explanation += "Air quality is poor. "
        elif pm25 < 15:
            explanation += "The air is clean. "
            
        # Action Justification
        if speed == "HIGH":
            if spike:
                explanation += "I'm running the fan at High speed to preemptively clear the pollution spike predicted for the next hour."
            elif pm25 > 65: # Hysteresis logic usually keeps it high here
                explanation += "I'm maintaining High speed until the pollution levels drop significantly ensuring the room is fully cleared."
            else:
                 explanation += "I've activated maximum filtration to clear the current heavy load."
        elif speed == "MEDIUM":
            if spike:
                explanation += "I've bumped the fan to Medium ahead of time because I detect a rising pollution trend."
            else:
                explanation += "I'm running at Medium speed to balance noise and filtration for moderate pollution levels."
        elif speed == "LOW":
             explanation += "I'm keeping air circulating at Low speed to maintain freshness since quality is acceptable."
        elif speed == "OFF":
             explanation += "System is in energy-saving mode as the air quality is excellent."

        return explanation

    def _call_real_llm(self, data):
        """
        Placeholder for actual API call (e.g., OpenAI/Gemini).
        """
        # In a real implementation, you would use 'requests' here.
        # purely illustrative structure:
        prompt = f"""
        You are an AI interface for an Air Purifier. 
        Explain this system state to the user in one friendly sentence.
        
        State: {json.dumps(data)}
        """
        # response = requests.post(..., json={"prompt": prompt})
        # return response.text
        return "LLM API response would go here."
